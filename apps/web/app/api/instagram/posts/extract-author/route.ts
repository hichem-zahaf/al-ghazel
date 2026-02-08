import { NextRequest, NextResponse } from 'next/server';
import { readFile, writeFile } from 'fs/promises';
import { join } from 'path';

const POSTS_DIR = join(process.cwd(), 'data/posts');
const OLLAMA_API = 'http://localhost:11434/api';
const OLLAMA_MODEL = 'qwen2.5:1.5b-instruct-q4_K_M';

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
}

interface OllamaResponse {
  response: string;
  done: boolean;
}

// Extract author using Ollama
async function extractAuthorFromCaption(caption: string): Promise<string | null> {
  try {
    const prompt = `Extract the author name from the following book post caption. If no author is detected, return null. Most posts are in Arabic, so return the author name in Arabic if found.

Caption: ${caption}

Return only the author name or null, nothing else. Do not include any explanation.`;

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

    // Check if the result is null, empty, or indicates no author found
    if (!result || result.toLowerCase() === 'null' || result.toLowerCase() === 'no author') {
      return null;
    }

    // Clean up the result - remove quotes, extra whitespace
    const cleaned = result.replace(/^["']|["']$/g, '').trim();

    return cleaned || null;
  } catch (error) {
    console.error('Failed to extract author:', error);
    return null;
  }
}

// POST /api/instagram/posts/extract-author - Extract author from captions using Ollama
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { postCodes } = body;

    if (!Array.isArray(postCodes) || postCodes.length === 0) {
      return NextResponse.json({ error: 'No posts selected' }, { status: 400 });
    }

    const updatedPosts: Array<{ code: string; author: string | null }> = [];
    const errors: { code: string; error: string }[] = [];

    for (const code of postCodes) {
      try {
        const filePath = join(POSTS_DIR, `${code}.json`);
        const content = await readFile(filePath, 'utf-8');
        const post: PostData = JSON.parse(content);

        // Extract author using Ollama
        const author = await extractAuthorFromCaption(post.caption.text);

        if (author) {
          post.author = author;

          // Save the updated post
          await writeFile(filePath, JSON.stringify(post, null, 2), 'utf-8');
          updatedPosts.push({ code, author });
        } else {
          updatedPosts.push({ code, author: null });
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
      { error: error instanceof Error ? error.message : 'Failed to extract author' },
      { status: 500 }
    );
  }
}
