import { notFound } from 'next/navigation';
import { BookDetail } from './_components/book-detail';
import { getSupabaseServerClient } from '@kit/supabase/server-client';

interface BookPageProps {
  params: Promise<{ slug: string }>;
}

/**
 * Parse the slug parameter to extract either:
 * 1. A slug-shortId combination (new format): "the-great-gatsby-AB3XK9MN"
 * 2. A UUID (legacy format): "fe05d6c2-915e-49e2-84b9-994048599cdb"
 */
function parseSlugParam(slugParam: string | undefined): { type: 'uuid' | 'slug-short_id'; slug?: string; shortId?: string; id?: string } {
  // Safety check for undefined
  if (!slugParam || typeof slugParam !== 'string') {
    return { type: 'uuid', id: '' };
  }

  // Check if it's a UUID format (has hyphens and matches UUID pattern)
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  if (uuidRegex.test(slugParam)) {
    return { type: 'uuid', id: slugParam };
  }

  // Otherwise, parse as slug-short_id format
  // The short_id is always 8 characters uppercase alphanumeric at the end
  const match = slugParam.match(/^(.+)-([A-Z0-9]{8})$/);
  if (match) {
    return { type: 'slug-short_id', slug: match[1], shortId: match[2] };
  }

  // Fallback: treat as UUID (for backward compatibility)
  return { type: 'uuid', id: slugParam };
}

async function getBookBySlugAndShortId(slug: string, shortId: string) {
  const supabase = getSupabaseServerClient();

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
    .eq('slug', slug)
    .eq('short_id', shortId)
    .single();

  if (error || !data) {
    return null;
  }

  return data;
}

async function getBook(id: string) {
  const supabase = getSupabaseServerClient();

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

  if (error || !data) {
    return null;
  }

  return data;
}

async function getRecommendedBooks(currentBookId: string, authorId: string, limit = 8) {
  const supabase = getSupabaseServerClient();

  // Get books by the same author, excluding current book
  const { data: sameAuthorBooks } = await supabase
    .from('books')
    .select(`
      id,
      title,
      subtitle,
      description,
      cover_image_url,
      price,
      original_price,
      discount_percentage,
      rating,
      authors (
        id,
        name
      )
    `)
    .eq('author_id', authorId)
    .neq('id', currentBookId)
    .limit(limit / 2);

  // Get some featured/bestseller books from other authors
  const { data: otherBooks } = await supabase
    .from('books')
    .select(`
      id,
      title,
      subtitle,
      description,
      cover_image_url,
      price,
      original_price,
      discount_percentage,
      rating,
      authors (
        id,
        name
      )
    `)
    .neq('id', currentBookId)
    .neq('author_id', authorId)
    .or('is_featured.eq.true,is_bestseller.eq.true')
    .limit(limit - (sameAuthorBooks?.length ?? 0));

  return [...(sameAuthorBooks ?? []), ...(otherBooks ?? [])];
}

export default async function BookPage({ params }: BookPageProps) {
  const { slug: slugParam } = await params;
  const parsed = parseSlugParam(slugParam);

  let book;

  if (parsed.type === 'slug-short_id' && parsed.slug && parsed.shortId) {
    // New format: lookup by slug and short_id
    book = await getBookBySlugAndShortId(parsed.slug, parsed.shortId);
  } else {
    // Legacy format: lookup by UUID
    book = await getBook(parsed.id!);
  }

  if (!book) {
    notFound();
  }

  const recommendedBooks = await getRecommendedBooks(book.id, book.author_id);

  return (
    <div className="min-h-screen bg-background">
      <BookDetail book={book} recommendedBooks={recommendedBooks} />
    </div>
  );
}

export async function generateMetadata({ params }: BookPageProps) {
  const { slug: slugParam } = await params;
  const parsed = parseSlugParam(slugParam);

  let book;

  if (parsed.type === 'slug-short_id' && parsed.slug && parsed.shortId) {
    book = await getBookBySlugAndShortId(parsed.slug, parsed.shortId);
  } else {
    book = await getBook(parsed.id!);
  }

  if (!book) {
    return {
      title: 'Book Not Found',
    };
  }

  return {
    title: `${book.title} by ${book.authors?.name || 'Unknown Author'} | Al-Ghazel Bookstore`,
    description: book.subtitle || book.description || 'Discover this amazing book at Al-Ghazel Bookstore',
  };
}
