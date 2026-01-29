/**
 * Bookstore Type Definitions
 * Defines all interfaces for books, authors, categories, and featured content
 */

export interface Book {
  id: string;
  title: string;
  author: Author;
  coverImage: string;
  price: number;
  description: string;
  categories: Category[];
  rating: number;
  publishedDate: Date;
  isbn: string;
  pages: number;
  language?: string;
  publisher?: string;
}

export interface Author {
  id: string;
  name: string;
  avatar: string;
  bio: string;
  books?: Book[];
  socialLinks?: {
    website?: string;
    twitter?: string;
    instagram?: string;
  };
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  icon?: string;
  bookCount: number;
  description?: string;
}

export interface BookOfTheDay {
  book: Book;
  featuredAt: Date;
  reason: string;
  quote?: string;
}

export interface AuthorOfTheDay {
  author: Author;
  featuredAt: Date;
  reason: string;
  featuredBooks: Book[];
}

export interface SearchFilters {
  query: string;
  category?: string;
  author?: string;
  minPrice?: number;
  maxPrice?: number;
  minRating?: number;
}

export type SortOption = 'relevance' | 'price-low' | 'price-high' | 'rating' | 'date-newest' | 'date-oldest';

export interface RouletteSegment {
  book: Book;
  color: string;
  angle: number;
}

export interface NavigationItem {
  label: string;
  href?: string;
  icon?: string;
  action?: () => void;
}
