/*
 * -------------------------------------------------------
 * Add Vector Similarity Search Function for RAG
 * This function matches books based on embedding similarity
 * -------------------------------------------------------
 */

-- Function to match books by embedding similarity
CREATE OR REPLACE FUNCTION public.match_books(
  query_embedding VECTOR(1536),
  match_threshold FLOAT DEFAULT 0.75,
  match_count INT DEFAULT 10
)
RETURNS TABLE(
  id UUID,
  title VARCHAR(255),
  subtitle TEXT,
  description TEXT,
  price DECIMAL(10,2),
  cover_image_url TEXT,
  similarity FLOAT
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    b.id,
    b.title,
    b.subtitle,
    b.description,
    b.price,
    b.cover_image_url,
    1 - (be.embedding <=> query_embedding) AS similarity
  FROM public.book_embeddings be
  JOIN public.books b ON b.id = be.book_id
  WHERE 1 - (be.embedding <=> query_embedding) > match_threshold
  ORDER BY be.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;

-- Add comment
COMMENT ON FUNCTION public.match_books IS 'Search for books similar to the given embedding using cosine similarity';
