/*
 * -------------------------------------------------------
 * AI Credits and Book Embeddings
 * This migration adds:
 * - User AI credits tracking
 * - Book embeddings for RAG
 * - AI chat history
 * - is_admin column to accounts table
 * -------------------------------------------------------
 */

-- Enable pgvector extension for vector embeddings
-- Must be enabled before creating tables that use VECTOR type
CREATE EXTENSION IF NOT EXISTS vector;

-- Add is_admin column to accounts table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'accounts'
    AND column_name = 'is_admin'
  ) THEN
    ALTER TABLE public.accounts ADD COLUMN is_admin BOOLEAN DEFAULT FALSE;
  END IF;
END $$;

COMMENT ON COLUMN public.accounts.is_admin IS 'Whether this account has admin privileges';

-- User AI Credits Table
CREATE TABLE IF NOT EXISTS public.user_ai_credits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id UUID NOT NULL REFERENCES public.accounts(id) ON DELETE CASCADE,
  credits_used INTEGER NOT NULL DEFAULT 0,
  credits_limit INTEGER NOT NULL,
  last_reset_date DATE DEFAULT CURRENT_DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(account_id)
);

-- Add comments
COMMENT ON TABLE public.user_ai_credits IS 'Track AI chat credits per user';
COMMENT ON COLUMN public.user_ai_credits.credits_used IS 'Number of credits used in current period';
COMMENT ON COLUMN public.user_ai_credits.credits_limit IS 'Maximum credits per period (0 = unlimited for admins)';
COMMENT ON COLUMN public.user_ai_credits.last_reset_date IS 'Last date when credits were reset';

-- Index for lookups
CREATE INDEX IF NOT EXISTS idx_user_ai_credits_account_id ON public.user_ai_credits(account_id);

-- Function to reset credits daily
CREATE OR REPLACE FUNCTION public.reset_ai_credits_if_needed()
RETURNS TRIGGER AS $$
BEGIN
  -- Reset if new day
  IF NEW.last_reset_date < CURRENT_DATE THEN
    NEW.credits_used = 0;
    NEW.last_reset_date = CURRENT_DATE;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for auto-reset
DROP TRIGGER IF EXISTS user_ai_credits_reset_trigger ON public.user_ai_credits;

CREATE TRIGGER user_ai_credits_reset_trigger
BEFORE INSERT OR UPDATE ON public.user_ai_credits
FOR EACH ROW
EXECUTE FUNCTION public.reset_ai_credits_if_needed();

-- Function to initialize user credits
CREATE OR REPLACE FUNCTION public.initialize_user_ai_credits()
RETURNS TRIGGER AS $$
DECLARE
  v_is_admin BOOLEAN;
  v_credit_limit INTEGER;
BEGIN
  -- Check if user is admin (using the is_admin column)
  SELECT is_admin INTO v_is_admin
  FROM public.accounts
  WHERE id = NEW.id;

  -- Set credit limit based on admin status
  v_credit_limit := CASE WHEN v_is_admin THEN 0 ELSE (SELECT COALESCE(user_credits_limit, 10) FROM public.ai_config LIMIT 1) END;

  -- Initialize credits
  INSERT INTO public.user_ai_credits (account_id, credits_used, credits_limit)
  VALUES (NEW.id, 0, v_credit_limit);

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-initialize credits on account creation
DROP TRIGGER IF EXISTS init_ai_credits_on_account_create ON public.accounts;

CREATE TRIGGER init_ai_credits_on_account_create
AFTER INSERT ON public.accounts
FOR EACH ROW
EXECUTE FUNCTION public.initialize_user_ai_credits();

-- Book Embeddings Table for RAG
CREATE TABLE IF NOT EXISTS public.book_embeddings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  book_id UUID NOT NULL REFERENCES public.books(id) ON DELETE CASCADE,
  embedding VECTOR(1536), -- OpenAI embedding dimension
  embedding_model VARCHAR(100) DEFAULT 'text-embedding-3-small',
  embedding_text TEXT NOT NULL, -- The text that was embedded
  metadata JSONB DEFAULT '{}'::JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(book_id)
);

-- Add comments
COMMENT ON TABLE public.book_embeddings IS 'Store book embeddings for RAG-based semantic search';
COMMENT ON COLUMN public.book_embeddings.embedding IS 'Vector embedding using OpenAI or similar model';
COMMENT ON COLUMN public.book_embeddings.embedding_model IS 'Name of the embedding model used';
COMMENT ON COLUMN public.book_embeddings.embedding_text IS 'The text content that was embedded';

-- Index for vector similarity search (using pgvector)
CREATE INDEX IF NOT EXISTS idx_book_embeddings_embedding
ON public.book_embeddings
USING ivfflat (embedding vector_cosine_ops)
WITH (lists = 100);

-- AI Chat History Table (optional, for context and analytics)
CREATE TABLE IF NOT EXISTS public.ai_chat_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id UUID REFERENCES public.accounts(id) ON DELETE SET NULL,
  session_id UUID NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
  content TEXT NOT NULL,
  recommended_books JSONB DEFAULT '[]'::JSONB,
  metadata JSONB DEFAULT '{}'::JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add comments
