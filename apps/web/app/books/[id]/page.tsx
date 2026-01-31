import { notFound } from 'next/navigation';
import { BookDetail } from './_components/book-detail';
import { getSupabaseServerClient } from '@kit/supabase/server-client';

interface BookPageProps {
  params: Promise<{ id: string }>;
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
  const { id } = await params;
  const book = await getBook(id);

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
  const { id } = await params;
  const book = await getBook(id);

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
