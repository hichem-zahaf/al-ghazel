import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServerClient } from '@kit/supabase/server-client';

type HomepageConfigRow = {
  id: string;
  section_id: string;
  section_title: string;
  section_description: string | null;
  enabled: boolean;
  display_order: number;
  config: Record<string, unknown>;
  created_at: string | null;
  updated_at: string | null;
  updated_by: string | null;
};

type HomepageConfigUpdate = {
  section_id: string;
  enabled?: boolean;
  display_order?: number;
  config?: Record<string, unknown>;
};

// GET /api/homepage-config - Fetch all homepage sections configuration
export async function GET() {
  try {
    const supabase = getSupabaseServerClient();

    const { data, error } = await (supabase
      .from('homepage_config' as any)
      .select('*')
      .order('display_order', { ascending: true }));

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ data });
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST /api/homepage-config - Update multiple sections at once
export async function POST(request: NextRequest) {
  try {
    const supabase = getSupabaseServerClient();
    const body = await request.json();

    const { sections } = body as { sections: HomepageConfigUpdate[] };

    if (!Array.isArray(sections)) {
      return NextResponse.json(
        { error: 'Invalid request body. Expected sections array.' },
        { status: 400 }
      );
    }

    // Update each section
    const updates = sections.map((section) => {
      const updateData: {
        enabled?: boolean;
        display_order?: number;
        config?: Record<string, unknown>;
        updated_at?: string;
      } = {};

      if (section.enabled !== undefined) {
        updateData.enabled = section.enabled;
      }
      if (section.display_order !== undefined) {
        updateData.display_order = section.display_order;
      }
      if (section.config !== undefined) {
        updateData.config = section.config;
      }
      updateData.updated_at = new Date().toISOString();

      return (supabase
        .from('homepage_config' as any)
        .update(updateData)
        .eq('section_id', section.section_id));
    });

    // Execute all updates
    const results = await Promise.all(updates);

    // Check for errors
    const errors = results.filter((result) => result.error !== null);
    if (errors.length > 0) {
      return NextResponse.json(
        { error: 'Some sections failed to update', details: errors.map((e) => e.error) },
        { status: 400 }
      );
    }

    // Fetch updated data
    const { data: updatedData, error: fetchError } = await (supabase
      .from('homepage_config' as any)
      .select('*')
      .order('display_order', { ascending: true }));

    if (fetchError) {
      return NextResponse.json({ error: fetchError.message }, { status: 400 });
    }

    return NextResponse.json({ data: updatedData });
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PUT /api/homepage-config - Update a single section
export async function PUT(request: NextRequest) {
  try {
    const supabase = getSupabaseServerClient();
    const body = await request.json();

    const { section_id, enabled, display_order, config } = body as HomepageConfigUpdate;

    if (!section_id) {
      return NextResponse.json(
        { error: 'section_id is required' },
        { status: 400 }
      );
    }

    const updateData: {
      enabled?: boolean;
      display_order?: number;
      config?: Record<string, unknown>;
      updated_at?: string;
    } = {};

    if (enabled !== undefined) {
      updateData.enabled = enabled;
    }
    if (display_order !== undefined) {
      updateData.display_order = display_order;
    }
    if (config !== undefined) {
      updateData.config = config;
    }
    updateData.updated_at = new Date().toISOString();

    const { data, error } = await (supabase
      .from('homepage_config' as any)
      .update(updateData)
      .eq('section_id', section_id)
      .select()
      .single());

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ data });
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
