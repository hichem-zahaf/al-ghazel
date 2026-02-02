import { NextRequest, NextResponse } from 'next/server';

// Provider model catalogs
const PROVIDER_CATALOGS: Record<string, { completion: string[]; embedding: string[] }> = {
  openai: {
    completion: [
      'gpt-4o-mini',
      'gpt-4o',
      'gpt-3.5-turbo',
      'gpt-4-turbo',
      'gpt-4',
    ],
    embedding: [
      'text-embedding-3-small',
      'text-embedding-3-large',
      'text-embedding-ada-002',
    ],
  },
  openrouter: {
    completion: [
      'anthropic/claude-3-haiku',
      'anthropic/claude-3-sonnet',
      'anthropic/claude-3-opus',
      'anthropic/claude-3.5-sonnet',
      'google/gemini-flash-1.5',
      'google/gemini-pro-1.5',
      'meta-llama/llama-3-8b',
      'meta-llama/llama-3-70b',
      'meta-llama/llama-3.1-8b',
      'meta-llama/llama-3.1-70b',
      'mistralai/mistral-7b',
      'mistralai/mistral-large',
      'openai/gpt-4o-mini',
      'openai/gpt-4o',
      'deepseek/deepseek-chat',
      'deepseek/deepseek-coder',
    ],
    embedding: [
      'openai/text-embedding-3-small',
      'openai/text-embedding-3-large',
      'openai/text-embedding-ada-002',
      'cohere/embed-english-v3.0',
      'cohere/embed-multilingual-v3.0',
    ],
  },
  deepseek: {
    completion: [
      'deepseek-chat',
      'deepseek-coder',
    ],
    embedding: [], // Uses OpenAI embeddings as fallback
  },
  zai: {
    completion: [
      'zai-model',
    ],
    embedding: [], // Uses OpenAI embeddings as fallback
  },
  ollama: {
    completion: [], // Dynamically fetched
    embedding: [], // Dynamically fetched
  },
};

// GET /api/ai-config/providers/:provider/models
export async function GET(
  request: NextRequest,
  { params }: { params: { provider: string } }
) {
  try {
    const { provider } = params;

    // Validate provider
    if (!['openai', 'openrouter', 'deepseek', 'zai', 'ollama'].includes(provider)) {
      return NextResponse.json(
        { error: `Invalid provider: ${provider}` },
        { status: 400 }
      );
    }

    // For Ollama, fetch models dynamically from configured URL
    if (provider === 'ollama') {
      // Get AI config to find Ollama URL
      const aiConfigResponse = await fetch(
        new URL('/api/ai-config', request.url),
        {
          cache: 'no-store',
        }
      );

      if (!aiConfigResponse.ok) {
        return NextResponse.json(
          { error: 'Failed to fetch AI config' },
          { status: 500 }
        );
      }

      const aiConfigData = await aiConfigResponse.json();
      const ollamaUrl = aiConfigData.data?.ollama_url || 'http://localhost:11434';

      try {
        // Fetch models from Ollama
        const ollamaResponse = await fetch(`${ollamaUrl}/api/tags`, {
          signal: AbortSignal.timeout(5000), // 5 second timeout
        });

        if (!ollamaResponse.ok) {
          throw new Error('Failed to fetch Ollama models');
        }

        const ollamaData = await ollamaResponse.json();
        const models = ollamaData?.models || [];

        // Extract model names
        const modelNames = models.map((m: { name: string }) => m.name);

        return NextResponse.json({
          provider,
          completion: modelNames,
          embedding: modelNames, // Ollama models can be used for both
        });
      } catch (error) {
        // If Ollama is unreachable, return empty lists with a warning
        return NextResponse.json({
          provider,
          completion: [],
          embedding: [],
          warning: 'Could not connect to Ollama. Please check the URL and ensure Ollama is running.',
        });
      }
    }

    // For static providers, return catalog
    const catalog = PROVIDER_CATALOGS[provider];

    return NextResponse.json({
      provider,
      completion: catalog?.completion || [],
      embedding: catalog?.embedding || [],
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
