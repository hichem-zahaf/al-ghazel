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
  categories: string[] | null;
  authors: {
    id: string;
    name: string;
    bio: string | null;
    avatar_url: string | null;
  };
}

interface CategoryDetails {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  book_count: number;
}

/**
 * Transform BookWithDetails to Book type for frontend consumption
 */
async function transformBookToBookType(dbBook: BookWithDetails, supabase: any) {
  // Fetch category details if categories exist
  let categoryDetails = [];
  if (dbBook.categories && dbBook.categories.length > 0) {
    const { data: cats } = await supabase
      .from('categories')
      .select('id, name, slug, description, book_count')
      .in('id', dbBook.categories);
    categoryDetails = cats?.map((cat: CategoryDetails) => ({
      id: cat.id,
      name: cat.name,
      slug: cat.slug,
      icon: '📚',
      bookCount: cat.book_count || 0,
      description: cat.description,
    })) || [];
  }

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
    categories: categoryDetails,
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
        )
      `)
      .eq('id', id)
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 404 });
    }

    const book = await transformBookToBookType(data as BookWithDetails, supabase);
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
    const body: BookUpdate & { categories?: string[] } = await request.json();

    // Get current book to compare categories
    const { data: currentBook } = await supabase
      .from('books')
      .select('categories')
      .eq('id', id)
      .single();

    const { data, error } = await supabase
      .from('books')
      .update({
        ...body,
        categories: body.categories !== undefined ? body.categories : currentBook?.categories,
      })
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

    // Update category counts if categories changed
    if (body.categories !== undefined && currentBook) {
      const oldCategories = currentBook.categories || [];
      const newCategories = body.categories || [];

      // Decrement old categories that are no longer selected
      const toDecrement = oldCategories.filter((id: string) => !newCategories.includes(id));
      if (toDecrement.length > 0) {
        await supabase.rpc('decrement_category_counts', { category_ids: toDecrement });
      }

      // Increment new categories that weren't previously selected
      const toIncrement = newCategories.filter((id: string) => !oldCategories.includes(id));
      if (toIncrement.length > 0) {
        await supabase.rpc('increment_category_counts', { category_ids: toIncrement });
      }
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

    // Get book categories before deletion to decrement counts
    const { data: book } = await supabase
      .from('books')
      .select('categories')
      .eq('id', id)
      .single();

    // Delete the book
    const { error } = await supabase
      .from('books')
      .delete()
      .eq('id', id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    // Decrement category counts
    if (book?.categories && book.categories.length > 0) {
      await supabase.rpc('decrement_category_counts', { category_ids: book.categories });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
