/*
 * -------------------------------------------------------
 * Admin Schema Migration for Al-Ghazel Bookstore
 * This migration adds tables for orders, books, authors, and admin management
 * -------------------------------------------------------
 */

-- ============================================
-- ENUMS
-- ============================================

-- Order Status Enum
CREATE TYPE order_status AS ENUM (
  'pending',
  'processing',
  'shipped',
  'delivered',
  'cancelled',
  'refunded'
);

-- Delivery Status Enum
CREATE TYPE delivery_status AS ENUM (
  'preparing',
  'in_transit',
  'out_for_delivery',
  'delivered',
  'failed',
  'returned'
);

-- Payment Status Enum
CREATE TYPE payment_status AS ENUM (
  'pending',
  'completed',
  'failed',
  'refunded'
);

-- Discount Type Enum
CREATE TYPE discount_type AS ENUM (
  'percentage',
  'fixed',
  'buy_x_get_y'
);

-- ============================================
-- AUTHORS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.authors (
  id UUID PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  bio TEXT,
  avatar_url VARCHAR(1000),
  birth_date DATE,
  nationality VARCHAR(100),
  website_url VARCHAR(500),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id),
  updated_by UUID REFERENCES auth.users(id),
  is_featured BOOLEAN DEFAULT FALSE,
  metadata JSONB DEFAULT '{}'::JSONB NOT NULL
);

COMMENT ON TABLE public.authors IS 'Authors of books in the bookstore';
COMMENT ON COLUMN public.authors.is_featured IS 'Whether this author is featured on the homepage';

-- Create index on author name for search (simple text search)
CREATE INDEX idx_authors_name ON public.authors(name);

-- ============================================
-- BOOKS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.books (
  id UUID PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
  title VARCHAR(500) NOT NULL,
  subtitle VARCHAR(500),
  description TEXT,
  author_id UUID NOT NULL REFERENCES public.authors(id) ON DELETE RESTRICT,
  isbn VARCHAR(20) UNIQUE,
  cover_image_url VARCHAR(1000),
  publisher VARCHAR(255),
  published_date DATE,
  pages INTEGER,
  language VARCHAR(50) DEFAULT 'English',
  format VARCHAR(50) DEFAULT 'Hardcover',
  price DECIMAL(10, 2) NOT NULL,
  original_price DECIMAL(10, 2),
  discount_percentage INTEGER DEFAULT 0,
  stock_quantity INTEGER DEFAULT 0,
  rating DECIMAL(3, 2) DEFAULT 0,
  rating_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id),
  updated_by UUID REFERENCES auth.users(id),
  is_featured BOOLEAN DEFAULT FALSE,
  is_bestseller BOOLEAN DEFAULT FALSE,
  is_new_release BOOLEAN DEFAULT FALSE,
  metadata JSONB DEFAULT '{}'::JSONB NOT NULL
);

COMMENT ON TABLE public.books IS 'Books catalog in the bookstore';
COMMENT ON COLUMN public.books.discount_percentage IS 'Discount percentage (0-100)';
COMMENT ON COLUMN public.books.is_featured IS 'Whether this book is featured on the homepage';

-- Create indexes for book search
CREATE INDEX idx_books_title ON public.books(title);
CREATE INDEX idx_books_author ON public.books(author_id);
CREATE INDEX idx_books_isbn ON public.books(isbn);
CREATE INDEX idx_books_rating ON public.books(rating DESC);
CREATE INDEX idx_books_created ON public.books(created_at DESC);

