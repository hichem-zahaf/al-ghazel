-- User Preferences Migration
-- Adds tables for tracking user reading history, author preferences, and rating preferences
-- for personalized book recommendations

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- User Author Preferences Table
-- Tracks user interest levels in specific authors
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.user_author_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id UUID NOT NULL REFERENCES public.accounts(id) ON DELETE CASCADE,
  author_id UUID NOT NULL REFERENCES public.authors(id) ON DELETE CASCADE,
  interest_level INTEGER DEFAULT 0 CHECK (interest_level >= 0 AND interest_level <= 100),
  is_favorite BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(account_id, author_id)
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_user_author_preferences_account ON public.user_author_preferences(account_id);
CREATE INDEX IF NOT EXISTS idx_user_author_preferences_author ON public.user_author_preferences(author_id);
CREATE INDEX IF NOT EXISTS idx_user_author_preferences_interest ON public.user_author_preferences(interest_level);
CREATE INDEX IF NOT EXISTS idx_user_author_preferences_favorite ON public.user_author_preferences(is_favorite) WHERE is_favorite = TRUE;

-- Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_user_author_preferences_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER user_author_preferences_updated_at
  BEFORE UPDATE ON public.user_author_preferences
  FOR EACH ROW
  EXECUTE FUNCTION update_user_author_preferences_updated_at();

