import { NextRequest } from 'next/server';
import { getSupabaseServerClient } from '@kit/supabase/server-client';
import { ChatOpenAI } from '@langchain/openai';
import { HumanMessage, SystemMessage, BaseMessage } from '@langchain/core/messages';
import { DynamicStructuredTool } from '@langchain/core/tools';
import { z } from 'zod';

// Check if user has credits
async function checkUserCredits(supabase: any, accountId: string): Promise<{ allowed: boolean; is_admin: boolean; credits_used?: number; credits_limit?: number }> {
  // Check if user is admin
  const { data: isAdmin } = await supabase
    .rpc('get_user_ai_credits', { p_account_id: accountId });

  const is_admin = isAdmin?.[0]?.is_admin || false;

  if (is_admin) {
    return { allowed: true, is_admin: true };
  }

  const credits = isAdmin?.[0];
  const creditLimit = credits?.credits_limit || 0;

  // If limit is 0, it means unlimited
  if (creditLimit === 0) {
    return { allowed: true, is_admin: false, credits_used: credits?.credits_used || 0, credits_limit: 0 };
  }

  if ((credits?.credits_used || 0) >= creditLimit) {
    return { allowed: false, is_admin: false, credits_used: credits?.credits_used || 0, credits_limit: creditLimit };
  }

  return { allowed: true, is_admin: false, credits_used: credits?.credits_used || 0, credits_limit: creditLimit };
}

// Use a credit
async function useCredit(supabase: any, accountId: string): Promise<boolean> {
  const { data } = await supabase.rpc('use_ai_credits', { p_account_id: accountId, p_amount: 1 });
  return data || false;
}

// Search books for the AI tool
async function searchBooks(supabase: any, query: string, limit = 10, offset = 0) {
  const { data, error } = await supabase
    .from('books')
    .select('id, title, subtitle, description, price, cover_image_url, authors(name), categories(name, slug)')
    .or(`title.ilike.%${query}%,description.ilike.%${query}%,subtitle.ilike.%${query}%`)
    .range(offset, offset + limit - 1)
    .limit(limit);

  if (error) {
    console.error('Book search error:', error);
    return { books: [] };
  }

  return { books: data || [] };
}

// Semantic search using embeddings
async function semanticSearchBooks(supabase: any, queryEmbedding: number[], limit = 10) {
  const { data, error } = await supabase.rpc('match_books', {
    query_embedding: JSON.stringify(queryEmbedding),
    match_threshold: 0.75,
    match_count: limit
  });

  if (error) {
    console.error('Semantic search error:', error);
    return { books: [] };
  }

  return { books: data || [] };
}

// Get the LLM instance based on provider configuration
function getLLMInstance(
  deploymentType: string,
  provider: string | null,
  model: string,
  apiKey: string | null,
  temperature: number = 0.7,
  ollamaUrl?: string | null
) {
  const configuration: Record<string, any> = {
    modelName: model,
    temperature,
    streaming: true,
  };

  // Configure API base URL and key based on provider
  switch (provider) {
    case 'openai':
      configuration.apiKey = apiKey || process.env.NEXT_PUBLIC_OPENAI_API_KEY || process.env.OPENAI_API_KEY;
      configuration.configuration = {
        baseURL: 'https://api.openai.com/v1',
      };
      break;

    case 'openrouter':
      configuration.apiKey = apiKey || process.env.OPENROUTER_API_KEY;
      configuration.configuration = {
        baseURL: 'https://openrouter.ai/api/v1',
      };
      break;

    case 'deepseek':
      configuration.apiKey = apiKey || process.env.DEEPSEEK_API_KEY;
      configuration.configuration = {
        baseURL: 'https://api.deepseek.com/v1',
      };
      break;

    case 'zai':
      configuration.apiKey = apiKey || process.env.ZAI_API_KEY;
      // Zai might use OpenAI-compatible format - adjust base URL as needed
      configuration.configuration = {
        baseURL: process.env.NEXT_ZAI_API_URL || 'https://api.zai.ai/v1',
      };
      break;

    case 'ollama':
      configuration.apiKey = 'ollama'; // Ollama doesn't require a key
      configuration.configuration = {
        baseURL: ollamaUrl || process.env.OLLAMA_URL || 'http://localhost:11434/v1',
      };
      break;

    default:
      configuration.apiKey = process.env.OPENAI_API_KEY;
  }

  return new ChatOpenAI(configuration);
}

