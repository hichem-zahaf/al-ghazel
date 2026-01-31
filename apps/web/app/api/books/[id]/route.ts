import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServerClient } from '@kit/supabase/server-client';
import { getSupabaseServerAdminClient } from '@kit/supabase/server-admin-client';
import type { Database } from '~/lib/database.types';

type BookUpdate = Database['public']['Tables']['books']['Update'];

interface BookWithDetails {
  id: string;
  title: string;
  subtitle: string | null;
  description: string | null;
  author_id: string;
  cover_image_url: string | null;
  price: number;
  original_price: number | null;
  discount_percentage: number | null;
  rating: number | null;
  rating_count: number | null;
  is_featured: boolean | null;
  is_bestseller: boolean | null;
  is_new_release: boolean | null;
  created_at: string;
  published_date: string | null;
  isbn: string | null;
  pages: number | null;
  language: string | null;
  publisher: string | null;
  format: string | null;
  stock_quantity: number | null;
  status: string | null;
  authors: {
    id: string;
    name: string;
    bio: string | null;
    avatar_url: string | null;
  };
  book_categories?: Array<{
    categories: {
      id: string;
      name: string;
      slug: string;
      description: string | null;
    };
  }>;
}

/**
 * Transform BookWithDetails to Book type for frontend consumption
 */
function transformBookToBookType(dbBook: BookWithDetails) {
  return {
    id: dbBook.id,
    title: dbBook.title,
    author: {
      id: dbBook.authors.id,
      name: dbBook.authors.name,
      avatar: dbBook.authors.avatar_url ?? '/images/author-placeholder.jpg',
      bio: dbBook.authors.bio ?? '',
    },
    coverImage: dbBook.cover_image_url ?? '/images/book-placeholder.jpg',
    price: dbBook.price,
    originalPrice: dbBook.original_price ?? undefined,
    discountPercentage: dbBook.discount_percentage ?? undefined,
    description: dbBook.description ?? '',
    categories: dbBook.book_categories?.map(bc => ({
      id: bc.categories.id,
      name: bc.categories.name,
      slug: bc.categories.slug,
      icon: '📚',
      bookCount: 0,
      description: bc.categories.description ?? undefined,
    })) ?? [],
    rating: dbBook.rating ?? 0,
    publishedDate: new Date(dbBook.published_date || dbBook.created_at),
    isbn: dbBook.isbn ?? '',
    pages: dbBook.pages ?? 0,
    language: dbBook.language ?? undefined,
    publisher: dbBook.publisher ?? undefined,
  };
}

// GET /api/books/[id] - Get a single book by ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = getSupabaseServerClient();
    const { id } = await params;

    const { data, error } = await supabase
      .from('books')
      .select(`
        *,
        authors (
          id,
          name,
          bio,
          avatar_url
        ),
        book_categories (
          categories (
            id,
            name,
            slug,
            description
          )
        )
      `)
      .eq('id', id)
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 404 });
    }

    const book = transformBookToBookType(data as BookWithDetails);
    return NextResponse.json({ data: book });
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PATCH /api/books/[id] - Update a book
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = getSupabaseServerClient();
    const { id } = await params;
    const body: BookUpdate = await request.json();

    const { data, error } = await supabase
      .from('books')
      .update(body)
      .eq('id', id)
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

    return NextResponse.json({ data });
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE /api/books/[id] - Delete a book
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = getSupabaseServerAdminClient();
    const { id } = await params;

    const { error } = await supabase
      .from('books')
      .delete()
      .eq('id', id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
