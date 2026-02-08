import { NextRequest, NextResponse } from 'next/server';
import { readdir, readFile } from 'fs/promises';
import { join } from 'path';

const POSTS_DIR = join(process.cwd(), 'data/posts');

// GET /api/instagram/posts - Load posts with pagination
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '12', 10);

    // Read all post files
    const files = await readdir(POSTS_DIR);
    const jsonFiles = files.filter(f => f.endsWith('.json'));

    // Sort files by modification time (newest first)
    const postsWithData = await Promise.all(
      jsonFiles.map(async (filename) => {
        const filePath = join(POSTS_DIR, filename);
        const content = await readFile(filePath, 'utf-8');
        const data = JSON.parse(content);
        return { ...data, filename };
      })
    );

    // Sort by pk (which is somewhat chronological)
    postsWithData.sort((a, b) => b.pk.localeCompare(a.pk));

    // Pagination
    const start = (page - 1) * limit;
    const end = start + limit;
    const paginatedPosts = postsWithData.slice(start, end);

    return NextResponse.json({
      posts: paginatedPosts,
      total: postsWithData.length,
      page,
      limit,
      hasMore: end < postsWithData.length,
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to load posts' },
      { status: 500 }
    );
  }
}
