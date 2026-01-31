import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServerClient } from '@kit/supabase/server-client';
import type { Book } from '~/types/bookstore';

// Types for the API response
interface ExploreResponse {
  books: Book[];
  nextCursor: string | null;
  hasMore: boolean;
  totalCount: number;
  personalizedRatio?: number; // Only for authenticated users
}

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
  language: string | null;
  publisher: string | null;
  authors: {
    id: string;
    name: string;
  };
  book_categories?: Array<{
    categories: {
      id: string;
      name: string;
      slug: string;
    };
  }>;
}

interface CursorData {
  seenIds: string[]; // List of book IDs already sent to the client
  salt: string; // Daily salt for consistent randomization
}

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Get the current authenticated user
 */
async function getCurrentUser(supabase: any) {
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) return null;
  return user;
}

/**
 * Generate a seeded random number between 0 and 1
 * Uses a simple hash function for consistent results
 */
function seededRandom(seed: string): number {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = ((hash << 5) - hash) + seed.charCodeAt(i);
    hash |= 0; // Convert to 32-bit integer
  }
  return (Math.abs(hash) % 1000000) / 1000000;
}

/**
 * Get a per-request seed for true randomness on each page load
 * Includes timestamp so each refresh gives a different order
 */
function getRandomSeed(userId: string | null): string {
  // Use timestamp + user ID for per-request randomness
  const timestamp = Date.now();
  return `${timestamp}-${userId || 'anonymous'}`;
}

/**
 * Fisher-Yates shuffle with seed for consistent shuffling
 */
function seededShuffle<T>(array: T[], seed: string): T[] {
  const result = [...array];
  let m = result.length;
  let currentSeed = seed;

  while (m) {
    const i = Math.floor(seededRandom(currentSeed) * m--);
    currentSeed = `${currentSeed}${i}`; // Change seed for next iteration
    const temp = result[m] as T;
    result[m] = result[i] as T;
    result[i] = temp;
  }
  return result;
}

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

// ============================================================================
// Personalization Functions
// ============================================================================

/**
 * Get user's order history for building preference profile
 */
async function getUserOrders(supabase: any, userId: string) {
  const { data } = await supabase
    .from('orders')
    .select('order_items(book_id, author_id)')
    .eq('account_id', userId)
    .eq('status', 'completed')
    .order('created_at', { ascending: false });

  return data || [];
}

/**
 * Get authors the user has shown interest in
 */
async function getInterestedAuthors(supabase: any, userId: string) {
  const { data } = await supabase
    .from('user_author_preferences')
    .select('author_id, interest_level')
    .eq('account_id', userId)
    .gte('interest_level', 10)
    .order('interest_level', { ascending: false });

  return data || [];
}

/**
 * Get user's rating preferences
 */
async function getUserRatingPreferences(supabase: any, userId: string) {
  const { data } = await supabase
    .from('user_rating_preferences')
    .select('*')
    .eq('account_id', userId)
    .single();

  return data;
}

/**
 * Get user's reading history (books they've viewed/purchased)
 */
async function getUserReadingHistory(supabase: any, userId: string) {
  const { data } = await supabase
    .from('user_reading_history')
    .select('book_id, action_type, created_at')
    .eq('account_id', userId)
    .order('created_at', { ascending: false })
    .limit(100);

  return data || [];
}

/**
 * Calculate learning score based on user activity
 * Higher score = more we know about user = higher personalization ratio
 */
function calculateLearningScore(
  orders: unknown[],
  authorInterests: { interest_level: number }[],
  readingHistory: unknown[]
): number {
  let score = 0;
  score += orders.length * 2; // Each order = 2 points
  score += authorInterests.reduce((sum, a) => sum + Math.floor(a.interest_level / 10), 0); // Interest level contributes
  score += Math.min(readingHistory.length, 10); // Reading history, max 10 points

  return Math.min(score, 30); // Max score of 30
}

/**
 * Get pseudo-random books with deduplication using seenIds
 * Each request fetches books excluding ones already sent, then shuffles
 */
