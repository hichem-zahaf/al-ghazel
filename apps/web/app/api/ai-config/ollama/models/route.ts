import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';

// Ollama model interface
interface OllamaModel {
  name: string;
  modified_at: string;
  size: number;
}

interface OllamaModelsResponse {
  models: OllamaModel[];
}

// GET /api/ai-config/ollama/models - Fetch available Ollama models from a URL
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const url = searchParams.get('url');

    if (!url) {
      return NextResponse.json(
        { error: 'URL parameter is required' },
        { status: 400 }
      );
    }

    // Validate URL format
    let validUrl: URL;
    try {
      validUrl = new URL(url);
    } catch {
      return NextResponse.json(
        { error: 'Invalid URL format' },
        { status: 400 }
      );
    }

    // Only allow http/https
    if (!['http:', 'https:'].includes(validUrl.protocol)) {
      return NextResponse.json(
        { error: 'Only HTTP and HTTPS protocols are allowed' },
        { status: 400 }
      );
    }

    // Ensure the URL ends with /api/tags for Ollama API
    const apiUrl = validUrl.pathname.endsWith('/api/tags')
      ? validUrl.toString()
      : new URL('/api/tags', validUrl).toString();

    // Fetch models from Ollama
    const response = await fetch(apiUrl, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
      // Add timeout to prevent hanging
      signal: AbortSignal.timeout(10000),
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: `Ollama API returned status ${response.status}` },
        { status: 400 }
      );
    }

    const data = (await response.json()) as OllamaModelsResponse;

    // Extract model names
    const models = data.models?.map((model) => model.name) || [];

    return NextResponse.json({
      models,
      count: models.length,
    });
  } catch (error) {
    // Handle timeout specifically
    if (error instanceof Error && error.name === 'AbortError') {
      return NextResponse.json(
        { error: 'Connection timeout. Please check if the Ollama server is running.' },
        { status: 408 }
      );
    }

    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch models from Ollama' },
      { status: 500 }
    );
  }
}
