/**
 * Bookstore Marketing Page
 * Immersive bookstore website with horizontal scrolling sections
 */

import { HeroSection } from './_components/bookstore/hero-section';
import { CategoryCarousel } from './_components/bookstore/category-carousel';
import { BookOfTheDay } from './_components/bookstore/book-of-day';
import { AuthorOfTheDay } from './_components/bookstore/author-of-day';
import { RecommendedBooks } from './_components/bookstore/recommended-books';
import { ForYouSection } from './_components/bookstore/for-you-section';
import { SearchSection } from './_components/bookstore/search-section';
import { BookRoulette } from './_components/bookstore/book-roulette';
import { getSupabaseServerClient } from '@kit/supabase/server-client';
import type { Book, Author, Category, BookOfTheDay as BookOfTheDayType, AuthorOfTheDay as AuthorOfTheDayType } from '~/lib/../types/bookstore';

// Database types
type DbBook = {
  id: string;
  title: string;
  subtitle: string | null;
  description: string | null;
  author_id: string;
  cover_image_url: string | null;
  publisher: string | null;
  published_date: string | null;
  pages: number | null;
  language: string | null;
  format: string | null;
  price: number;
  original_price: number | null;
  discount_percentage: number | null;
  stock_quantity: number | null;
  rating: number | null;
  rating_count: number | null;
  is_featured: boolean | null;
  is_bestseller: boolean | null;
  is_new_release: boolean | null;
  created_at: string | null;
  // Nested relations
  authors: {
    id: string;
    name: string;
    bio: string | null;
    avatar_url: string | null;
    nationality: string | null;
    website_url: string | null;
    social_links: Record<string, unknown> | null;
    book_count?: number | null;
  };
  book_categories?: Array<{
    categories: {
      id: string;
      name: string;
      slug: string;
      icon: string | null;
      book_count: number | null;
    };
  }>;
};

type DbAuthor = {
  id: string;
  name: string;
  bio: string | null;
  avatar_url: string | null;
  nationality: string | null;
  website_url: string | null;
  social_links: Record<string, unknown> | null;
  book_count: number | null;
};

type DbCategory = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  icon: string | null;
  book_count: number | null;
  display_order: number | null;
};

type DbBookOfTheDay = {
  id: string;
  book_id: string;
  featured_date: string;
  description: string | null;
  books: DbBook;
};

type DbAuthorOfTheDay = {
  id: string;
  author_id: string;
  featured_date: string;
  description: string | null;
  authors: DbAuthor;
};

// Transform functions to convert database types to component types
function transformAuthor(dbAuthor: DbAuthor | { id: string; name: string; bio: string | null; avatar_url: string | null; nationality: string | null; website_url: string | null; social_links: Record<string, unknown> | null; book_count?: number | null }): Author {
  const socialLinks = dbAuthor.social_links as Record<string, string> | null;
  return {
    id: dbAuthor.id,
    name: dbAuthor.name,
    avatar: dbAuthor.avatar_url ?? '/images/author-placeholder.jpg',
    bio: dbAuthor.bio ?? '',
    socialLinks: {
      website: dbAuthor.website_url ?? socialLinks?.website,
      twitter: socialLinks?.twitter,
      instagram: socialLinks?.instagram,
    },
  };
}

function transformCategory(dbCategory: DbCategory): Category {
  return {
    id: dbCategory.id,
    name: dbCategory.name,
    slug: dbCategory.slug,
    icon: dbCategory.icon ?? '📚',
    bookCount: dbCategory.book_count ?? 0,
    description: dbCategory.description ?? undefined,
  };
}

function transformBook(dbBook: DbBook): Book {
  const categories: Category[] = dbBook.book_categories?.map(bc => ({
    id: bc.categories.id,
    name: bc.categories.name,
    slug: bc.categories.slug,
    icon: bc.categories.icon ?? '📚',
    bookCount: bc.categories.book_count ?? 0,
  })) ?? [];

  return {
    id: dbBook.id,
    title: dbBook.title,
    author: transformAuthor(dbBook.authors),
    coverImage: dbBook.cover_image_url ?? '/images/book-placeholder.jpg',
    price: dbBook.price,
    originalPrice: dbBook.original_price ?? undefined,
    discountPercentage: dbBook.discount_percentage ?? undefined,
    description: dbBook.description ?? '',
    categories,
    rating: dbBook.rating ?? 0,
    publishedDate: new Date(dbBook.published_date ?? Date.now()),
    isbn: '',
    pages: dbBook.pages ?? 0,
    language: dbBook.language ?? undefined,
    publisher: dbBook.publisher ?? undefined,
  };
}

async function getCategories(): Promise<Category[]> {
  const supabase = getSupabaseServerClient();
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .order('display_order', { ascending: true });

  if (error) {
    return [];
  }

  return (data ?? []).map(transformCategory);
}

async function getBooksWithDetails(limit = 24): Promise<Book[]> {
  const supabase = getSupabaseServerClient();
  const { data, error } = await supabase
    .from('books')
    .select('*, authors(*), book_categories(categories(*))')
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) {
    // Error fetching books
    return [];
  }

  return (data as DbBook[]).map(transformBook);
}

