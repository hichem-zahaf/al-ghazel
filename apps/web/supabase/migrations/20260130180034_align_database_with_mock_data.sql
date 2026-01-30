/*
 * -------------------------------------------------------
 * Align Database Schema with Mock Data Structure
 * This migration updates the authors table to include social_links
 * and ensures consistency with the mock data structure
 * -------------------------------------------------------
 */

-- Add social_links column to authors table
ALTER TABLE public.authors
ADD COLUMN IF NOT EXISTS social_links JSONB DEFAULT '{}'::JSONB;

-- Migrate existing website_url to social_links if social_links is empty
UPDATE public.authors
SET social_links = jsonb_build_object(
  'website', website_url,
  'twitter', NULL,
  'instagram', NULL
)
WHERE social_links = '{}'::JSONB AND website_url IS NOT NULL;

COMMENT ON COLUMN public.authors.social_links IS 'Social media links for the author (website, twitter, instagram)';

-- Add column to track book count for authors (denormalized for performance)
ALTER TABLE public.authors
ADD COLUMN IF NOT EXISTS book_count INTEGER DEFAULT 0;

-- Create function to update author book count
CREATE OR REPLACE FUNCTION public.update_author_book_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.authors
    SET book_count = book_count + 1
    WHERE id = NEW.author_id;
  ELSIF TG_OP = 'UPDATE' THEN
    IF OLD.author_id != NEW.author_id THEN
      UPDATE public.authors
      SET book_count = book_count - 1
      WHERE id = OLD.author_id;

      UPDATE public.authors
      SET book_count = book_count + 1
      WHERE id = NEW.author_id;
    END IF;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.authors
    SET book_count = book_count - 1
    WHERE id = OLD.author_id;
  END IF;

  IF TG_OP = 'DELETE' THEN
    RETURN OLD;
  ELSE
    RETURN NEW;
  END IF;
END;
$$ LANGUAGE plpgsql;

-- Drop trigger if exists
DROP TRIGGER IF EXISTS update_author_book_count_trigger ON public.books;

-- Create trigger to update author book count
CREATE TRIGGER update_author_book_count_trigger
AFTER INSERT OR UPDATE OR DELETE ON public.books
FOR EACH ROW
EXECUTE FUNCTION public.update_author_book_count();

-- Add status column to books table for admin management
ALTER TABLE public.books
ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'active'
CHECK (status IN ('active', 'inactive', 'out_of_stock'));

COMMENT ON COLUMN public.books.status IS 'Admin status for book visibility and availability';

-- Update status based on stock quantity
UPDATE public.books
SET status = CASE
  WHEN stock_quantity = 0 THEN 'out_of_stock'
  ELSE 'active'
END;

-- Add status column to authors table for admin management
ALTER TABLE public.authors
ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'active'
CHECK (status IN ('active', 'inactive'));

COMMENT ON COLUMN public.authors.status IS 'Admin status for author visibility';

-- Create index on author status
CREATE INDEX IF NOT EXISTS idx_authors_status ON public.authors(status);

-- Create index on book status
CREATE INDEX IF NOT EXISTS idx_books_status ON public.books(status);

-- Add book_count column to categories table (denormalized for performance)
ALTER TABLE public.categories
ADD COLUMN IF NOT EXISTS book_count INTEGER DEFAULT 0;

-- Create function to update category book count
CREATE OR REPLACE FUNCTION public.update_category_book_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    -- Increment count for the category
    UPDATE public.categories
    SET book_count = book_count + 1
    WHERE id = NEW.category_id;
  ELSIF TG_OP = 'DELETE' THEN
    -- Decrement count for the category
    UPDATE public.categories
    SET book_count = book_count - 1
    WHERE id = OLD.category_id;
  END IF;

  IF TG_OP = 'DELETE' THEN
    RETURN OLD;
  ELSE
    RETURN NEW;
  END IF;
END;
$$ LANGUAGE plpgsql;

-- Drop trigger if exists
DROP TRIGGER IF EXISTS update_category_book_count_trigger ON public.book_categories;

-- Create trigger to update category book count
CREATE TRIGGER update_category_book_count_trigger
AFTER INSERT OR DELETE ON public.book_categories
FOR EACH ROW
EXECUTE FUNCTION public.update_category_book_count();

-- Initialize category book counts from existing data
UPDATE public.categories
SET book_count = (
  SELECT COUNT(*)
  FROM public.book_categories
  WHERE book_categories.category_id = categories.id
);