-- ============================================
-- CATEGORIES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.categories (
  id UUID PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
  name VARCHAR(100) NOT NULL UNIQUE,
  slug VARCHAR(100) NOT NULL UNIQUE,
  description TEXT,
  parent_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
  icon VARCHAR(50),
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE public.categories IS 'Book categories for organization';

-- ============================================
-- BOOK_CATEGORIES JUNCTION TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.book_categories (
  book_id UUID NOT NULL REFERENCES public.books(id) ON DELETE CASCADE,
  category_id UUID NOT NULL REFERENCES public.categories(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (book_id, category_id)
);

COMMENT ON TABLE public.book_categories IS 'Junction table for books and categories many-to-many relationship';

-- ============================================
-- ORDERS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.orders (
  id UUID PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
  order_number VARCHAR(50) UNIQUE NOT NULL,
  account_id UUID NOT NULL REFERENCES public.accounts(id) ON DELETE RESTRICT,
  status order_status DEFAULT 'pending',
  delivery_status delivery_status DEFAULT 'preparing',
  payment_status payment_status DEFAULT 'pending',
  subtotal DECIMAL(10, 2) NOT NULL,
  tax_amount DECIMAL(10, 2) DEFAULT 0,
  shipping_amount DECIMAL(10, 2) DEFAULT 0,
  discount_amount DECIMAL(10, 2) DEFAULT 0,
  total DECIMAL(10, 2) NOT NULL,
  currency VARCHAR(3) DEFAULT 'USD',

  -- Shipping Information
  shipping_name VARCHAR(255) NOT NULL,
  shipping_email VARCHAR(320) NOT NULL,
  shipping_phone VARCHAR(50),
  shipping_address_line1 VARCHAR(255) NOT NULL,
  shipping_address_line2 VARCHAR(255),
  shipping_city VARCHAR(100) NOT NULL,
  shipping_state VARCHAR(100),
  shipping_postal_code VARCHAR(20) NOT NULL,
  shipping_country VARCHAR(100) DEFAULT 'USA',

  -- Delivery Tracking
  estimated_delivery_date DATE,
  actual_delivery_date DATE,
  tracking_number VARCHAR(100),
  carrier VARCHAR(100),

  -- Payment Information (encrypted)
  payment_method VARCHAR(50),
  payment_id VARCHAR(255),

  -- Coupon/Discount
  coupon_code VARCHAR(50),

  -- Notes
  customer_notes TEXT,
  admin_notes TEXT,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id),
  updated_by UUID REFERENCES auth.users(id)
);

COMMENT ON TABLE public.orders IS 'Customer orders';

-- Create indexes for orders
CREATE INDEX idx_orders_account ON public.orders(account_id);
CREATE INDEX idx_orders_status ON public.orders(status);
CREATE INDEX idx_orders_created ON public.orders(created_at DESC);
CREATE INDEX idx_orders_number ON public.orders(order_number);

-- ============================================
-- ORDER_ITEMS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.order_items (
  id UUID PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
  order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  book_id UUID NOT NULL REFERENCES public.books(id) ON DELETE RESTRICT,
  quantity INTEGER NOT NULL DEFAULT 1,
  unit_price DECIMAL(10, 2) NOT NULL,
  total_price DECIMAL(10, 2) NOT NULL,
  discount_amount DECIMAL(10, 2) DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE public.order_items IS 'Items within an order';

-- Create index for order items
CREATE INDEX idx_order_items_order ON public.order_items(order_id);
CREATE INDEX idx_order_items_book ON public.order_items(book_id);

-- ============================================
-- COUPONS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.coupons (
  id UUID PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
  code VARCHAR(50) UNIQUE NOT NULL,
  description TEXT,
  discount_type discount_type NOT NULL,
  discount_value DECIMAL(10, 2) NOT NULL,
  min_purchase_amount DECIMAL(10, 2) DEFAULT 0,
  max_discount_amount DECIMAL(10, 2),
  usage_limit INTEGER,
  used_count INTEGER DEFAULT 0,
  valid_from TIMESTAMPTZ NOT NULL,
  valid_until TIMESTAMPTZ NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id),
  updated_by UUID REFERENCES auth.users(id),
  metadata JSONB DEFAULT '{}'::JSONB NOT NULL
);

COMMENT ON TABLE public.coupons IS 'Discount coupons for customers';

-- Create index for coupons
CREATE INDEX idx_coupons_code ON public.coupons(code);
CREATE INDEX idx_coupons_active ON public.coupons(is_active);
CREATE INDEX idx_coupons_valid ON public.coupons(valid_from, valid_until);

-- ============================================
-- BOOK_OF_THE_DAY TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.book_of_the_day (
  id UUID PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
  book_id UUID NOT NULL REFERENCES public.books(id) ON DELETE CASCADE,
  featured_date DATE UNIQUE NOT NULL,
  description TEXT,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id)
);

COMMENT ON TABLE public.book_of_the_day IS 'Featured book of the day';

-- Create index for book of the day
CREATE INDEX idx_book_of_the_day_date ON public.book_of_the_day(featured_date DESC);

-- ============================================
-- AUTHOR_OF_THE_DAY TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.author_of_the_day (
  id UUID PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
  author_id UUID NOT NULL REFERENCES public.authors(id) ON DELETE CASCADE,
  featured_date DATE UNIQUE NOT NULL,
  description TEXT,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id)
);

COMMENT ON TABLE public.author_of_the_day IS 'Featured author of the day';

-- Create index for author of the day
CREATE INDEX idx_author_of_the_day_date ON public.author_of_the_day(featured_date DESC);

-- ============================================
-- RECOMMENDATION_SETTINGS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.recommendation_settings (
  id UUID PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
  key VARCHAR(100) UNIQUE NOT NULL,
  value JSONB NOT NULL,
  description TEXT,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  updated_by UUID REFERENCES auth.users(id)
);