async function getBestsellers(): Promise<Book[]> {
  const supabase = getSupabaseServerClient();
  const { data, error } = await supabase
    .from('books')
    .select('*, authors(*), book_categories(categories(*))')
    .eq('is_bestseller', true)
    .order('rating', { ascending: false })
    .limit(6);

  if (error) {
    // Error fetching bestsellers
    return [];
  }

  return (data as DbBook[]).map(transformBook);
}

async function getNewReleases(): Promise<Book[]> {
  const supabase = getSupabaseServerClient();
  const { data, error } = await supabase
    .from('books')
    .select('*, authors(*), book_categories(categories(*))')
    .eq('is_new_release', true)
    .order('created_at', { ascending: false })
    .limit(12);

  if (error) {
    // Error fetching new releases
    return [];
  }

  return (data as DbBook[]).map(transformBook);
}

async function getFeaturedBooks(): Promise<Book[]> {
  const supabase = getSupabaseServerClient();
  const { data, error } = await supabase
    .from('books')
    .select('*, authors(*), book_categories(categories(*))')
    .eq('is_featured', true)
    .order('rating', { ascending: false })
    .limit(8);

  if (error) {
    // Error fetching featured books
    return [];
  }

  return (data as DbBook[]).map(transformBook);
}

async function getBookOfTheDay(): Promise<BookOfTheDayType | null> {
  const supabase = getSupabaseServerClient();
  const today = new Date().toISOString().split('T')[0];

  const { data, error } = await supabase
    .from('book_of_the_day')
    .select('*, books(*, books!inner(authors(*)), book_categories(categories(*)))')
    .lte('featured_date', today)
    .order('featured_date', { ascending: false })
    .limit(1)
    .single();

  if (error || !data) {
    // Error fetching book of the day
    return null;
  }

  const botd = data as unknown as DbBookOfTheDay;
  return {
    book: transformBook(botd.books),
    featuredAt: new Date(botd.featured_date),
    reason: botd.description ?? 'A handpicked selection for today\'s readers.',
  };
}

async function getAuthorOfTheDay(): Promise<AuthorOfTheDayType | null> {
  const supabase = getSupabaseServerClient();
  const today = new Date().toISOString().split('T')[0];

  const { data, error } = await supabase
    .from('author_of_the_day')
    .select('*, authors(*)')
    .lte('featured_date', today)
    .order('featured_date', { ascending: false })
    .limit(1)
    .single();

  if (error || !data) {
    // Error fetching author of the day
    return null;
  }

  const aotd = data as DbAuthorOfTheDay;
  return {
    author: transformAuthor(aotd.authors),
    featuredAt: new Date(aotd.featured_date),
    reason: aotd.description ?? 'Celebrating one of our favorite authors today.',
    featuredBooks: [],
  };
}

async function getAuthors(): Promise<Author[]> {
  const supabase = getSupabaseServerClient();
  const { data, error } = await supabase
    .from('authors')
    .select('*')
    .order('name', { ascending: true });

  if (error) {
    // Error fetching authors
    return [];
  }

  return (data as DbAuthor[]).map(transformAuthor);
}

export default async function BookstoreHome() {
  // Fetch all data in parallel
  const [
    categories,
    allBooks,
    bookOfTheDay,
    authorOfTheDay,
    authors,
    bestsellers,
    newReleases,
    featuredBooks,
  ] = await Promise.all([
    getCategories(),
    getBooksWithDetails(24),
    getBookOfTheDay(),
    getAuthorOfTheDay(),
    getAuthors(),
    getBestsellers(),
    getNewReleases(),
    getFeaturedBooks(),
  ]);

  // Fallback to general books if specific sections don't have enough data
  const trendingBooks = bestsellers.length > 0 ? bestsellers : allBooks.slice(0, 6);
  const recommendedBooks = trendingBooks;
  const forYouBooks = newReleases.length > 0 ? newReleases : allBooks.slice(0, 12);
  const rouletteBooks = featuredBooks.length > 0 ? featuredBooks : allBooks.slice(0, 8);

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <HeroSection />

      {/* Main Content */}
      <div className="flex flex-col space-y-24 py-12">
        {/* Categories */}
        <section id="categories" className="container mx-auto px-4">
          <CategoryCarousel
            categories={categories}
            title="Browse by Category"
          />
        </section>

        {/* Book of the Day */}
        {bookOfTheDay && (
          <section id="book-of-the-day" className="container mx-auto px-4">
            <BookOfTheDay featured={bookOfTheDay} />
          </section>
        )}

        {/* Author of the Day */}
        {authorOfTheDay && (
          <section id="authors" className="container mx-auto px-4">
            <AuthorOfTheDay featured={authorOfTheDay} />
          </section>
        )}

        {/* Recommended Books */}
        <section id="bestsellers" className="container mx-auto px-4">
          <RecommendedBooks books={recommendedBooks} />
        </section>

        {/* For You Section */}
        <section id="new-releases" className="container mx-auto px-4">
          <ForYouSection books={forYouBooks} />
        </section>

        {/* Book Roulette */}
        <section id="sale" className="container mx-auto px-4">
          <BookRoulette books={rouletteBooks} />
        </section>

        {/* Search Section */}
        <section className="container mx-auto px-4">
          <SearchSection
            books={allBooks}
            categories={categories}
            authors={authors}
          />
        </section>
      </div>
    </div>
  );
}
