import { NextRequest, NextResponse } from 'next/server';
import { unlink } from 'fs/promises';
import { join } from 'path';

const POSTS_DIR = join(process.cwd(), 'data/posts');

// POST /api/instagram/posts/delete - Delete post files
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { postCodes } = body;

    if (!Array.isArray(postCodes) || postCodes.length === 0) {
      return NextResponse.json({ error: 'No posts selected' }, { status: 400 });
    }

    const deletedPosts: string[] = [];
    const errors: { code: string; error: string }[] = [];

    for (const code of postCodes) {
      try {
        const filePath = join(POSTS_DIR, `${code}.json`);
        await unlink(filePath);
        deletedPosts.push(code);
      } catch (error) {
        errors.push({
          code,
          error: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    }

    return NextResponse.json({
      success: true,
      deletedPosts,
      errors,
      total: postCodes.length,
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to delete posts' },
      { status: 500 }
    );
  }
}