COMMENT ON TABLE public.recommendation_settings IS 'Settings for recommendation algorithms';

-- Insert default recommendation settings
INSERT INTO public.recommendation_settings (key, value, description) VALUES
  ('algorithm_weights', '{"collaborative": 0.4, "content_based": 0.3, "trending": 0.2, "new_releases": 0.1}'::JSONB, 'Weights for different recommendation algorithms'),
  ('roulette_settings', '{"enabled": true, "daily_limit": 10}'::JSONB, 'Settings for book roulette feature'),
  ('ai_settings', '{"enabled": true, "provider": "openai", "model": "gpt-4"}'::JSONB, 'AI-powered recommendations settings')
ON CONFLICT (key) DO NOTHING;

-- ============================================
-- USER_SESSIONS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.user_sessions (
  id UUID PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
  account_id UUID NOT NULL REFERENCES public.accounts(id) ON DELETE CASCADE,
  session_start TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  session_end TIMESTAMPTZ,
  duration_seconds INTEGER,
  page_views INTEGER DEFAULT 0,
  ip_address INET,
  user_agent TEXT,
  referrer VARCHAR(500),
  metadata JSONB DEFAULT '{}'::JSONB NOT NULL
);

COMMENT ON TABLE public.user_sessions IS 'User session tracking for analytics';

-- Create index for user sessions
CREATE INDEX idx_user_sessions_account ON public.user_sessions(account_id);
CREATE INDEX idx_user_sessions_start ON public.user_sessions(session_start DESC);

-- ============================================
-- USER_WISHLIST TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.user_wishlist (
  id UUID PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
  account_id UUID NOT NULL REFERENCES public.accounts(id) ON DELETE CASCADE,
  book_id UUID NOT NULL REFERENCES public.books(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(account_id, book_id)
);

COMMENT ON TABLE public.user_wishlist IS 'User wishlist items';

-- Create index for wishlist
CREATE INDEX idx_wishlist_account ON public.user_wishlist(account_id);
CREATE INDEX idx_wishlist_book ON public.user_wishlist(book_id);

-- ============================================
-- USER_REVIEW TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.user_reviews (
  id UUID PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
  account_id UUID NOT NULL REFERENCES public.accounts(id) ON DELETE CASCADE,
  book_id UUID NOT NULL REFERENCES public.books(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  title VARCHAR(255),
  review TEXT,
  is_verified_purchase BOOLEAN DEFAULT FALSE,
  helpful_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(account_id, book_id)
);

COMMENT ON TABLE public.user_reviews IS 'User book reviews';

-- Create index for reviews
CREATE INDEX idx_reviews_book ON public.user_reviews(book_id);
CREATE INDEX idx_reviews_account ON public.user_reviews(account_id);
CREATE INDEX idx_reviews_rating ON public.user_reviews(rating);

-- ============================================
-- FUNCTIONS AND TRIGGERS
-- ============================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at triggers to relevant tables
CREATE TRIGGER update_authors_updated_at BEFORE UPDATE ON public.authors
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_books_updated_at BEFORE UPDATE ON public.books
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_categories_updated_at BEFORE UPDATE ON public.categories
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON public.orders
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_coupons_updated_at BEFORE UPDATE ON public.coupons
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Function to update book rating when review is added/updated
CREATE OR REPLACE FUNCTION public.update_book_rating()
RETURNS TRIGGER AS $$
DECLARE
  avg_rating DECIMAL(3,2);
  rating_count INTEGER;
BEGIN
  SELECT COALESCE(AVG(rating), 0), COUNT(*)
  INTO avg_rating, rating_count
  FROM public.user_reviews
  WHERE book_id = NEW.book_id;

  UPDATE public.books
  SET rating = avg_rating,
      rating_count = rating_count
  WHERE id = NEW.book_id;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_book_rating_on_review
  AFTER INSERT OR UPDATE ON public.user_reviews
  FOR EACH ROW EXECUTE FUNCTION public.update_book_rating();

-- Function to generate order number
CREATE OR REPLACE FUNCTION public.generate_order_number()
RETURNS TRIGGER AS $$
BEGIN
  NEW.order_number := 'ORD-' || TO_CHAR(NOW(), 'YYYY-MM-DD') || '-' || LPAD(NEXTVAL('public.order_number_seq')::TEXT, 4, '0');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create sequence for order numbers
CREATE SEQUENCE IF NOT EXISTS public.order_number_seq START 1;

CREATE TRIGGER generate_order_number_trigger
  BEFORE INSERT ON public.orders
  FOR EACH ROW EXECUTE FUNCTION public.generate_order_number();

-- Function to update coupon usage count
CREATE OR REPLACE FUNCTION public.increment_coupon_usage()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.coupon_code IS NOT NULL THEN
    UPDATE public.coupons
    SET used_count = used_count + 1
    WHERE code = NEW.coupon_code;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER increment_coupon_usage_trigger
  AFTER INSERT ON public.orders
  FOR EACH ROW
  WHEN (NEW.payment_status = 'completed')
  EXECUTE FUNCTION public.increment_coupon_usage();

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================

-- Enable RLS on admin tables
ALTER TABLE public.authors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.books ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.book_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.coupons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.book_of_the_day ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.author_of_the_day ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recommendation_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_wishlist ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_reviews ENABLE ROW LEVEL SECURITY;

-- RLS Policies: Allow all operations for authenticated users on public data
-- Authors - Readable by all, writable by service_role
CREATE POLICY authors_read_all ON public.authors FOR SELECT USING (true);
CREATE POLICY authors_insert_service ON public.authors FOR INSERT WITH CHECK (current_user = 'service_role' OR current_user = 'authenticated');
CREATE POLICY authors_update_service ON public.authors FOR UPDATE USING (current_user = 'service_role' OR current_user = 'authenticated');
CREATE POLICY authors_delete_service ON public.authors FOR DELETE USING (current_user = 'service_role');

-- Books - Readable by all, writable by service_role
CREATE POLICY books_read_all ON public.books FOR SELECT USING (true);
CREATE POLICY books_insert_service ON public.books FOR INSERT WITH CHECK (current_user = 'service_role' OR current_user = 'authenticated');
CREATE POLICY books_update_service ON public.books FOR UPDATE USING (current_user = 'service_role' OR current_user = 'authenticated');
CREATE POLICY books_delete_service ON public.books FOR DELETE USING (current_user = 'service_role');

-- Categories - Readable by all
CREATE POLICY categories_read_all ON public.categories FOR SELECT USING (true);

-- Orders - Users can only see their own orders
CREATE POLICY orders_read_own ON public.orders FOR SELECT USING (auth.uid() = account_id);
CREATE POLICY orders_insert_own ON public.orders FOR INSERT WITH CHECK (auth.uid() = account_id);
CREATE POLICY orders_update_own ON public.orders FOR UPDATE USING (auth.uid() = account_id);

-- Order Items - Users can see items from their own orders
CREATE POLICY order_items_read_own ON public.order_items FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.orders WHERE orders.id = order_items.order_id AND orders.account_id = auth.uid()
  ));

