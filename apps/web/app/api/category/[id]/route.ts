import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServerClient } from '@kit/supabase/server-client';
import type { Book } from '~/types/bookstore';
import type { SupabaseClient } from '@supabase/supabase-js';

// Types for the API response
interface CategoryBooksResponse {
  books: Book[];
  nextCursor: string | null;
  hasMore: boolean;
  totalCount: number;
}

interface BookWithDetails {
  id: string;
  slug: string;
  short_id: string;
  title: string;
  subtitle: string | null;
  description: string | null;
  cover_image_url: string | null;
  price: number;
  original_price: number | null;
  discount_percentage: number | null;
  rating: number | null;
  language: string | null;
  publisher: string | null;
  created_at: string;
  categories: string[] | null;
  authors: {
    id: string;
    name: string;
  };
}

interface CursorData {
  lastBookId: string | null;
  lastCreatedAt: string | null;
}

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Parse cursor string into cursor data
 */
function parseCursor(cursor: string | null): CursorData | null {
  if (!cursor) return null;
  try {
    const decoded = Buffer.from(cursor, 'base64').toString('utf-8');
    return JSON.parse(decoded) as CursorData;
  } catch {
    return null;
  }
}

/**
 * Encode cursor data into a string
 */
function encodeCursor(cursorData: CursorData): string {
  return Buffer.from(JSON.stringify(cursorData)).toString('base64');
}

/**
 * Get category by slug
 */
async function getCategoryBySlug(supabase: SupabaseClient, slug: string) {
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .eq('slug', slug)
    .single();

  if (error || !data) {
    return null;
  }

  return data;
}

/**
 * Get all categories for mapping
 */
async function getAllCategories(supabase: SupabaseClient) {
  const { data, error } = await supabase
    .from('categories')
    .select('id, name, slug');

  if (error || !data) {
    return [];
  }

  return data;
}

/**
 * Transform BookWithDetails to Book type for frontend consumption
 */
function transformBookToBookType(dbBook: BookWithDetails, allCategories: Array<{ id: string; name: string; slug: string }>): Book {
  // Get category details for the book's categories
  const bookCategories = (dbBook.categories ?? [])
    .map((catId) => allCategories.find((c) => c.id === catId))
    .filter((cat): cat is { id: string; name: string; slug: string } => cat !== undefined)
    .map((cat) => ({
      id: cat.id,
      name: cat.name,
      slug: cat.slug,
      icon: '📚',
      bookCount: 0,
    }));

  return {
    id: dbBook.id,
    slug: dbBook.slug ?? '',
    shortId: dbBook.short_id ?? '',
    title: dbBook.title,
    author: {
      id: dbBook.authors.id,
      name: dbBook.authors.name,
      avatar: '/images/author-placeholder.jpg',
      bio: '',
    },
    coverImage: dbBook.cover_image_url ?? '/images/book-placeholder.jpg',
    price: dbBook.price,
    originalPrice: dbBook.original_price ?? undefined,
    discountPercentage: dbBook.discount_percentage ?? undefined,
    description: dbBook.description ?? '',
    categories: bookCategories,
    rating: dbBook.rating ?? 0,
    publishedDate: new Date(dbBook.created_at),
    isbn: '',
    pages: 0,
    language: (dbBook.language ?? undefined) as string | undefined,
    publisher: (dbBook.publisher ?? undefined) as string | undefined,
  };
}

