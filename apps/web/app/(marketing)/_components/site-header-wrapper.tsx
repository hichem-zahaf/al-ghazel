/**
 * Site Header Wrapper
 * Server component that fetches data and passes to client header
 */

import { SiteHeader } from './site-header';
import type { JwtPayload } from '@supabase/supabase-js';
import { getSupabaseServerClient } from '@kit/supabase/server-client';
import type { Book, Author, Category } from '~/types/bookstore';

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

// Transform functions
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

async function getModalData() {
  const supabase = getSupabaseServerClient();

  // Fetch books, categories, and authors in parallel
  const [booksResult, categoriesResult, authorsResult] = await Promise.all([
    supabase
      .from('books')
      .select('*, authors(*), book_categories(categories(*))')
      .order('created_at', { ascending: false })
      .limit(100),
    supabase
      .from('categories')
      .select('*')
      .order('display_order', { ascending: true }),
    supabase
      .from('authors')
      .select('*')
      .order('name', { ascending: true }),
  ]);

  const books = (booksResult.data ?? []) as DbBook[];
  const categories = (categoriesResult.data ?? []) as DbCategory[];
  const authors = (authorsResult.data ?? []) as DbAuthor[];

  return {
    books: books.map(transformBook),
    categories: categories.map(transformCategory),
    authors: authors.map(transformAuthor),
  };
}

export async function SiteHeaderWrapper(props: { user?: JwtPayload | null }) {
  const data = await getModalData();

  return <SiteHeader user={props.user ?? null} {...data} />;
}
