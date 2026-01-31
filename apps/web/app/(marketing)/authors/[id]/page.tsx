import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, BookOpen, Calendar, MapPin, Link as LinkIcon } from 'lucide-react';
import Image from 'next/image';
import { getSupabaseServerClient } from '@kit/supabase/server-client';
import { Button } from '@kit/ui/button';
import { Badge } from '@kit/ui/badge';
import { Separator } from '@kit/ui/separator';
import { BookCard } from '~/(marketing)/_components/bookstore/book-card';

interface AuthorPageProps {
  params: Promise<{ id: string }>;
}

interface Author {
  id: string;
  name: string;
  bio: string | null;
  avatar_url: string | null;
  birth_date: string | null;
  nationality: string | null;
  website_url: string | null;
  is_featured: boolean | null;
}

interface Book {
  id: string;
  title: string;
  subtitle: string | null;
  description: string | null;
  cover_image_url: string | null;
  price: number;
  original_price: number | null;
  discount_percentage: number | null;
  rating: number | null;
  authors: {
    id: string;
    name: string;
  };
  book_categories: Array<{
    categories: {
      id: string;
      name: string;
      slug: string;
    };
  }>;
}

async function getAuthor(id: string): Promise<Author | null> {
  const supabase = getSupabaseServerClient();

  const { data, error } = await supabase
    .from('authors')
    .select('*')
    .eq('id', id)
    .single();

  if (error || !data) {
    return null;
  }

  return data;
}

async function getAuthorBooks(authorId: string): Promise<Book[]> {
  const supabase = getSupabaseServerClient();

  const { data, error } = await supabase
    .from('books')
    .select(`
      id,
      title,
      subtitle,
      description,
      cover_image_url,
      price,
      original_price,
      discount_percentage,
      rating,
      authors (
        id,
        name
      ),
      book_categories (
        categories (
          id,
          name,
          slug
        )
      )
    `)
    .eq('author_id', authorId)
    .order('created_at', { ascending: false });

  if (error || !data) {
    return [];
  }

  return data;
}

function transformBook(book: Book) {
  return {
    id: book.id,
    title: book.title,
    author: {
      id: book.authors?.id || '',
      name: book.authors?.name || 'Unknown Author',
      avatar: '/images/author-placeholder.jpg',
      bio: '',
    },
    coverImage: book.cover_image_url || '/images/book-placeholder.jpg',
    price: book.price,
    originalPrice: book.original_price ?? undefined,
    discountPercentage: book.discount_percentage ?? undefined,
    description: book.description || '',
    categories:
      book.book_categories?.map((bc) => ({
        id: bc.categories.id,
        name: bc.categories.name,
        slug: bc.categories.slug,
        icon: '📚',
        bookCount: 0,
      })) ?? [],
    rating: book.rating || 0,
    publishedDate: new Date(),
    isbn: '',
    pages: 0,
  };
}

export default async function AuthorPage({ params }: AuthorPageProps) {
  const { id } = await params;
  const author = await getAuthor(id);

  if (!author) {
    notFound();
  }

  const books = await getAuthorBooks(id);

  return (
    <>
      {/* Back Button */}
      <div className="container mx-auto px-4 py-6">
        <Link href="/">
          <Button variant="ghost" size="sm" className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back to Home
          </Button>
        </Link>
      </div>

      {/* Author Header */}
      <div className="container mx-auto px-4 pb-12">
        <div className="mb-12">
          <div className="flex flex-col md:flex-row gap-8 items-start">
            {/* Author Avatar */}
            <div className="relative w-48 h-48 md:w-64 md:h-64 rounded-2xl overflow-hidden bg-beige dark:bg-neutral-800 flex-shrink-0 shadow-xl">
              <Image
                src={author.avatar_url || '/images/author-placeholder.jpg'}
                alt={author.name}
                fill
                sizes="(max-width: 768px) 192px, 256px"
                className="object-cover"
                priority
              />
            </div>

            {/* Author Info */}
            <div className="flex-1 space-y-6">
              <div>
                <div className="flex items-center gap-3 mb-3">
                  <h1 className="text-4xl lg:text-5xl font-bold text-black dark:text-beige">
                    {author.name}
                  </h1>
                  {author.is_featured === true && (
                    <Badge className="bg-orange text-white">Featured Author</Badge>
                  )}
                </div>

                {/* Author Details */}
                <div className="flex flex-wrap gap-4 text-muted-foreground">
                  {author.nationality && (
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-orange" />
                      <span>{author.nationality}</span>
                    </div>
                  )}
                  {author.birth_date && (
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-orange" />
                      <span>
                        Born {new Date(author.birth_date).toLocaleDateString('en-US', { year: 'numeric' })}
                      </span>
                    </div>
                  )}
                  {author.website_url && (
                    <a
                      href={author.website_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 hover:text-orange transition-colors"
                    >
                      <LinkIcon className="h-4 w-4" />
                      <span>Website</span>
                    </a>
                  )}
                </div>
              </div>

              {author.bio && (
                <>
                  <Separator />
                  <div>
                    <h2 className="text-xl font-semibold text-black dark:text-beige mb-3">About</h2>
                    <p className="text-lg text-muted-foreground leading-relaxed">{author.bio}</p>
                  </div>
                </>
              )}

              {/* Stats */}
              <div className="flex items-center gap-6">
                <div className="flex items-center gap-2">
                  <BookOpen className="h-5 w-5 text-orange" />
                  <span className="text-2xl font-bold text-black dark:text-beige">{books.length}</span>
                  <span className="text-muted-foreground">
                    {books.length === 1 ? 'Book' : 'Books'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <Separator className="mb-8" />

        {/* Books Section */}
        <div>
          <h2 className="text-3xl font-bold text-black dark:text-beige mb-6">
            Books by {author.name}
          </h2>

          {books.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {books.map((book) => (
                <BookCard
                  key={book.id}
                  book={transformBook(book)}
                  variant="mercury"
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <BookOpen className="h-16 w-16 mx-auto mb-4 text-muted-foreground/50" />
              <h3 className="text-xl font-semibold text-black dark:text-beige mb-2">
                No books yet
              </h3>
              <p className="text-muted-foreground">
                This author hasn&apos;t published any books yet.
              </p>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

export async function generateMetadata({ params }: AuthorPageProps) {
  const { id } = await params;
  const author = await getAuthor(id);

  if (!author) {
    return {
      title: 'Author Not Found',
    };
  }

  return {
    title: `${author.name} - Author | Al-Ghazel Bookstore`,
    description: author.bio || `Discover books by ${author.name} at Al-Ghazel Bookstore`,
  };
}
