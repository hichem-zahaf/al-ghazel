import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServerClient } from '@kit/supabase/server-client';
import { getSupabaseServerAdminClient } from '@kit/supabase/server-admin-client';

// Check if user is admin
async function isAdmin(supabase: any, userId: string): Promise<boolean> {
  const { data } = await supabase
    .from('accounts')
    .select('is_admin')
    .eq('id', userId)
    .single();

  return data?.is_admin || false;
}

// Generate embedding text for a book
function generateBookEmbeddingText(book: any): string {
  const parts: string[] = [];

  if (book.title) parts.push(`Title: ${book.title}`);
  if (book.subtitle) parts.push(`Subtitle: ${book.subtitle}`);
  if (book.description) parts.push(`Description: ${book.description}`);
  if (book.isbn) parts.push(`ISBN: ${book.isbn}`);

  // Add author (single author)
  if (book.author) {
    parts.push(`Author: ${book.author.name}`);
  }

  // Add categories
  if (book.categories && book.categories.length > 0) {
    const categoryNames = book.categories.map((c: any) => c.name).filter(Boolean).join(', ');
    if (categoryNames) parts.push(`Categories: ${categoryNames}`);
  }

  // Add format and language
  if (book.format) parts.push(`Format: ${book.format}`);
  if (book.language) parts.push(`Language: ${book.language}`);

  return parts.join('\n');
}

// Call OpenAI embedding API
async function generateEmbedding(text: string, apiKey: string): Promise<number[]> {
  const response = await fetch('https://api.openai.com/v1/embeddings', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: 'text-embedding-3-small',
      input: text,
      dimensions: 1536,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`OpenAI API error: ${error}`);
  }

  const data = await response.json();
  return data.data[0].embedding;
}

// GET /api/ai/books/embed - Get embedding status
export async function GET(request: NextRequest) {
  const supabase = getSupabaseServerClient();

  try {
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!await isAdmin(supabase, user.id)) {
      return NextResponse.json({ error: 'Forbidden. Admin only.' }, { status: 403 });
    }

    // Get embedding stats
    const [{ count: totalBooks }, { count: embeddedBooks }] = await Promise.all([
      supabase.from('books').select('id', { count: 'exact', head: true }),
      supabase.from('book_embeddings').select('id', { count: 'exact', head: true }),
    ]);

    return NextResponse.json({
      total_books: totalBooks || 0,
      embedded_books: embeddedBooks || 0,
      pending_books: (totalBooks || 0) - (embeddedBooks || 0),
    });

  } catch (error) {
    console.error('Embedding status error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST /api/ai/books/embed - Sync and embed books
export async function POST(request: NextRequest) {
  const supabase = getSupabaseServerClient();
  const adminSupabase = getSupabaseServerAdminClient();

  try {
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!await isAdmin(supabase, user.id)) {
      return NextResponse.json({ error: 'Forbidden. Admin only.' }, { status: 403 });
    }

    const body = await request.json();
    const { limit = 50, force = false } = body;

    // Get AI config for API key
    const { data: aiConfig } = await adminSupabase
      .from('ai_config')
      .select('api_key, enable_rag')
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (!aiConfig) {
      return NextResponse.json({ error: 'AI configuration not found' }, { status: 400 });
    }

    if (!aiConfig.enable_rag) {
      return NextResponse.json({ error: 'RAG is disabled in AI configuration' }, { status: 400 });
    }

    if (!aiConfig.api_key) {
      return NextResponse.json({ error: 'OpenAI API key not configured' }, { status: 400 });
    }

    // Get books that need embedding (with author relation)
    let booksQuery = adminSupabase
      .from('books')
      .select('id, title, subtitle, description, isbn, format, language, author:authors(id, name)')
      .limit(limit);

    // If not force, only get books without embeddings
    if (!force) {
      const { data: embeddedIds } = await adminSupabase
        .from('book_embeddings')
        .select('book_id');

      const embeddedIdSet = new Set(embeddedIds?.map((e: any) => e.book_id) || []);
      if (embeddedIdSet.size > 0) {
        booksQuery = booksQuery.not('id', 'in', `(${Array.from(embeddedIdSet).join(',')})`);
      }
    }

    const { data: books, error: booksError } = await booksQuery;

    if (booksError) {
      return NextResponse.json({ error: 'Failed to fetch books' }, { status: 500 });
    }

    if (!books || books.length === 0) {
      return NextResponse.json({
        message: 'No books to embed',
        embedded: 0,
        skipped: 0,
      });
    }

    // Fetch categories for each book
    const bookIds = books.map((b: any) => b.id);
    const { data: categoriesData } = await adminSupabase
      .from('book_categories')
      .select('book_id, categories(id, name)')
      .in('book_id', bookIds);

    // Map categories to books
    const categoriesMap = new Map<string, any[]>();

    categoriesData?.forEach((bc: any) => {
      if (!categoriesMap.has(bc.book_id)) categoriesMap.set(bc.book_id, []);
      categoriesMap.get(bc.book_id)?.push(bc.categories);
    });

    let embedded = 0;
    let skipped = 0;
    const errors: string[] = [];

    // Process each book
    for (const book of books as any[]) {
      try {
        const bookWithRelations = {
          ...book,
          categories: categoriesMap.get(book.id) || [],
        };

        // Generate embedding text
        const embeddingText = generateBookEmbeddingText(bookWithRelations);

        // Generate embedding
        const embedding = await generateEmbedding(embeddingText, aiConfig.api_key);

        // Upsert embedding
        const { error: upsertError } = await adminSupabase
          .from('book_embeddings')
          .upsert({
            book_id: book.id,
            embedding: `[${embedding.join(',')}]`,
            embedding_text: embeddingText,
            embedding_model: 'text-embedding-3-small',
            metadata: {
              title: book.title,
              author: book.author?.name,
              category_count: bookWithRelations.categories.length,
            },
          }, {
            onConflict: 'book_id',
          });

        if (upsertError) {
          errors.push(`Book "${book.title}": ${upsertError.message}`);
          skipped++;
        } else {
          embedded++;
        }

        // Small delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 100));

      } catch (error) {
        console.error(`Error embedding book ${(book as any).id}:`, error);
        errors.push(`Book "${(book as any).title}": ${(error as Error).message}`);
        skipped++;
      }
    }

    return NextResponse.json({
      message: `Embedded ${embedded} book${embedded !== 1 ? 's' : ''}`,
      embedded,
      skipped,
      errors: errors.length > 0 ? errors : undefined,
    });

  } catch (error) {
    console.error('Embed sync error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
