import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ArrowRight, BookOpen } from 'lucide-react';
import { getSupabaseServerClient } from '@kit/supabase/server-client';
import { Button } from '@kit/ui/button';
import { BookCard } from '~/(marketing)/_components/bookstore/book-card';
import type { Book } from '~/types/bookstore';

interface Category {
  id: string;
  name: string;
  slug: string;
  icon: string | null;
  description: string | null;
  book_count: number | null;
}

interface BookWithDetails {
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
  book_categories?: Array<{
    categories: {
      id: string;
      name: string;
      slug: string;
    };
  }>;
}

interface CategoryWithBooks extends Category {
  books: BookWithDetails[];
}

async function getCategoriesWithBooks(): Promise<CategoryWithBooks[]> {
  const supabase = getSupabaseServerClient();

  const { data: categories, error: categoriesError } = await supabase
    .from('categories')
    .select('*')
    .order('name', { ascending: true });

  if (categoriesError || !categories) {
    return [];
  }

  // Fetch 3 books for each category
  const categoriesWithBooks = await Promise.all(
    categories.map(async (category) => {
      const { data: books } = await supabase
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
        .filter('book_categories', 'in', `(${category.id})`)
        .eq('status', 'active')
        .limit(3);

      return {
        ...category,
        books: books || [],
      };
    })
  );

  return categoriesWithBooks;
}

function transformBook(book: BookWithDetails): Book {
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

export default async function CategoryPage() {
  const categories = await getCategoriesWithBooks();

  if (categories.length === 0) {
    notFound();
  }

  return (
    <>
      {/* Header */}
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-3xl">
          <h1 className="text-5xl font-bold text-black dark:text-beige mb-4">
            Browse Categories
          </h1>
          <p className="text-xl text-muted-foreground">
            Explore our curated collection of book categories. From fiction to non-fiction,
            find your next great read.
          </p>
        </div>
      </div>

      {/* Categories Grid */}
      <div className="container mx-auto px-4 pb-16">
        <div className="space-y-16">
          {categories.map((category) => (
            <div key={category.id} className="group">
              {/* Category Header */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-4">
                  <div className="text-5xl">{category.icon || '📚'}</div>
                  <div>
                    <h2 className="text-3xl font-bold text-black dark:text-beige">
                      {category.name}
                    </h2>
                    <div className="flex items-center gap-3 mt-1">
                      {category.description && (
                        <p className="text-muted-foreground">{category.description}</p>
                      )}
                    </div>
                  </div>
                </div>
                <Link href={`/category/${category.slug}`}>
                  <Button variant="ghost" className="gap-2 group-hover:bg-orange/10 group-hover:text-orange">
                    View All
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
              </div>

              {/* Books Preview */}
              {category.books.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                  {category.books.map((book) => (
                    <BookCard
                      key={book.id}
                      book={transformBook(book)}
                      variant="mercury"
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 bg-muted/30 rounded-lg">
                  <BookOpen className="h-12 w-12 mx-auto mb-3 text-muted-foreground/50" />
                  <p className="text-muted-foreground">No books available in this category yet.</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </>
  );
}

export async function generateMetadata() {
  return {
    title: 'Browse Categories | Al-Ghazel Bookstore',
    description: 'Explore our curated collection of book categories. From fiction to non-fiction, find your next great read.',
  };
}
