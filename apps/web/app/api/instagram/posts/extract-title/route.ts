import { NextRequest, NextResponse } from 'next/server';
import { readFile, writeFile } from 'fs/promises';
import { join } from 'path';

const POSTS_DIR = join(process.cwd(), 'data/posts');
const OLLAMA_API = 'http://localhost:11434/api';
const OLLAMA_MODEL = 'gpt-oss:20b';

interface PostData {
  code: string;
  pk: string;
  id: string;
  caption: {
    text: string;
  };
  image: {
    url: string;
    width: number;
    height: number;
  };
  author?: string;
  title?: string;
}

interface OllamaResponse {
  response: string;
  done: boolean;
}

// Extract title using Ollama
async function extractTitleFromCaption(caption: string): Promise<string | null> {
  try {
    const prompt = `Extract the book title from the following book post caption. If no title is detected, return null. Most posts are in Arabic, so return the book title in Arabic if found.

Caption: ${caption}

Return only the book title or null, nothing else. Do not include any explanation.`;

    const response = await fetch(`${OLLAMA_API}/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: OLLAMA_MODEL,
        prompt,
        stream: false,
      }),
    });

    if (!response.ok) {
      console.error('Ollama API error:', response.status, response.statusText);
      return null;
    }

    const data: OllamaResponse = await response.json();
    const result = data.response.trim();

    // Check if the result is null, empty, or indicates no title found
    if (!result || result.toLowerCase() === 'null' || result.toLowerCase() === 'no title') {
      return null;
    }

    // Clean up the result - remove quotes, extra whitespace
    const cleaned = result.replace(/^["']|["']$/g, '').trim();

    return cleaned || null;
  } catch (error) {
    console.error('Failed to extract title:', error);
    return null;
  }
}

// POST /api/instagram/posts/extract-title - Extract title from captions using Ollama
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { postCodes } = body;

    if (!Array.isArray(postCodes) || postCodes.length === 0) {
      return NextResponse.json({ error: 'No posts selected' }, { status: 400 });
    }

    const updatedPosts: Array<{ code: string; title: string | null }> = [];
    const errors: { code: string; error: string }[] = [];

    for (const code of postCodes) {
      try {
        const filePath = join(POSTS_DIR, `${code}.json`);
        const content = await readFile(filePath, 'utf-8');
        const post: PostData = JSON.parse(content);

        // Extract title using Ollama
        const title = await extractTitleFromCaption(post.caption.text);

        if (title) {
          post.title = title;

          // Save the updated post
          await writeFile(filePath, JSON.stringify(post, null, 2), 'utf-8');
          updatedPosts.push({ code, title });
        } else {
          updatedPosts.push({ code, title: null });
        }
      } catch (error) {
        errors.push({
          code,
          error: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    }

    return NextResponse.json({
      success: true,
      updatedPosts,
      errors,
      total: postCodes.length,
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to extract title' },
      { status: 500 }
    );
  }
}
