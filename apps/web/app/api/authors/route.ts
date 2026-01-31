import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServerClient } from '@kit/supabase/server-client';

type AuthorInsert = {
  name: string;
  bio?: string | null;
  avatar_url?: string | null;
  birth_date?: string | null;
  nationality?: string | null;
  website_url?: string | null;
  is_featured?: boolean;
};

// GET /api/authors - Fetch all authors with book counts
export async function GET() {
  try {
    const supabase = getSupabaseServerClient();

    const { data, error } = await supabase
      .from('authors')
      .select(`
        id,
        name,
        bio,
        avatar_url,
        birth_date,
        nationality,
        website_url,
        is_featured,
        created_at,
        updated_at,
        metadata
      `)
      .order('name', { ascending: true });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    // Get book count for each author
    const authorsWithBookCount = await Promise.all(
      (data || []).map(async (author) => {
        const { count } = await supabase
          .from('books')
          .select('id', { count: 'exact', head: true })
          .eq('author_id', author.id);

        return {
          ...author,
          book_count: count || 0,
        };
      })
    );

    return NextResponse.json({ data: authorsWithBookCount });
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST /api/authors - Create a new author
export async function POST(request: NextRequest) {
  try {
    const supabase = getSupabaseServerClient();
    const body: AuthorInsert = await request.json();

    const { data, error } = await supabase
      .from('authors')
      .insert({
        name: body.name,
        bio: body.bio || null,
        avatar_url: body.avatar_url || null,
        birth_date: body.birth_date || null,
        nationality: body.nationality || null,
        website_url: body.website_url || null,
        is_featured: body.is_featured ?? false,
      })
      .select(`
        id,
        name,
        bio,
        avatar_url,
        birth_date,
        nationality,
        website_url,
        is_featured,
        created_at,
        updated_at
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