// ============================================================================
// Main GET Handler
// ============================================================================

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = getSupabaseServerClient();
    const { id: slug } = await params;
    const { searchParams } = new URL(request.url);

    // Get category by slug first
    const category = await getCategoryBySlug(supabase, slug);

    if (!category) {
      return NextResponse.json(
        { error: 'Category not found' },
        { status: 404 }
      );
    }

    // Parse query parameters
    const query = searchParams.get('query') || '';
    const cursor = parseCursor(searchParams.get('cursor'));
    const pageSize = Math.min(searchParams.get('pageSize') ? parseInt(searchParams.get('pageSize')!) : 12, 48);
    const sortBy = searchParams.get('sortBy') || 'created_at';
    const sortOrder = searchParams.get('sortOrder') || 'desc';

    // Filter parameters
    const minPrice = searchParams.get('minPrice') ? parseFloat(searchParams.get('minPrice')!) : undefined;
    const maxPrice = searchParams.get('maxPrice') ? parseFloat(searchParams.get('maxPrice')!) : undefined;
    const minRating = searchParams.get('minRating') ? parseFloat(searchParams.get('minRating')!) : undefined;
    const language = searchParams.get('language') || undefined;

    // Get total count with filters
    let countQuery = supabase
      .from('books')
      .select('id', { count: 'exact', head: true })
      .contains('categories', [category.id])
      .eq('status', 'active');

    if (query) {
      countQuery = countQuery.or(`title.ilike.%${query}%,subtitle.ilike.%${query}%,description.ilike.%${query}%`);
    }
    if (minPrice !== undefined) {
      countQuery = countQuery.gte('price', minPrice);
    }
    if (maxPrice !== undefined) {
      countQuery = countQuery.lte('price', maxPrice);
    }
    if (minRating !== undefined) {
      countQuery = countQuery.gte('rating', minRating);
    }
    if (language) {
      countQuery = countQuery.eq('language', language);
    }

    const { count: totalCount } = await countQuery;

    if (!totalCount || totalCount === 0) {
      return NextResponse.json<CategoryBooksResponse>({
        books: [],
        nextCursor: null,
        hasMore: false,
        totalCount: 0,
      });
    }

    // Fetch all categories for book transformation
    const allCategories = await getAllCategories(supabase);

    // Build the main query
    let booksQuery = supabase
      .from('books')
      .select(`
        id,
        slug,
        short_id,
        title,
        subtitle,
        description,
        cover_image_url,
        price,
        original_price,
        discount_percentage,
        rating,
        language,
        publisher,
        created_at,
        categories,
        authors(id, name)
      `)
      .contains('categories', [category.id])
      .eq('status', 'active');

    // Apply filters
    if (query) {
      booksQuery = booksQuery.or(`title.ilike.%${query}%,subtitle.ilike.%${query}%,description.ilike.%${query}%`);
    }
    if (minPrice !== undefined) {
      booksQuery = booksQuery.gte('price', minPrice);
    }
    if (maxPrice !== undefined) {
      booksQuery = booksQuery.lte('price', maxPrice);
    }
    if (minRating !== undefined) {
      booksQuery = booksQuery.gte('rating', minRating);
    }
    if (language) {
      booksQuery = booksQuery.eq('language', language);
    }

    // Apply cursor-based pagination
    if (cursor && cursor.lastCreatedAt && cursor.lastBookId) {
      if (sortOrder === 'desc') {
        booksQuery = booksQuery
          .or(`created_at.lt.${cursor.lastCreatedAt},(created_at.eq.${cursor.lastCreatedAt}.and.id.lt.${cursor.lastBookId})`);
      } else {
        booksQuery = booksQuery
          .or(`created_at.gt.${cursor.lastCreatedAt},(created_at.eq.${cursor.lastCreatedAt}.and.id.gt.${cursor.lastBookId})`);
      }
    }

    // Apply sorting
    const validSortColumns = ['created_at', 'title', 'price', 'rating'];
    const sortColumn = validSortColumns.includes(sortBy) ? sortBy : 'created_at';

    booksQuery = booksQuery.order(sortColumn, { ascending: sortOrder === 'asc' });

    // Add secondary ordering by id for consistent pagination
    booksQuery = booksQuery.order('id', { ascending: sortOrder === 'asc' });

    // Fetch books with limit
    const { data: books, error } = await booksQuery.limit(pageSize + 1);

    if (error || !books) {
      console.error('Category books API error:', error);
      return NextResponse.json(
        { error: 'Internal server error' },
        { status: 500 }
      );
    }

    const fetchedBooks = books as BookWithDetails[];

    // Determine if there are more results
    const hasMore = fetchedBooks.length > pageSize;
    const paginatedBooks = hasMore ? fetchedBooks.slice(0, pageSize) : fetchedBooks;

    // Create next cursor
    let nextCursor: string | null = null;

    if (hasMore && paginatedBooks.length > 0) {
      const lastBook = paginatedBooks[paginatedBooks.length - 1];
      if (lastBook) {
        nextCursor = encodeCursor({
          lastBookId: lastBook.id,
          lastCreatedAt: lastBook.created_at,
        });
      }
    }

    // Transform books to Book type for frontend
    const transformedBooks = paginatedBooks.map((book) => transformBookToBookType(book, allCategories));

    // Build response
    const response: CategoryBooksResponse = {
      books: transformedBooks,
      nextCursor,
      hasMore,
      totalCount: totalCount || 0,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Category books API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
