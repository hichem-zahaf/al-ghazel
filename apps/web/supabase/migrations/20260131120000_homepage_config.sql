/*
 * -------------------------------------------------------
 * Homepage Configuration Table
 * This migration creates the homepage_config table to store
 * homepage section configurations, order, enabled status, and settings
 * -------------------------------------------------------
 */

-- Create homepage_config table
CREATE TABLE IF NOT EXISTS public.homepage_config (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  section_id VARCHAR(100) NOT NULL UNIQUE,
  section_title VARCHAR(255) NOT NULL,
  section_description TEXT,
  enabled BOOLEAN DEFAULT true,
  display_order INTEGER NOT NULL DEFAULT 0,
  config JSONB DEFAULT '{}'::JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_by UUID REFERENCES public.accounts(id) ON DELETE SET NULL
);

-- Add comments
COMMENT ON TABLE public.homepage_config IS 'Homepage section configuration for layout management';
COMMENT ON COLUMN public.homepage_config.section_id IS 'Unique identifier for the section (e.g., hero, categories, book-of-the-day)';
COMMENT ON COLUMN public.homepage_config.section_title IS 'Display title of the section';
COMMENT ON COLUMN public.homepage_config.section_description IS 'Description of what this section does';
COMMENT ON COLUMN public.homepage_config.enabled IS 'Whether the section is visible on the homepage';
COMMENT ON COLUMN public.homepage_config.display_order IS 'Order in which sections appear on the homepage (lower numbers appear first)';
COMMENT ON COLUMN public.homepage_config.config IS 'Section-specific configuration settings stored as JSON';

-- Create index for display order
CREATE INDEX IF NOT EXISTS idx_homepage_config_display_order ON public.homepage_config(display_order);

-- Create index for enabled sections
CREATE INDEX IF NOT EXISTS idx_homepage_config_enabled ON public.homepage_config(enabled);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_homepage_config_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for updated_at
DROP TRIGGER IF EXISTS homepage_config_updated_at_trigger ON public.homepage_config;

CREATE TRIGGER homepage_config_updated_at_trigger
BEFORE UPDATE ON public.homepage_config
FOR EACH ROW
EXECUTE FUNCTION public.update_homepage_config_updated_at();

-- Insert default homepage sections with their configurations
INSERT INTO public.homepage_config (section_id, section_title, section_description, enabled, display_order, config) VALUES
  (
    'hero',
    'Hero Section',
    'Main banner and call-to-action area at the top of the page',
    true,
    1,
    '{
      "title": "Welcome to Al-Ghazel Bookstore",
      "subtitle": "Discover your next favorite book from our curated collection",
      "ctaText": "Browse Collection",
      "ctaLink": "/books",
      "backgroundImage": "/images/hero-bg.jpg",
      "showOverlay": true,
      "featuredAuthorId": null,
      "autoRotateAuthor": true
    }'::JSONB
  ),
  (
    'categories',
    'Category Carousel',
    'Horizontal scrollable list of book categories',
    true,
    2,
    '{
      "title": "Browse by Category",
      "showIcon": true,
      "showBookCount": true,
      "autoScroll": false,
      "scrollSpeed": 3000,
      "selectedCategoryIds": []
    }'::JSONB
  ),
  (
    'book-of-the-day',
    'Book of the Day',
    'Featured book with detailed description',
    true,
    3,
    '{
      "title": "Book of the Day",
      "bookId": null,
      "featuredDate": null,
      "reason": "",
      "showRating": true,
      "showPrice": true,
      "showAddToCart": true,
      "layout": "featured"
    }'::JSONB
  ),
  (
    'author-of-the-day',
    'Author of the Day',
    'Featured author spotlight section',
    true,
    4,
    '{
      "title": "Author Spotlight",
      "authorId": null,
      "featuredDate": null,
      "reason": "",
      "showBio": true,
      "showBookCount": true,
      "showSocialLinks": true,
      "maxBooks": 3,
      "selectedBookIds": []
    }'::JSONB
  ),
  (
    'recommended-books',
    'Recommended Books',
    'Bestsellers and trending books section',
    true,
    5,
    '{
      "title": "Recommended for You",
      "subtitle": "Handpicked selections based on popularity",
      "source": "bestsellers",
      "categoryId": null,
      "bookCount": 6,
      "selectedBookIds": [],
      "showRating": true,
      "showAuthor": true,
      "layout": "grid"
    }'::JSONB
  ),
  (
    'for-you',
    'For You Section',
    'Personalized new releases and recommendations',
    true,
    6,
    '{
      "title": "New Releases Just for You",
      "subtitle": "Fresh arrivals tailored to your taste",
      "source": "new-releases",
      "categoryId": null,
      "bookCount": 12,
      "selectedBookIds": [],
      "showNewBadge": true,
      "showDiscount": true,
      "layout": "horizontal-scroll"
    }'::JSONB
  ),
  (
    'book-roulette',
    'Book Roulette',
    'Interactive random book discovery section',
    true,
    7,
    '{
      "title": "Feeling Lucky?",
      "description": "Spin to discover a random book from our collection",
      "source": "all",
      "categoryId": null,
      "selectedBookIds": [],
      "showAnimation": true,
      "dailyLimit": 10
    }'::JSONB
  ),
  (
    'search',
    'Search Section',
    'Advanced search and filter area',
    true,
    8,
    '{
      "title": "Find Your Perfect Book",
      "placeholder": "Search by title, author, ISBN...",
      "showFilters": true,
      "showSuggestions": true,
      "filterCategories": true,
      "filterAuthors": true,
      "filterPrice": true,
      "filterRating": true,
      "filterFormat": true,
      "filterLanguage": true
    }'::JSONB
  )
ON CONFLICT (section_id) DO NOTHING;

-- Enable RLS
ALTER TABLE public.homepage_config ENABLE ROW LEVEL SECURITY;

-- Create RLS policies - only authenticated users can read/write
-- For now, allow all authenticated users to manage homepage config
-- In production, you may want to restrict this to admin users only

CREATE POLICY "Allow authenticated users to read homepage config"
ON public.homepage_config
FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Allow authenticated users to insert homepage config"
ON public.homepage_config
FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "Allow authenticated users to update homepage config"
ON public.homepage_config
FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);

CREATE POLICY "Allow authenticated users to delete homepage config"
ON public.homepage_config
FOR DELETE
TO authenticated
USING (true);