async function getSeededRandomBooks(
  supabase: any,
  userId: string | null,
  limit: number,
  filters: {
    query?: string;
    category?: string;
    author?: string;
    minPrice?: number;
    maxPrice?: number;
    minRating?: number;
  },
  cursor: CursorData | null
): Promise<{ books: BookWithDetails[]; nextCursor: string | null; hasMore: boolean }> {
  const randomSalt = cursor?.salt || getRandomSeed(userId);
  const seenIds = cursor?.seenIds || [];
  const batchSize = 200;

  // First, get the total count with filters (without exclusions)
  let countQuery = supabase
    .from('books')
    .select('id', { count: 'exact', head: true });

  if (filters.query) {
    countQuery = countQuery.or(`title.ilike.%${filters.query}%,subtitle.ilike.%${filters.query}%,description.ilike.%${filters.query}%`);
  }
  if (filters.category) {
    countQuery = countQuery.filter('book_categories', 'in', `(${filters.category})`);
  }
  if (filters.author) {
    countQuery = countQuery.eq('author_id', filters.author);
  }
  if (filters.minPrice !== undefined) {
    countQuery = countQuery.gte('price', filters.minPrice);
  }
  if (filters.maxPrice !== undefined) {
    countQuery = countQuery.lte('price', filters.maxPrice);
  }
  if (filters.minRating !== undefined) {
    countQuery = countQuery.gte('rating', filters.minRating);
  }

  const { count: totalCount } = await countQuery;

  // If no books match, or all have been seen, return empty
  if (!totalCount || totalCount === 0 || seenIds.length >= totalCount) {
    return { books: [], nextCursor: null, hasMore: false };
  }

  // Start with base query - order by id for deterministic results
  let query = supabase
    .from('books')
    .select(`
      *,
      authors(id, name),
      book_categories(categories(id, name, slug))
    `)
    .order('id', { ascending: true });

  // Apply filters
  if (filters.query) {
    query = query.or(`title.ilike.%${filters.query}%,subtitle.ilike.%${filters.query}%,description.ilike.%${filters.query}%`);
  }
  if (filters.category) {
    query = query.filter('book_categories', 'in', `(${filters.category})`);
  }
  if (filters.author) {
    query = query.eq('author_id', filters.author);
  }
  if (filters.minPrice !== undefined) {
    query = query.gte('price', filters.minPrice);
  }
  if (filters.maxPrice !== undefined) {
    query = query.lte('price', filters.maxPrice);
  }
  if (filters.minRating !== undefined) {
    query = query.gte('rating', filters.minRating);
  }

  // Exclude already seen books
  if (seenIds.length > 0) {
    query = query.not('id', 'in', `(${seenIds.join(',')})`);
  }

  // Fetch a batch of unseen books
  const { data, error } = await query.limit(batchSize);

  if (error || !data) {
    return { books: [], nextCursor: null, hasMore: false };
  }

  const fetchedBooks = data as BookWithDetails[];

  // Apply seeded shuffle using per-request random salt
  const shuffledBooks = seededShuffle(fetchedBooks, randomSalt);

  // Take only what we need
  const paginatedBooks = shuffledBooks.slice(0, limit);

  // Track all book IDs we've sent
  const newSeenIds = [...seenIds, ...paginatedBooks.map(b => b.id)];

  // Determine next cursor and hasMore
  let nextCursor: string | null = null;
  let hasMore = false;

  // We have more if we haven't seen all books yet
  if (newSeenIds.length < totalCount && paginatedBooks.length >= limit) {
    nextCursor = encodeCursor({
      seenIds: newSeenIds,
      salt: randomSalt
    });
    hasMore = true;
  }

  return { books: paginatedBooks, nextCursor, hasMore };
}

/**
 * Get pseudo-random books with author boost for personalization
 * Books from preferred authors are "boosted" to appear more frequently
 */
