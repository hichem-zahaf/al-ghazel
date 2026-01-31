import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServerClient } from '@kit/supabase/server-client';
import { getSupabaseServerAdminClient } from '@kit/supabase/server-admin-client';
import type { Database } from '~/lib/database.types';

type BookUpdate = Database['public']['Tables']['books']['Update'];

// PATCH /api/books/[id] - Update a book
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = getSupabaseServerClient();
    const { id } = await params;
    const body: BookUpdate = await request.json();

    const { data, error } = await supabase
      .from('books')
      .update(body)
      .eq('id', id)
      .select(`
        *,
        authors (
          id,
          name
        )
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

// DELETE /api/books/[id] - Delete a book
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = getSupabaseServerAdminClient();
    const { id } = await params;

    const { error } = await supabase
      .from('books')
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