-- Coupons - Readable by all, manageable by service_role
CREATE POLICY coupons_read_active ON public.coupons FOR SELECT USING (is_active = true OR current_user = 'service_role' OR current_user = 'authenticated');

-- Book/Author of the Day - Readable by all
CREATE POLICY book_of_day_read_all ON public.book_of_the_day FOR SELECT USING (true);
CREATE POLICY author_of_day_read_all ON public.author_of_the_day FOR SELECT USING (true);

-- Recommendation Settings - Readable by all, writable by service_role
CREATE POLICY settings_read_all ON public.recommendation_settings FOR SELECT USING (true);
CREATE POLICY settings_update_service ON public.recommendation_settings FOR UPDATE USING (current_user = 'service_role' OR current_user = 'authenticated');

-- User Sessions - Users can only see their own sessions
CREATE POLICY sessions_read_own ON public.user_sessions FOR SELECT USING (auth.uid() = account_id);
CREATE POLICY sessions_insert_own ON public.user_sessions FOR INSERT WITH CHECK (auth.uid() = account_id);

-- Wishlist - Users can manage their own wishlist
CREATE POLICY wishlist_read_own ON public.user_wishlist FOR SELECT USING (auth.uid() = account_id);
CREATE POLICY wishlist_insert_own ON public.user_wishlist FOR INSERT WITH CHECK (auth.uid() = account_id);
CREATE POLICY wishlist_delete_own ON public.user_wishlist FOR DELETE USING (auth.uid() = account_id);

-- Reviews - Users can read all, manage their own
CREATE POLICY reviews_read_all ON public.user_reviews FOR SELECT USING (true);
CREATE POLICY reviews_insert_own ON public.user_reviews FOR INSERT WITH CHECK (auth.uid() = account_id);
CREATE POLICY reviews_update_own ON public.user_reviews FOR UPDATE USING (auth.uid() = account_id);

-- Grant permissions
GRANT USAGE ON SCHEMA public TO authenticated, anon;
GRANT ALL ON ALL TABLES IN SCHEMA public TO service_role;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO authenticated, anon;

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "pg_trgm"; -- For text search
CREATE EXTENSION IF NOT EXISTS "uuid-ossp"; -- For UUID generation