-- ============================================================================
-- User Reading History Table
-- Tracks user interactions with books for personalization
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.user_reading_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id UUID NOT NULL REFERENCES public.accounts(id) ON DELETE CASCADE,
  book_id UUID NOT NULL REFERENCES public.books(id) ON DELETE CASCADE,
  action_type VARCHAR(50) NOT NULL CHECK (action_type IN ('viewed', 'searched', 'added_to_cart', 'purchased')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  metadata JSONB DEFAULT '{}'::JSONB
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_user_reading_history_account_book ON public.user_reading_history(account_id, book_id);
CREATE INDEX IF NOT EXISTS idx_user_reading_history_account_created ON public.user_reading_history(account_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_user_reading_history_book ON public.user_reading_history(book_id);
CREATE INDEX IF NOT EXISTS idx_user_reading_history_action ON public.user_reading_history(action_type);
CREATE INDEX IF NOT EXISTS idx_user_reading_history_created ON public.user_reading_history(created_at DESC);

-- ============================================================================
-- User Rating Preferences Table
-- Stores user rating and category preferences for recommendations
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.user_rating_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id UUID NOT NULL REFERENCES public.accounts(id) ON DELETE CASCADE,
  min_rating DECIMAL(3,2) DEFAULT 0 CHECK (min_rating >= 0 AND min_rating <= 5),
  preferred_categories UUID[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(account_id)
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_user_rating_preferences_account ON public.user_rating_preferences(account_id);
CREATE INDEX IF NOT EXISTS idx_user_rating_preferences_min_rating ON public.user_rating_preferences(min_rating);

-- Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_user_rating_preferences_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER user_rating_preferences_updated_at
  BEFORE UPDATE ON public.user_rating_preferences
  FOR EACH ROW
  EXECUTE FUNCTION update_user_rating_preferences_updated_at();

-- ============================================================================
-- Row Level Security (RLS) Policies
-- ============================================================================

-- Enable RLS on all tables
ALTER TABLE public.user_author_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_reading_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_rating_preferences ENABLE ROW LEVEL SECURITY;

-- User Author Preferences RLS
-- Users can read their own preferences
CREATE POLICY user_author_preferences_read_own ON public.user_author_preferences
  FOR SELECT USING (auth.uid() = account_id);

-- Users can insert their own preferences
CREATE POLICY user_author_preferences_insert_own ON public.user_author_preferences
  FOR INSERT WITH CHECK (auth.uid() = account_id);

-- Users can update their own preferences
CREATE POLICY user_author_preferences_update_own ON public.user_author_preferences
  FOR UPDATE USING (auth.uid() = account_id);

-- Users can delete their own preferences
CREATE POLICY user_author_preferences_delete_own ON public.user_author_preferences
  FOR DELETE USING (auth.uid() = account_id);

-- Service role can read all preferences (for recommendation algorithms)
CREATE POLICY user_author_preferences_service_read ON public.user_author_preferences
  FOR SELECT USING (auth.role() = 'service_role');

-- User Reading History RLS
-- Users can read their own history
CREATE POLICY user_reading_history_read_own ON public.user_reading_history
  FOR SELECT USING (auth.uid() = account_id);

-- Users can insert their own history
CREATE POLICY user_reading_history_insert_own ON public.user_reading_history
  FOR INSERT WITH CHECK (auth.uid() = account_id);

-- Users can delete their own history
CREATE POLICY user_reading_history_delete_own ON public.user_reading_history
  FOR DELETE USING (auth.uid() = account_id);

-- Service role can read all history (for recommendation algorithms)
CREATE POLICY user_reading_history_service_read ON public.user_reading_history
  FOR SELECT USING (auth.role() = 'service_role');

-- User Rating Preferences RLS
-- Users can read their own preferences
CREATE POLICY user_rating_preferences_read_own ON public.user_rating_preferences
  FOR SELECT USING (auth.uid() = account_id);

-- Users can insert their own preferences
CREATE POLICY user_rating_preferences_insert_own ON public.user_rating_preferences
  FOR INSERT WITH CHECK (auth.uid() = account_id);

-- Users can update their own preferences
CREATE POLICY user_rating_preferences_update_own ON public.user_rating_preferences
  FOR UPDATE USING (auth.uid() = account_id);

-- Users can delete their own preferences
CREATE POLICY user_rating_preferences_delete_own ON public.user_rating_preferences
  FOR DELETE USING (auth.uid() = account_id);

-- Service role can read all preferences (for recommendation algorithms)
CREATE POLICY user_rating_preferences_service_read ON public.user_rating_preferences
  FOR SELECT USING (auth.role() = 'service_role');

-- ============================================================================
-- Helper Functions
-- ============================================================================

-- Function to increment author interest level
CREATE OR REPLACE FUNCTION increment_author_interest(
  p_account_id UUID,
  p_author_id UUID,
  p_amount INTEGER DEFAULT 1
)
RETURNS VOID AS $$
DECLARE
  v_current_level INTEGER;
BEGIN
  -- Insert or update author interest
  INSERT INTO public.user_author_preferences (account_id, author_id, interest_level)
  VALUES (p_account_id, p_author_id, p_amount)
  ON CONFLICT (account_id, author_id)
  DO UPDATE SET
    interest_level = LEAST(user_author_preferences.interest_level + p_amount, 100),
    updated_at = NOW();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get user's preferred author IDs
CREATE OR REPLACE FUNCTION get_preferred_authors(p_account_id UUID, p_min_level INTEGER DEFAULT 10)
RETURNS TABLE (author_id UUID) AS $$
BEGIN
  RETURN QUERY
  SELECT uap.author_id
  FROM public.user_author_preferences uap
  WHERE uap.account_id = p_account_id
    AND uap.interest_level >= p_min_level
  ORDER BY uap.interest_level DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get user's reading history by action type
CREATE OR REPLACE FUNCTION get_reading_history_by_action(
  p_account_id UUID,
  p_action_type VARCHAR
)
RETURNS TABLE (book_id UUID, created_at TIMESTAMPTZ) AS $$
BEGIN
  RETURN QUERY
  SELECT urh.book_id, urh.created_at
  FROM public.user_reading_history urh
  WHERE urh.account_id = p_account_id
    AND urh.action_type = p_action_type
  ORDER BY urh.created_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- Triggers for automatic preference updates
-- ============================================================================

-- Update author interest when book is viewed
CREATE OR REPLACE FUNCTION update_author_interest_on_view()
RETURNS TRIGGER AS $$
BEGIN
  PERFORM increment_author_interest(NEW.account_id,
    (SELECT author_id FROM public.books WHERE id = NEW.book_id),
    5); -- +5 interest per view
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER update_author_interest_after_view
  AFTER INSERT ON public.user_reading_history
  FOR EACH ROW
  WHEN (NEW.action_type = 'viewed')
  EXECUTE FUNCTION update_author_interest_on_view();

-- Update author interest when book is purchased (higher increment)
CREATE OR REPLACE FUNCTION update_author_interest_on_purchase()
RETURNS TRIGGER AS $$
BEGIN
  PERFORM increment_author_interest(NEW.account_id,
    (SELECT author_id FROM public.books WHERE id = NEW.book_id),
    20); -- +20 interest per purchase
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER update_author_interest_after_purchase
  AFTER INSERT ON public.user_reading_history
  FOR EACH ROW
  WHEN (NEW.action_type = 'purchased')
  EXECUTE FUNCTION update_author_interest_on_purchase();

-- Grant execute permissions on functions
GRANT EXECUTE ON FUNCTION increment_author_interest TO authenticated;
GRANT EXECUTE ON FUNCTION get_preferred_authors TO authenticated;
GRANT EXECUTE ON FUNCTION get_reading_history_by_action TO authenticated;
