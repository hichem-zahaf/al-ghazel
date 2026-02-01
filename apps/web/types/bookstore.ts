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

// ============================================================================
// Algeria Location Types
// ============================================================================

export interface Wilaya {
  wilaya_code: string;
  wilaya_name: string;
  wilaya_name_ascii: string;
}

export interface City {
  id: number;
  commune_name: string;
  commune_name_ascii: string;
  daira_name: string;
  daira_name_ascii: string;
  wilaya_code: string;
  wilaya_name: string;
  wilaya_name_ascii: string;
}

// ============================================================================
// Checkout Types
// ============================================================================

export type DeliveryType = 'home_delivery' | 'office_delivery';
export type PaymentMethod = 'payment_on_delivery';

export type OrderStatus = 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'refunded';
export type DeliveryStatus = 'preparing' | 'in_transit' | 'out_for_delivery' | 'delivered' | 'failed' | 'returned';
export type PaymentStatus = 'pending' | 'completed' | 'failed' | 'refunded';

export interface CheckoutFormData {
  // Contact
  email: string;
  phone: string;
  // Address
  wilayaCode: string;
  city: string;
  addressLine: string;
  // Delivery
  deliveryType: DeliveryType;
  deliveryNotes?: string;
  // Payment
  paymentMethod: PaymentMethod;
  // Coupon
  couponCode?: string;
  // Items
  items: CartItem[];
}

export interface SavedCheckoutData {
  email?: string;
  phone?: string;
  wilayaCode?: string;
  city?: string;
  addressLine?: string;
  deliveryType?: DeliveryType;
  updatedAt?: string;
}

export interface OrderItem {
  id: string;
  bookId: string;
  book: {
    title: string;
    coverImage: string;
    author: {
      name: string;
    };
  };
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

export interface ShippingAddress {
  name: string;
  email: string;
  phone: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  wilayaCode: string;
  country: string;
  postalCode?: string;
}

export interface Order {
  id: string;
  orderNumber: string;
  trackingNumber: string;
  status: OrderStatus;
  deliveryStatus: DeliveryStatus;
  paymentStatus: PaymentStatus;
  createdAt: Date;
  estimatedDeliveryDate?: Date;
  items: OrderItem[];
  shippingAddress: ShippingAddress;
  deliveryType: DeliveryType;
  subtotal: number;
  discountAmount: number;
  shippingAmount: number;
  total: number;
  currency: string;
  couponCode?: string;
  customerNotes?: string;
}

export interface CreateOrderRequest {
  email: string;
  phone: string;
  wilayaCode: string;
  city: string;
  addressLine: string;
  deliveryType: DeliveryType;
  deliveryNotes?: string;
  paymentMethod: PaymentMethod;
  couponCode?: string;
  items: CartItem[];
}

export interface CreateOrderResponse {
  success: boolean;
  order?: {
    id: string;
    orderNumber: string;
    trackingNumber: string | null;
  };
  error?: string;
}