COMMENT ON TABLE public.ai_chat_history IS 'Store AI chat history for context and analytics';
COMMENT ON COLUMN public.ai_chat_history.session_id IS 'Chat session identifier for grouping messages';
COMMENT ON COLUMN public.ai_chat_history.recommended_books IS 'Books recommended by AI in this message';

-- Indexes for chat history queries
CREATE INDEX IF NOT EXISTS idx_ai_chat_history_account_id ON public.ai_chat_history(account_id);
CREATE INDEX IF NOT EXISTS idx_ai_chat_history_session_id ON public.ai_chat_history(session_id);
CREATE INDEX IF NOT EXISTS idx_ai_chat_history_created_at ON public.ai_chat_history(created_at DESC);

-- Enable RLS
ALTER TABLE public.user_ai_credits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.book_embeddings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_chat_history ENABLE ROW LEVEL SECURITY;

-- RLS Policies for user_ai_credits
CREATE POLICY "Users can read their own credits"
ON public.user_ai_credits
FOR SELECT
TO authenticated
USING (account_id = auth.uid());

CREATE POLICY "System can insert credits"
ON public.user_ai_credits
FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "System can update credits"
ON public.user_ai_credits
FOR UPDATE
TO authenticated
WITH CHECK (true);

-- RLS Policies for book_embeddings
-- Everyone can read embeddings for search
CREATE POLICY "Authenticated users can read embeddings"
ON public.book_embeddings
FOR SELECT
TO authenticated
USING (true);

-- Only admins can insert/update embeddings
CREATE POLICY "Admins can insert embeddings"
ON public.book_embeddings
FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS(
    SELECT 1 FROM public.accounts
    WHERE id = auth.uid() AND is_admin = TRUE
  )
);

CREATE POLICY "Admins can update embeddings"
ON public.book_embeddings
FOR UPDATE
TO authenticated
USING (
  EXISTS(
    SELECT 1 FROM public.accounts
    WHERE id = auth.uid() AND is_admin = TRUE
  )
)
WITH CHECK (
  EXISTS(
    SELECT 1 FROM public.accounts
    WHERE id = auth.uid() AND is_admin = TRUE
  )
);

-- RLS Policies for ai_chat_history
CREATE POLICY "Users can read their own chat history"
ON public.ai_chat_history
FOR SELECT
TO authenticated
USING (account_id = auth.uid());

CREATE POLICY "Users can insert their own messages"
ON public.ai_chat_history
FOR INSERT
TO authenticated
WITH CHECK (account_id = auth.uid());

-- Helper function to get user credits with auto-reset
CREATE OR REPLACE FUNCTION public.get_user_ai_credits(p_account_id UUID)
RETURNS TABLE(credits_used INTEGER, credits_limit INTEGER, is_admin BOOLEAN) AS $$
DECLARE
  v_credits_used INTEGER;
  v_credits_limit INTEGER;
  v_is_admin BOOLEAN;
BEGIN
  -- Check if user is admin
  SELECT is_admin INTO v_is_admin
  FROM public.accounts
  WHERE id = p_account_id;

  -- Get or create credits record
  SELECT COALESCE(credits_used, 0), COALESCE(credits_limit, 0)
  INTO v_credits_used, v_credits_limit
  FROM public.user_ai_credits
  WHERE account_id = p_account_id;

  -- Return nulls if not found (will be initialized by trigger)
  RETURN QUERY SELECT v_credits_used, v_credits_limit, v_is_admin;
END;
$$ LANGUAGE plpgsql;

-- Helper function to use AI credits
CREATE OR REPLACE FUNCTION public.use_ai_credits(p_account_id UUID, p_amount INTEGER DEFAULT 1)
RETURNS BOOLEAN AS $$
DECLARE
  v_credits_limit INTEGER;
  v_is_admin BOOLEAN;
BEGIN
  -- Check if user is admin (always allowed)
  SELECT is_admin INTO v_is_admin
  FROM public.accounts
  WHERE id = p_account_id;

  IF v_is_admin THEN
    RETURN TRUE;
  END IF;

  -- Get credit limit
  SELECT credits_limit INTO v_credits_limit
  FROM public.user_ai_credits
  WHERE account_id = p_account_id;

  -- Check if unlimited or has enough credits
  IF v_credits_limit = 0 THEN
    UPDATE public.user_ai_credits
    SET credits_used = credits_used + p_amount
    WHERE account_id = p_account_id;
    RETURN TRUE;
  END IF;

  IF (SELECT credits_used FROM public.user_ai_credits WHERE account_id = p_account_id) + p_amount <= v_credits_limit THEN
    UPDATE public.user_ai_credits
    SET credits_used = credits_used + p_amount
    WHERE account_id = p_account_id;
    RETURN TRUE;
  END IF;

  RETURN FALSE;
END;
$$ LANGUAGE plpgsql;
