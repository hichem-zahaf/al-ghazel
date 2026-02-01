/*
 * -------------------------------------------------------
 * AI Configuration Table
 * This migration creates the ai_config table to store
 * AI provider settings, model configuration, and deployment options
 * -------------------------------------------------------
 */

-- Create ai_config table
CREATE TABLE IF NOT EXISTS public.ai_config (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  deployment_type VARCHAR(20) NOT NULL DEFAULT 'cloud' CHECK (deployment_type IN ('cloud', 'local')),
  cloud_provider VARCHAR(50) CHECK (cloud_provider IN ('deepseek', 'openai', 'zai')),
  local_provider VARCHAR(50) CHECK (local_provider IN ('ollama')),
  ollama_url TEXT,
  ollama_model VARCHAR(255),
  api_key TEXT,
  model VARCHAR(255),

  -- Model parameters for cloud providers
  temperature DECIMAL(3,2) DEFAULT 0.7 CHECK (temperature >= 0 AND temperature <= 1),
  top_p DECIMAL(3,2) DEFAULT 0.9 CHECK (top_p >= 0 AND top_p <= 1),

  -- Feature toggles
  enable_rag BOOLEAN DEFAULT true,
  enable_book_recommend BOOLEAN DEFAULT true,
  enable_book_search BOOLEAN DEFAULT true,
  enable_user_access BOOLEAN DEFAULT true,

  -- User credits (0 means unlimited)
  user_credits_limit INTEGER DEFAULT 0 CHECK (user_credits_limit >= 0),

  -- System prompt
  system_prompt TEXT DEFAULT 'You are a helpful AI assistant for a bookstore. Provide personalized book recommendations and help users discover their next great read.',

  config JSONB DEFAULT '{}'::JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_by UUID REFERENCES public.accounts(id) ON DELETE SET NULL
);

-- Add comments
COMMENT ON TABLE public.ai_config IS 'AI provider configuration for recommendations and features';
COMMENT ON COLUMN public.ai_config.deployment_type IS 'Type of deployment: cloud (external API) or local (self-hosted)';
COMMENT ON COLUMN public.ai_config.cloud_provider IS 'Cloud AI provider: deepseek, openai, or zai';
COMMENT ON COLUMN public.ai_config.local_provider IS 'Local AI provider: ollama';
COMMENT ON COLUMN public.ai_config.ollama_url IS 'Ollama instance URL for local deployment';
COMMENT ON COLUMN public.ai_config.ollama_model IS 'Selected Ollama model name';
COMMENT ON COLUMN public.ai_config.api_key IS 'API key for cloud provider (encrypted)';
COMMENT ON COLUMN public.ai_config.model IS 'Model name/identifier';
COMMENT ON COLUMN public.ai_config.temperature IS 'Temperature for model output (0.0 - 1.0, higher = more creative)';
COMMENT ON COLUMN public.ai_config.top_p IS 'Top-p sampling for model output (0.0 - 1.0, lower = more focused)';
COMMENT ON COLUMN public.ai_config.enable_rag IS 'Enable Retrieval-Augmented Generation for better context';
COMMENT ON COLUMN public.ai_config.enable_book_recommend IS 'Enable AI-powered book recommendations';
COMMENT ON COLUMN public.ai_config.enable_book_search IS 'Enable AI-powered book search';
COMMENT ON COLUMN public.ai_config.enable_user_access IS 'Allow users to access AI features';
COMMENT ON COLUMN public.ai_config.user_credits_limit IS 'Daily credit limit per user (0 = unlimited)';
COMMENT ON COLUMN public.ai_config.system_prompt IS 'Custom system prompt for the AI model';
COMMENT ON COLUMN public.ai_config.config IS 'Additional configuration settings stored as JSON';

-- Create index for deployment type
CREATE INDEX IF NOT EXISTS idx_ai_config_deployment_type ON public.ai_config(deployment_type);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_ai_config_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for updated_at
DROP TRIGGER IF EXISTS ai_config_updated_at_trigger ON public.ai_config;

CREATE TRIGGER ai_config_updated_at_trigger
BEFORE UPDATE ON public.ai_config
FOR EACH ROW
EXECUTE FUNCTION public.update_ai_config_updated_at();

-- Insert default AI configuration
INSERT INTO public.ai_config (
  deployment_type,
  cloud_provider,
  model,
  temperature,
  top_p,
  enable_rag,
  enable_book_recommend,
  enable_book_search,
  enable_user_access,
  user_credits_limit,
  system_prompt,
  config
) VALUES (
  'cloud',
  'openai',
  'gpt-4o-mini',
  0.7,
  0.9,
  true,
  true,
  true,
  true,
  0,
  'You are a helpful AI assistant for a bookstore. Provide personalized book recommendations and help users discover their next great read.',
  '{"maxTokens": 1000}'::JSONB
) ON CONFLICT DO NOTHING;

-- Enable RLS
ALTER TABLE public.ai_config ENABLE ROW LEVEL SECURITY;

-- Create RLS policies - only authenticated users can read/write
CREATE POLICY "Allow authenticated users to read ai config"
ON public.ai_config
FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Allow authenticated users to insert ai config"
ON public.ai_config
FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "Allow authenticated users to update ai config"
ON public.ai_config
FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);

CREATE POLICY "Allow authenticated users to delete ai config"
ON public.ai_config
FOR DELETE
TO authenticated
USING (true);