async function getSeededRandomBooksWithBoost(
  supabase: any,
  userId: string,
  limit: number,
  filters: {
    query?: string;
    category?: string;
    author?: string;
    minPrice?: number;
    maxPrice?: number;
    minRating?: number;
  },
  cursor: CursorData | null,
  boostedAuthorIds: string[]
): Promise<{ books: BookWithDetails[]; nextCursor: string | null; hasMore: boolean }> {
  const randomSalt = cursor?.salt || getRandomSeed(userId);
  const seenIds = cursor?.seenIds || [];
  const batchSize = 200;

  // First, get the total count with filters (without exclusions)
  let countQuery = supabase
    .from('books')
    .select('id', { count: 'exact', head: true });

  if (filters.query) {
    countQuery = countQuery.or(`title.ilike.%${filters.query}%,subtitle.ilike.%${filters.query}%,description.ilike.%${filters.query}%`);
  }
  if (filters.category) {
    countQuery = countQuery.filter('book_categories', 'in', `(${filters.category})`);
  }
  if (filters.author) {
    countQuery = countQuery.eq('author_id', filters.author);
  }
  if (filters.minPrice !== undefined) {
    countQuery = countQuery.gte('price', filters.minPrice);
  }
  if (filters.maxPrice !== undefined) {
    countQuery = countQuery.lte('price', filters.maxPrice);
  }
  if (filters.minRating !== undefined) {
    countQuery = countQuery.gte('rating', filters.minRating);
  }

  const { count: totalCount } = await countQuery;

  // If no books match, or all have been seen, return empty
  if (!totalCount || totalCount === 0 || seenIds.length >= totalCount) {
    return { books: [], nextCursor: null, hasMore: false };
  }

  // Start with base query - order by id for deterministic results
  let query = supabase
    .from('books')
    .select(`
      *,
      authors(id, name),
      book_categories(categories(id, name, slug))
    `)
    .order('id', { ascending: true });

  // Apply filters
  if (filters.query) {
    query = query.or(`title.ilike.%${filters.query}%,subtitle.ilike.%${filters.query}%,description.ilike.%${filters.query}%`);
  }
  if (filters.category) {
    query = query.filter('book_categories', 'in', `(${filters.category})`);
  }
  if (filters.author) {
    query = query.eq('author_id', filters.author);
  }
  if (filters.minPrice !== undefined) {
    query = query.gte('price', filters.minPrice);
  }
  if (filters.maxPrice !== undefined) {
    query = query.lte('price', filters.maxPrice);
  }
  if (filters.minRating !== undefined) {
    query = query.gte('rating', filters.minRating);
  }

  // Exclude already seen books
  if (seenIds.length > 0) {
    query = query.not('id', 'in', `(${seenIds.join(',')})`);
  }

  // Fetch a batch of unseen books
  const { data, error } = await query.limit(batchSize);

  if (error || !data) {
    return { books: [], nextCursor: null, hasMore: false };
  }

  const fetchedBooks = data as BookWithDetails[];

  // Separate into boosted and regular books
  const boostedBooks = boostedAuthorIds.length > 0
    ? fetchedBooks.filter(book => boostedAuthorIds.includes(book.author_id))
    : [];
  const regularBooks = boostedAuthorIds.length > 0
    ? fetchedBooks.filter(book => !boostedAuthorIds.includes(book.author_id))
    : fetchedBooks;

  // Shuffle each bucket with per-request random salt
  const shuffledBoosted = seededShuffle(boostedBooks, randomSalt);
  const shuffledRegular = seededShuffle(regularBooks, randomSalt);

  // Interleave: 2 boosted, then 1 regular, repeat
  // This gives boosted authors ~66% visibility in the mix
  const interleaved: BookWithDetails[] = [];
  let boostedIdx = 0;
  let regularIdx = 0;
  const boostRatio = 2;

  while (interleaved.length < limit && (boostedIdx < shuffledBoosted.length || regularIdx < shuffledRegular.length)) {
    // Add boosted books
    for (let i = 0; i < boostRatio && boostedIdx < shuffledBoosted.length && interleaved.length < limit; i++) {
      const book = shuffledBoosted[boostedIdx++];
      if (book) interleaved.push(book);
    }
    // Add one regular book
    if (regularIdx < shuffledRegular.length && interleaved.length < limit) {
      const book = shuffledRegular[regularIdx++];
      if (book) interleaved.push(book);
    }
  }

  // If we didn't fill the page with the interleaving, add remaining from either bucket
  while (interleaved.length < limit) {
    if (boostedIdx < shuffledBoosted.length) {
      const book = shuffledBoosted[boostedIdx++];
      if (book) interleaved.push(book);
    } else if (regularIdx < shuffledRegular.length) {
      const book = shuffledRegular[regularIdx++];
      if (book) interleaved.push(book);
    } else {
      break;
    }
  }

  const paginatedBooks = interleaved;

  // Track all book IDs we've sent
  const newSeenIds = [...seenIds, ...paginatedBooks.map(b => b.id)];

  // Determine next cursor and hasMore
  let nextCursor: string | null = null;
  let hasMore = false;

  // We have more if we haven't seen all books yet
  if (newSeenIds.length < totalCount && paginatedBooks.length >= limit) {
    nextCursor = encodeCursor({
      seenIds: newSeenIds,
      salt: randomSalt
    });
    hasMore = true;
  }

  return { books: paginatedBooks, nextCursor, hasMore };
}

// ============================================================================
// Transform Functions
// ============================================================================

