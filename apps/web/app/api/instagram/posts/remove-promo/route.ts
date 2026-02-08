import { NextRequest, NextResponse } from 'next/server';
import { readFile, writeFile } from 'fs/promises';
import { join } from 'path';

const POSTS_DIR = join(process.cwd(), 'data/posts');

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

// POST /api/instagram/posts/remove-promo - Remove text from post captions
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { postCodes, textToRemove } = body;

    if (!Array.isArray(postCodes) || postCodes.length === 0) {
      return NextResponse.json({ error: 'No posts selected' }, { status: 400 });
    }

    if (!textToRemove || typeof textToRemove !== 'string') {
      return NextResponse.json({ error: 'Text to remove is required' }, { status: 400 });
    }

    const updatedPosts: string[] = [];
    const errors: { code: string; error: string }[] = [];

    for (const code of postCodes) {
      try {
        const filePath = join(POSTS_DIR, `${code}.json`);
        const content = await readFile(filePath, 'utf-8');
        const post: PostData = JSON.parse(content);

        // Remove the text from caption
        const originalText = post.caption.text;
        post.caption.text = originalText.replace(new RegExp(textToRemove, 'g'), '').trim();

        // Save the updated post
        await writeFile(filePath, JSON.stringify(post, null, 2), 'utf-8');
        updatedPosts.push(code);
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
      { error: error instanceof Error ? error.message : 'Failed to remove promo text' },
      { status: 500 }
    );
  }
}
