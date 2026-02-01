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
INSERT INTO public.ai_config (deployment_type, cloud_provider, model, config) VALUES
  (
    'cloud',
    'openai',
    'gpt-4o-mini',
    '{
      "temperature": 0.7,
      "maxTokens": 1000,
      "enabled": true
    }'::JSONB
  )
ON CONFLICT DO NOTHING;

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
