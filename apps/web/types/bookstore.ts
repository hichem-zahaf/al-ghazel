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
  originalPrice?: number;
  discountPercentage?: number;
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

// ============================================================================
// Cart Types
// ============================================================================

export type DiscountType = 'percentage' | 'fixed' | 'free_shipping';

export interface Coupon {
  id: string;
  code: string;
  discountType: DiscountType;
  discountValue: number;
  minOrderAmount?: number;
  maxUses?: number;
  usedCount?: number;
  expiresAt?: Date;
  freeShipping?: boolean;
  description?: string;
}

export interface CartItem {
  id: string; // Unique ID for the cart item
  bookId: string;
  book: Book;
  quantity: number;
  addedAt: Date;
}

export interface CartState {
  items: CartItem[];
  appliedCoupon: Coupon | null;
  subtotal: number;
  discount: number;
  deliveryFee: number;
  total: number;
  itemCount: number;
}

export interface CartStore extends CartState {
  // Actions
  addItem: (book: Book) => void;
  removeItem: (bookId: string) => void;
  updateQuantity: (bookId: string, quantity: number) => void;
  clearCart: () => void;
  applyCoupon: (coupon: Coupon) => { success: boolean; message?: string };
  removeCoupon: () => void;
  syncWithServer: () => Promise<void>;
  initializeCart: () => void;
}
