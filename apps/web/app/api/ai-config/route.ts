import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServerClient } from '@kit/supabase/server-client';

type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

type AIConfigUpdate = {
  deployment_type?: 'cloud' | 'local';
  cloud_provider?: 'deepseek' | 'openai' | 'zai' | null;
  local_provider?: 'ollama' | null;
  ollama_url?: string | null;
  ollama_model?: string | null;
  api_key?: string | null;
  model?: string | null;
  config?: Json;
};

type AIConfigRow = {
  id: string;
  deployment_type: string;
  cloud_provider: string | null;
  local_provider: string | null;
  ollama_url: string | null;
  ollama_model: string | null;
  api_key: string | null;
  model: string | null;
  config: Json;
  created_at: string;
  updated_at: string;
  updated_by: string | null;
};

// GET /api/ai-config - Fetch AI configuration
export async function GET() {
  try {
    const supabase = getSupabaseServerClient();

    const { data, error } = await (supabase
      .from('ai_config')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle());

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    // If no config exists, return default
    if (!data) {
      return NextResponse.json({
        data: {
          deployment_type: 'cloud',
          cloud_provider: 'openai',
          local_provider: null,
          ollama_url: null,
          ollama_model: null,
          model: 'gpt-4o-mini',
          config: {
            temperature: 0.7,
            maxTokens: 1000,
            enabled: true,
          } as Json,
        },
      });
    }

    // Don't expose the API key in the response
    const { api_key: _apiKey, ...safeData } = data as AIConfigRow;

    return NextResponse.json({ data: safeData });
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST /api/ai-config - Update AI configuration
export async function POST(request: NextRequest) {
  try {
    const supabase = getSupabaseServerClient();
    const body = await request.json();

    const {
      deployment_type,
      cloud_provider,
      local_provider,
      ollama_url,
      ollama_model,
      api_key,
      model,
      config,
    } = body as AIConfigUpdate;

    // Validate deployment_type
    if (deployment_type && !['cloud', 'local'].includes(deployment_type)) {
      return NextResponse.json(
        { error: 'Invalid deployment_type. Must be "cloud" or "local".' },
        { status: 400 }
      );
    }

    // Validate cloud_provider
    if (cloud_provider && !['deepseek', 'openai', 'zai'].includes(cloud_provider)) {
      return NextResponse.json(
        { error: 'Invalid cloud_provider. Must be "deepseek", "openai", or "zai".' },
        { status: 400 }
      );
    }

    // Validate local_provider
    if (local_provider && local_provider !== 'ollama') {
      return NextResponse.json(
        { error: 'Invalid local_provider. Must be "ollama".' },
        { status: 400 }
      );
    }

    // Build update data
    const updateData: {
      deployment_type?: string;
      cloud_provider?: string | null;
      local_provider?: string | null;
      ollama_url?: string | null;
      ollama_model?: string | null;
      api_key?: string | null;
      model?: string | null;
      config?: Json;
      updated_at?: string;
    } = {};

    if (deployment_type !== undefined) updateData.deployment_type = deployment_type;
    if (cloud_provider !== undefined) updateData.cloud_provider = cloud_provider;
    if (local_provider !== undefined) updateData.local_provider = local_provider;
    if (ollama_url !== undefined) updateData.ollama_url = ollama_url;
    if (ollama_model !== undefined) updateData.ollama_model = ollama_model;
    if (api_key !== undefined) updateData.api_key = api_key;
    if (model !== undefined) updateData.model = model;
    if (config !== undefined) updateData.config = config;
    updateData.updated_at = new Date().toISOString();

    // Check if config exists
    const { data: existing } = await supabase
      .from('ai_config')
      .select('id')
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    let result: AIConfigRow | null = null;

    if (existing) {
      // Update existing
      const existingId = (existing as { id: string }).id;
      const { data, error } = await supabase
        .from('ai_config')
        .update(updateData)
        .eq('id', existingId)
        .select()
        .single();

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 400 });
      }

      result = data as AIConfigRow;
    } else {
      // Insert new
      const { data, error } = await supabase
        .from('ai_config')
        .insert({
          ...updateData,
          deployment_type: updateData.deployment_type || 'cloud',
        })
        .select()
        .single();

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 400 });
      }

      result = data as AIConfigRow;
    }

    // Don't expose the API key in the response
    if (result) {
      const { api_key: _apiKey, ...safeData } = result;
      return NextResponse.json({ data: safeData });
    }

    return NextResponse.json({ error: 'Failed to save configuration' }, { status: 500 });
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
