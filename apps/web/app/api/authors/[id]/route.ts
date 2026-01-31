import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServerClient } from '@kit/supabase/server-client';

// PATCH /api/authors/[id] - Update an author
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = getSupabaseServerClient();
    const { id } = await params;
    const body = await request.json();

    const { data, error } = await supabase
      .from('authors')
      .update({
        name: body.name,
        bio: body.bio !== undefined ? body.bio || null : undefined,
        avatar_url: body.avatar_url !== undefined ? body.avatar_url || null : undefined,
        birth_date: body.birth_date !== undefined ? body.birth_date || null : undefined,
        nationality: body.nationality !== undefined ? body.nationality || null : undefined,
        website_url: body.website_url !== undefined ? body.website_url || null : undefined,
        is_featured: body.is_featured,
      })
      .eq('id', id)
      .select(`
        id,
        name,
        bio,
        avatar_url,
        birth_date,
        nationality,
        website_url,
        is_featured,
        created_at,
        updated_at
      `)
      .single();

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

// DELETE /api/authors/[id] - Delete an author
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = getSupabaseServerClient();
    const { id } = await params;

    const { error } = await supabase
      .from('authors')
      .delete()
      .eq('id', id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
