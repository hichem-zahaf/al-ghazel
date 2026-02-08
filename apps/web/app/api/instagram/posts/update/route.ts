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
  title?: string;
}

// POST /api/instagram/posts/update - Update post fields
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { code, caption, author, title } = body;

    if (!code) {
      return NextResponse.json({ error: 'Post code is required' }, { status: 400 });
    }

    const filePath = join(POSTS_DIR, `${code}.json`);

    // Read existing post
    const content = await readFile(filePath, 'utf-8');
    const post: PostData = JSON.parse(content);

    // Update fields
    if (caption !== undefined) {
      post.caption.text = caption;
    }
    if (author !== undefined) {
      if (author) {
        post.author = author;
      } else {
        delete post.author;
      }
    }
    if (title !== undefined) {
      if (title) {
        post.title = title;
      } else {
        delete post.title;
      }
    }

    // Save updated post
    await writeFile(filePath, JSON.stringify(post, null, 2), 'utf-8');

    return NextResponse.json({
      success: true,
      post,
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to update post' },
      { status: 500 }
    );
  }
}