/**
 * Transform BookWithDetails to Book type for frontend consumption
 */
function transformBookToBookType(dbBook: BookWithDetails): Book {
  return {
    id: dbBook.id,
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
    categories: dbBook.book_categories?.map(bc => ({
      id: bc.categories.id,
      name: bc.categories.name,
      slug: bc.categories.slug,
      icon: '📚',
      bookCount: 0,
    })) ?? [],
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

export async function GET(request: NextRequest) {
  try {
    const supabase = getSupabaseServerClient();
    const { searchParams } = new URL(request.url);

    // Parse query parameters
    const query = searchParams.get('query') || '';
    const category = searchParams.get('category');
    const author = searchParams.get('author');
    const minPrice = searchParams.get('minPrice') ? parseFloat(searchParams.get('minPrice')!) : undefined;
    const maxPrice = searchParams.get('maxPrice') ? parseFloat(searchParams.get('maxPrice')!) : undefined;
    const minRating = searchParams.get('minRating') ? parseFloat(searchParams.get('minRating')!) : undefined;
    const cursor = parseCursor(searchParams.get('cursor'));
    const pageSize = Math.min(searchParams.get('pageSize') ? parseInt(searchParams.get('pageSize')!) : 12, 48);

    // Get current user
    const user = await getCurrentUser(supabase);
    const userId = user?.id || null;

    let books: BookWithDetails[] = [];
    let nextCursor: string | null = null;
    let hasMore = false;
    let personalizedRatio = 0;

    // ========================================================================
    // Authenticated Users: Personalized (boosted) + Random Mix
    // ========================================================================
    if (userId) {
      // Fetch user data for personalization
      const [orders, interestedAuthors, ratingPrefs, readingHistory] = await Promise.all([
        getUserOrders(supabase, userId),
        getInterestedAuthors(supabase, userId),
        getUserRatingPreferences(supabase, userId),
        getUserReadingHistory(supabase, userId)
      ]);

      // Calculate learning score and personalization ratio
      const learningScore = calculateLearningScore(orders, interestedAuthors, readingHistory);
      personalizedRatio = Math.min(0.1 + (learningScore * 0.02), 0.7); // 10% to 70%

      // Get top author IDs for boosting
      const topAuthorIds = interestedAuthors
        .sort((a: { author_id: string; interest_level: number }, b: { author_id: string; interest_level: number }) => b.interest_level - a.interest_level)
        .slice(0, 10)
        .map((a: { author_id: string; interest_level: number }) => a.author_id);

      // Get books with author boosting
      const result = await getSeededRandomBooksWithBoost(
        supabase,
        userId,
        pageSize,
        { query, category: category || undefined, author: author || undefined, minPrice, maxPrice, minRating },
        cursor,
        topAuthorIds
      );

      books = result.books;
      nextCursor = result.nextCursor;
      hasMore = result.hasMore;
    }
    // ========================================================================
    // Anonymous Users: Pure Seeded Random
    // ========================================================================
    else {
      const result = await getSeededRandomBooks(
        supabase,
        null, // Anonymous user
        pageSize,
        { query, category: category || undefined, author: author || undefined, minPrice, maxPrice, minRating },
        cursor
      );

      books = result.books;
      nextCursor = result.nextCursor;
      hasMore = result.hasMore;
    }

    // Get total count for the current filters (cached, approximate)
    const countQuery = supabase
      .from('books')
      .select('id', { count: 'exact', head: true });

    if (query) {
      countQuery.or(`title.ilike.%${query}%,subtitle.ilike.%${query}%`);
    }
    if (category) {
      // For category, we need a different approach
      // Skip for now to avoid complex join
    }
    if (author) {
      countQuery.eq('author_id', author);
    }
    if (minPrice !== undefined) {
      countQuery.gte('price', minPrice);
    }
    if (maxPrice !== undefined) {
      countQuery.lte('price', maxPrice);
    }
    if (minRating !== undefined) {
      countQuery.gte('rating', minRating);
    }

    const { count } = await countQuery;

    // Transform books to Book type for frontend
    const transformedBooks = books.map(transformBookToBookType);

    // Build response
    const response: ExploreResponse = {
      books: transformedBooks,
      nextCursor,
      hasMore,
      totalCount: count || 0,
    };

    // Only include personalized ratio for authenticated users
    if (userId) {
      response.personalizedRatio = personalizedRatio;
    }

    return NextResponse.json(response);
  } catch (error) {
    console.error('Explore API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
