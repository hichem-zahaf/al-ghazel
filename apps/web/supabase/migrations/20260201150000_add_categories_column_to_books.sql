-- Add categories array column to books table
-- This replaces the book_categories junction table for simpler category management

-- Add categories column as UUID array
ALTER TABLE public.books
ADD COLUMN IF NOT EXISTS categories UUID[] DEFAULT '{}';

-- Migrate existing data from book_categories junction table
UPDATE public.books
SET categories = (
  SELECT ARRAY_AGG(category_id)
  FROM public.book_categories
  WHERE book_categories.book_id = books.id
)
WHERE EXISTS (
  SELECT 1 FROM public.book_categories WHERE book_categories.book_id = books.id
);

-- Add index for better query performance on categories
CREATE INDEX IF NOT EXISTS idx_books_categories ON public.books USING GIN (categories);

-- Comment
COMMENT ON COLUMN public.books.categories IS 'Array of category IDs - replaces book_categories junction table';

-- ============================================
-- CREATE HELPER FUNCTIONS FOR CATEGORY COUNTS
-- ============================================

-- Function to increment category book counts
CREATE OR REPLACE FUNCTION public.increment_category_counts(category_ids UUID[])
RETURNS void AS $$
BEGIN
  UPDATE public.categories
  SET book_count = book_count + 1
  WHERE id = ANY(category_ids);
END;
$$ LANGUAGE plpgsql;

-- Function to decrement category book counts
CREATE OR REPLACE FUNCTION public.decrement_category_counts(category_ids UUID[])
RETURNS void AS $$
BEGIN
  UPDATE public.categories
  SET book_count = GREATEST(book_count - 1, 0)
  WHERE id = ANY(category_ids);
END;
$$ LANGUAGE plpgsql;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION public.increment_category_counts TO authenticated;
GRANT EXECUTE ON FUNCTION public.decrement_category_counts TO authenticated;