// POST /api/ai/chat - Streaming AI chat
export async function POST(request: NextRequest) {
  const supabase = getSupabaseServerClient();

  try {
    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return new Response(JSON.stringify({ error: 'Unauthorized. Please login to use AI chat.' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Get account_id
    const { data: account } = await supabase
      .from('accounts')
      .select('id')
      .eq('id', user.id)
      .single();

    if (!account) {
      return new Response(JSON.stringify({ error: 'Account not found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Check credits
    const creditCheck = await checkUserCredits(supabase, account.id);
    if (!creditCheck.allowed) {
      return new Response(JSON.stringify({
        error: 'Insufficient credits',
        credits_used: creditCheck.credits_used,
        credits_limit: creditCheck.credits_limit,
      }), {
        status: 429,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const body = await request.json();
    const { message, sessionId } = body;

    if (!message || typeof message !== 'string') {
      return new Response(JSON.stringify({ error: 'Message is required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Get AI configuration
    const { data: aiConfig, error: configError } = await supabase
      .from('ai_config')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (configError || !aiConfig) {
      return new Response(JSON.stringify({ error: 'AI configuration not found' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Check if AI features are enabled
    if (!aiConfig.enable_user_access) {
      return new Response(JSON.stringify({ error: 'AI chat is currently disabled' }), {
        status: 503,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Get the completion model for the current provider
    let completionModel = aiConfig.model;
    const config = aiConfig.config as { providers?: Record<string, { completion_model?: string; embedding_model?: string }> } || {};
    if (aiConfig.deployment_type === 'cloud' && aiConfig.cloud_provider) {
      const providerConfig = config.providers?.[aiConfig.cloud_provider];
      if (providerConfig?.completion_model) {
        completionModel = providerConfig.completion_model;
      }
    } else if (aiConfig.deployment_type === 'local' && aiConfig.ollama_model) {
      completionModel = aiConfig.ollama_model;
    }

    // Use the credit
    await useCredit(supabase, account.id);

    // Create the book search tool
    const searchBooksTool = new DynamicStructuredTool({
      name: 'search_books',
      description: 'Search for books in the bookstore catalog. Use this when users ask for book recommendations, want to find books by author, genre, or topic.',
      schema: z.object({
        query: z.string().describe('The search query to find books (title, author, genre, topic, etc.)'),
        limit: z.number().optional().default(5).describe('Maximum number of books to return (default: 5)'),
      }),
      func: async ({ query, limit = 5 }) => {
        const results = await searchBooks(supabase, query, limit, 0);
        return JSON.stringify({
          books: results.books.map((book: any) => ({
            id: book.id,
            title: book.title,
            subtitle: book.subtitle,
            description: book.description,
            price: book.price,
            cover_image_url: book.cover_image_url,
            authors: book.authors,
            categories: book.categories,
          }))
        });
      },
    });

    // Get LLM instance
    const llm = getLLMInstance(
      aiConfig.deployment_type,
      aiConfig.deployment_type === 'cloud' ? aiConfig.cloud_provider : aiConfig.local_provider,
      completionModel || 'gpt-4o-mini',
      aiConfig.api_key,
      aiConfig.temperature ?? 0.7,
      aiConfig.ollama_url // Pass configured Ollama URL for local deployment
    );

    // Create system prompt
    const systemPrompt = aiConfig.system_prompt || 'You are a helpful AI assistant for a bookstore. Provide personalized book recommendations and help users discover their next great read.';

    // Create messages
    const messages: BaseMessage[] = [
      new SystemMessage(systemPrompt),
      new HumanMessage(message),
    ];

    // Bind tools to LLM
    const llmWithTools = llm.bindTools([searchBooksTool]);

    // Create streaming response
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        try {
          let accumulatedContent = '';
          let toolResults: any = null;
          let hasCalledTool = false;

          // Stream the response
          const streamResult = await llmWithTools.stream(messages);

          for await (const chunk of streamResult) {
            // Check if this is a tool call
            if (chunk.tool_calls && chunk.tool_calls.length > 0) {
              hasCalledTool = true;
              for (const toolCall of chunk.tool_calls) {
                if (toolCall.name === 'search_books') {
                  try {
                    // toolCall.args can be a string or object
                    const args = typeof toolCall.args === 'string'
                      ? JSON.parse(toolCall.args)
                      : toolCall.args;
                    const result = await searchBooksTool.func(args);
                    toolResults = JSON.parse(result);

                    // Send tool call to client
                    controller.enqueue(encoder.encode(`data: ${JSON.stringify({
                      toolCall: {
                        name: 'display_books',
                        args: { books: toolResults.books }
                      }
                    })}\n\n`));
                  } catch (error) {
                    console.error('Tool execution error:', error);
                  }
                }
              }
            } else if (chunk.content) {
              const content = typeof chunk.content === 'string' ? chunk.content : '';
              accumulatedContent += content;

              // Send content chunk to client
              controller.enqueue(encoder.encode(`data: ${JSON.stringify({ content })}\n\n`));
            }
          }

          // Send done signal
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ done: true })}\n\n`));

          // Save to chat history
          const adminSupabase = getSupabaseServerClient();
          const session = sessionId || crypto.randomUUID();

          await adminSupabase.from('ai_chat_history').insert([
            {
              account_id: account.id,
              session_id: session,
              role: 'user',
              content: message,
              metadata: {
                provider: aiConfig.deployment_type === 'cloud' ? aiConfig.cloud_provider : aiConfig.local_provider,
                model: completionModel,
              },
            },
            {
              account_id: account.id,
              session_id: session,
              role: 'assistant',
              content: accumulatedContent || `AI response for: ${message}`,
              recommended_books: toolResults?.books || [],
              metadata: {
                provider: aiConfig.deployment_type === 'cloud' ? aiConfig.cloud_provider : aiConfig.local_provider,
                model: completionModel,
                tool_called: hasCalledTool,
              },
            },
          ]);

          controller.close();
        } catch (error) {
          console.error('Streaming error:', error);

          // Send error message to client
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({
            error: 'Failed to process chat message. Please try again.',
            done: true
          })}\n\n`));

          controller.error(error);
        }
      },
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });

  } catch (error) {
    console.error('AI chat error:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}

// GET /api/ai/chat - Get credits info
export async function GET(request: NextRequest) {
  const supabase = getSupabaseServerClient();

  try {
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const { data: account } = await supabase
      .from('accounts')
      .select('id')
      .eq('id', user.id)
      .single();

    if (!account) {
      return new Response(JSON.stringify({ error: 'Account not found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const { data: credits } = await supabase.rpc('get_user_ai_credits', { p_account_id: account.id });
    const creditData = credits?.[0] || { credits_used: 0, credits_limit: 10, is_admin: false };

    return new Response(JSON.stringify({
      credits_used: creditData.credits_used,
      credits_limit: creditData.credits_limit,
      is_admin: creditData.is_admin,
      remaining: creditData.credits_limit === 0 ? 'unlimited' : Math.max(0, creditData.credits_limit - creditData.credits_used),
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Credits fetch error:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
