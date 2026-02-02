/*
 * -------------------------------------------------------
 * Add OpenRouter Provider and Per-Provider Model Selection
 * This migration adds:
 * - OpenRouter as a cloud provider option
 * - Support for per-provider completion and embedding model selection
 * - Store model selections in the existing config JSONB column
 * -------------------------------------------------------
 */

-- Drop existing check constraint and recreate with openrouter
ALTER TABLE public.ai_config
DROP CONSTRAINT IF EXISTS ai_config_cloud_provider_check;

ALTER TABLE public.ai_config
ADD CONSTRAINT ai_config_cloud_provider_check
CHECK (cloud_provider IN ('deepseek', 'openai', 'zai', 'openrouter'));

-- Update comment
COMMENT ON COLUMN public.ai_config.cloud_provider IS 'Cloud AI provider: deepseek, openai, zai, or openrouter';

-- Update the default config to include provider model selections
UPDATE public.ai_config
SET config = jsonb_set(
  config,
  '{providers}',
  jsonb_build_object(
    'openai', jsonb_build_object(
      'completion_model', 'gpt-4o-mini',
      'embedding_model', 'text-embedding-3-small'
    ),
    'openrouter', jsonb_build_object(
      'completion_model', 'anthropic/claude-3-haiku',
      'embedding_model', 'openai/text-embedding-3-small'
    ),
    'deepseek', jsonb_build_object(
      'completion_model', 'deepseek-chat',
      'embedding_model', null
    ),
    'zai', jsonb_build_object(
      'completion_model', 'zai-model',
      'embedding_model', null
    ),
    'ollama', jsonb_build_object(
      'completion_model', 'llama3.2',
      'embedding_model', 'llama3.2'
    )
  )
)
WHERE config = '{}'::jsonb OR config->'providers' IS NULL;
