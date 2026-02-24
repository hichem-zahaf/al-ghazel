-- Add slug and short_id columns to books table
-- This enables user-friendly URLs like /books/the-great-gatsby-aB3xK9

-- Add slug column (transliterated title)
ALTER TABLE public.books
  ADD COLUMN IF NOT EXISTS slug VARCHAR(255);

-- Add short_id column (8-character unique identifier)
ALTER TABLE public.books
  ADD COLUMN IF NOT EXISTS short_id VARCHAR(8) UNIQUE;

-- Create index for efficient lookups by slug+short_id
CREATE INDEX IF NOT EXISTS idx_books_slug_short_id
  ON public.books(slug, short_id);

-- ============================================
-- Helper function to transliterate text to slug
-- Handles Arabic characters and special chars
-- ============================================
CREATE OR REPLACE FUNCTION generate_slug(text TEXT)
RETURNS VARCHAR(255) AS $$
DECLARE
  result TEXT;
BEGIN
  -- Basic transliteration (Arabic to Latin, remove special chars)
  result = lower(text);

  -- Arabic to Latin transliteration
  result = replace(result, 'ا', 'a');
  result = replace(result, 'أ', 'a');
  result = replace(result, 'إ', 'i');
  result = replace(result, 'آ', 'aa');
  result = replace(result, 'ب', 'b');
  result = replace(result, 'ت', 't');
  result = replace(result, 'ث', 'th');
  result = replace(result, 'ج', 'j');
  result = replace(result, 'ح', 'h');
  result = replace(result, 'خ', 'kh');
  result = replace(result, 'د', 'd');
  result = replace(result, 'ذ', 'dh');
  result = replace(result, 'ر', 'r');
  result = replace(result, 'ز', 'z');
  result = replace(result, 'س', 's');
  result = replace(result, 'ش', 'sh');
  result = replace(result, 'ص', 's');
  result = replace(result, 'ض', 'd');
  result = replace(result, 'ط', 't');
  result = replace(result, 'ظ', 'z');
  result = replace(result, 'ع', 'a');
  result = replace(result, 'غ', 'gh');
  result = replace(result, 'ف', 'f');
  result = replace(result, 'ق', 'q');
  result = replace(result, 'ك', 'k');
  result = replace(result, 'ل', 'l');
  result = replace(result, 'م', 'm');
  result = replace(result, 'ن', 'n');
  result = replace(result, 'ه', 'h');
  result = replace(result, 'و', 'w');
  result = replace(result, 'ي', 'y');
  result = replace(result, 'ى', 'a');
  result = replace(result, 'ة', 'a');

  -- Remove special characters, replace spaces with hyphens
  result = regexp_replace(result, '[^a-z0-9\s-]', '', 'g');
  result = regexp_replace(result, '\s+', '-', 'g');
  result = regexp_replace(result, '-+', '-', 'g');

  -- Trim and limit length
  result = trim(both '-' from result);
  result = substring(result from 1 for 200);

  RETURN result;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- ============================================
-- Auto-generation trigger for new books
-- ============================================
CREATE OR REPLACE FUNCTION generate_book_slug_and_id()
RETURNS TRIGGER AS $$
DECLARE
  new_slug TEXT;
  new_short_id TEXT;
  counter INTEGER := 0;
BEGIN
  -- Generate short_id if null
  IF NEW.short_id IS NULL THEN
    LOOP
      -- Generate 8-character random string using base64
      new_short_id := encode(gen_random_bytes(6), 'base64');
      -- Remove base64 padding characters
      new_short_id := regexp_replace(new_short_id, '[+/=]', '', 'g');
      new_short_id := upper(new_short_id);

      -- Check for uniqueness (retry if collision)
      EXIT WHEN NOT EXISTS (SELECT 1 FROM public.books WHERE short_id = new_short_id);
      counter := counter + 1;
      IF counter > 100 THEN
        RAISE EXCEPTION 'Failed to generate unique short_id after 100 attempts';
      END IF;
    END LOOP;
    NEW.short_id := new_short_id;
  END IF;

  -- Generate slug from title if null
  IF NEW.slug IS NULL AND NEW.title IS NOT NULL THEN
    new_slug := generate_slug(NEW.title);

    -- Handle duplicate slugs by appending short_id
    IF EXISTS (SELECT 1 FROM public.books WHERE slug = new_slug AND id != NEW.id) THEN
      new_slug := new_slug || '-' || NEW.short_id;
    END IF;

    NEW.slug := new_slug;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for auto-generation on INSERT
DROP TRIGGER IF EXISTS book_auto_generate_slug_and_id ON public.books;
CREATE TRIGGER book_auto_generate_slug_and_id
  BEFORE INSERT ON public.books
  FOR EACH ROW
  EXECUTE FUNCTION generate_book_slug_and_id();

-- Also update on title change
DROP TRIGGER IF EXISTS book_auto_update_slug_on_title_change ON public.books;
CREATE TRIGGER book_auto_update_slug_on_title_change
  BEFORE UPDATE OF title ON public.books
  FOR EACH ROW
  WHEN (OLD.title IS DISTINCT FROM NEW.title)
  EXECUTE FUNCTION generate_book_slug_and_id();

-- ============================================
-- Backfill existing books
-- ============================================
-- This will generate slug and short_id for all existing books
-- Run this after the migration is applied
DO $$
DECLARE
  book_record RECORD;
  new_slug TEXT;
  new_short_id TEXT;
  counter INTEGER := 0;
BEGIN
  FOR book_record IN
    SELECT id, title FROM public.books WHERE short_id IS NULL
  LOOP
    -- Generate short_id
    LOOP
      new_short_id := encode(gen_random_bytes(6), 'base64');
      new_short_id := regexp_replace(new_short_id, '[+/=]', '', 'g');
      new_short_id := upper(new_short_id);

      EXIT WHEN NOT EXISTS (SELECT 1 FROM public.books WHERE short_id = new_short_id);
      counter := counter + 1;
      IF counter > 100 THEN
        RAISE EXCEPTION 'Failed to generate unique short_id after 100 attempts';
      END IF;
    END LOOP;

    -- Generate slug
    new_slug := generate_slug(book_record.title);

    -- Check for duplicate slugs and append short_id if needed
    IF EXISTS (SELECT 1 FROM public.books WHERE slug = new_slug AND id != book_record.id) THEN
      new_slug := new_slug || '-' || new_short_id;
    END IF;

    -- Update the book
    UPDATE public.books
    SET slug = new_slug, short_id = new_short_id
    WHERE id = book_record.id;

    counter := 0;
  END LOOP;
END $$;

-- Add comment for documentation
COMMENT ON COLUMN public.books.slug IS 'URL-friendly slug generated from title (transliterated for Arabic)';
COMMENT ON COLUMN public.books.short_id IS '8-character unique identifier for URLs (e.g., AB3XK9MN)';
