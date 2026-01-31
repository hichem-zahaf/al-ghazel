import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServerClient } from '@kit/supabase/server-client';
import type { Database } from '~/lib/database.types';

type Book = Database['public']['Tables']['books']['Row'];
type BookInsert = Database['public']['Tables']['books']['Insert'];
type BookUpdate = Database['public']['Tables']['books']['Update'];

// GET /api/books - Fetch all books with author data
export async function GET(request: NextRequest) {
  try {
    const supabase = getSupabaseServerClient();

    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search');
    const status = searchParams.get('status');
    const authorId = searchParams.get('author_id');
    const isFeatured = searchParams.get('is_featured');
    const isBestseller = searchParams.get('is_bestseller');

    let query = supabase
      .from('books')
      .select(`
        *,
        authors (
          id,
          name
        )
      `)
      .order('created_at', { ascending: false });

    // Apply filters
    if (search) {
      query = query.or(`title.ilike.%${search}%,subtitle.ilike.%${search}%,isbn.ilike.%${search}%`);
    }
    if (status) {
      query = query.eq('status', status);
    }
    if (authorId) {
      query = query.eq('author_id', authorId);
    }
    if (isFeatured === 'true') {
      query = query.eq('is_featured', true);
    }
    if (isBestseller === 'true') {
      query = query.eq('is_bestseller', true);
    }

    const { data, error } = await query;

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ data });
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST /api/books - Create a new book
export async function POST(request: NextRequest) {
  try {
    const supabase = getSupabaseServerClient();
    const body: BookInsert = await request.json();

    const { data, error } = await supabase
      .from('books')
      .insert(body)
      .select(`
        *,
        authors (
          id,
          name
        )
      `)
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ data }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
