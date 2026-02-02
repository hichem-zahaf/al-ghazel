import { NextRequest } from 'next/server';
import { getSupabaseServerClient } from '@kit/supabase/server-client';

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
      .eq('user_id', user.id)
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

    // Use the credit
    await useCredit(supabase, account.id);

    // Create a streaming response
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        try {
          // TODO: Implement actual LangChain streaming here
          // For now, we'll simulate a response

          const sendChunk = (chunk: string) => {
            controller.enqueue(encoder.encode(`data: ${JSON.stringify({ content: chunk })}\n\n`));
          };

          // Simulate AI thinking and typing
          await new Promise(resolve => setTimeout(resolve, 500));
          sendChunk("I'd be happy to help you find books! ");
          await new Promise(resolve => setTimeout(resolve, 200));
          sendChunk("Let me search our database for recommendations. ");
          await new Promise(resolve => setTimeout(resolve, 300));

          // Search for books based on the message
          const searchResults = await searchBooks(supabase, message, 5, 0);

          if (searchResults.books.length > 0) {
            sendChunk(`I found ${searchResults.books.length} books that might interest you! `);

            // Format book data for the client tool
            const booksData = searchResults.books.map((book: any) => ({
              id: book.id,
              title: book.title,
              subtitle: book.subtitle,
              description: book.description,
              price: book.price,
              cover_image_url: book.cover_image_url,
              authors: book.authors,
              categories: book.categories,
            }));

            // Send tool call to display books
            controller.enqueue(encoder.encode(`data: ${JSON.stringify({
              toolCall: {
                name: 'display_books',
                args: { books: booksData }
              }
            })}\n\n`));

            sendChunk(`Here are some recommendations based on "${message}". Feel free to ask me more about any of these books or search for something else!`);
          } else {
            sendChunk("I couldn't find any books matching that description. Try searching with different keywords or ask me about a specific genre or author!");
          }

          // Send done signal
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ done: true })}\n\n`));

          // Save to chat history
          const adminSupabase = getSupabaseServerClient();
          await adminSupabase.from('ai_chat_history').insert([
            {
              account_id: account.id,
              session_id: sessionId || crypto.randomUUID(),
              role: 'user',
              content: message,
            },
            {
              account_id: account.id,
              session_id: sessionId || crypto.randomUUID(),
              role: 'assistant',
              content: `AI response for: ${message}`,
              recommended_books: searchResults.books || [],
            },
          ]);

          controller.close();
        } catch (error) {
          console.error('Streaming error:', error);
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
      .eq('user_id', user.id)
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
