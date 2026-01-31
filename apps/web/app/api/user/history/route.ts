import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServerClient } from '@kit/supabase/server-client';

// Valid action types for tracking
type ActionType = 'viewed' | 'searched' | 'added_to_cart' | 'purchased';

interface HistoryRequest {
  bookId: string;
  actionType?: ActionType;
  metadata?: Record<string, unknown>;
}

interface HistoryResponse {
  success: boolean;
  tracked?: boolean;
  message?: string;
}

/**
 * POST /api/user/history
 * Track user interactions with books for personalization
 *
 * Body:
 * - bookId: string (required) - The ID of the book
 * - actionType: 'viewed' | 'searched' | 'added_to_cart' | 'purchased' (default: 'viewed')
 * - metadata: Record<string, unknown> (optional) - Additional metadata
 *
 * Notes:
 * - Anonymous users: Returns success but doesn't track
 * - Authenticated users: Records to user_reading_history table
 * - Triggers automatic author interest level updates
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = getSupabaseServerClient();

    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    // For anonymous users, return success without tracking
    if (authError || !user) {
      return NextResponse.json<HistoryResponse>({
        success: true,
        tracked: false,
        message: 'Anonymous user - not tracked'
      });
    }

    // Parse request body
    const body: HistoryRequest = await request.json();
    const { bookId, actionType = 'viewed', metadata = {} } = body;

    // Validate bookId
    if (!bookId || typeof bookId !== 'string') {
      return NextResponse.json<HistoryResponse>(
        { success: false, message: 'Invalid bookId' },
        { status: 400 }
      );
    }

    // Validate actionType
    const validActionTypes: ActionType[] = ['viewed', 'searched', 'added_to_cart', 'purchased'];
    if (!validActionTypes.includes(actionType)) {
      return NextResponse.json<HistoryResponse>(
        { success: false, message: 'Invalid actionType' },
        { status: 400 }
      );
    }

    // Verify the book exists
    const { data: book, error: bookError } = await supabase
      .from('books')
      .select('id, author_id, title')
      .eq('id', bookId)
      .single();

    if (bookError || !book) {
      return NextResponse.json<HistoryResponse>(
        { success: false, message: 'Book not found' },
        { status: 404 }
      );
    }

    // Record the reading history
    const { error: insertError } = await supabase
      .from('user_reading_history')
      .insert({
        account_id: user.id,
        book_id: bookId,
        action_type: actionType,
        metadata: {
          ...metadata,
          book_title: book.title,
          timestamp: new Date().toISOString()
        }
      });

    if (insertError) {
      console.error('Error inserting reading history:', insertError);
      // Don't fail the request if tracking fails
      return NextResponse.json<HistoryResponse>({
        success: true,
        tracked: false,
        message: 'Failed to track interaction'
      });
    }

    // The trigger will automatically update author interest level:
    // - +5 for 'viewed' actions
    // - +20 for 'purchased' actions
    // See migration file for trigger definitions

    return NextResponse.json<HistoryResponse>({
      success: true,
      tracked: true,
      message: 'Interaction tracked successfully'
    });

  } catch (error) {
    console.error('History tracking error:', error);
    return NextResponse.json<HistoryResponse>(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/user/history
 * Get user's reading history (for authenticated users only)
 *
 * Query params:
 * - limit: number (default: 50)
 * - actionType: 'viewed' | 'searched' | 'added_to_cart' | 'purchased'
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = getSupabaseServerClient();

    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const limit = Math.min(parseInt(searchParams.get('limit') || '50'), 100);
    const actionType = searchParams.get('actionType');

    let query = supabase
      .from('user_reading_history')
      .select(`
        *,
        books(id, title, cover_image_url, author_id)
      `)
      .eq('account_id', user.id)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (actionType) {
      query = query.eq('action_type', actionType);
    }

    const { data, error } = await query;

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      );
    }

    return NextResponse.json({
      data,
      count: data?.length || 0
    });

  } catch (error) {
    console.error('History fetch error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/user/history
 * Clear user's reading history (for authenticated users only)
 *
 * Body:
 * - bookId?: string - If provided, only delete history for this book
 * - actionType?: string - If provided, only delete history of this type
 */
export async function DELETE(request: NextRequest) {
  try {
    const supabase = getSupabaseServerClient();

    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const body = await request.json().catch(() => ({}));
    const { bookId, actionType } = body;

    let query = supabase
      .from('user_reading_history')
      .delete()
      .eq('account_id', user.id);

    if (bookId) {
      query = query.eq('book_id', bookId);
    }

    if (actionType) {
      query = query.eq('action_type', actionType);
    }

    const { error } = await query;

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'History cleared successfully'
    });

  } catch (error) {
    console.error('History delete error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
