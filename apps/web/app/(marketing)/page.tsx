/**
 * Bookstore Marketing Page
 * Immersive bookstore website with horizontal scrolling sections
 */

import { HeroSection } from './_components/bookstore/hero-section';
import { CategoryCarousel } from './_components/bookstore/category-carousel';
import { BookOfTheDay } from './_components/bookstore/book-of-day';
import { AuthorOfTheDay } from './_components/bookstore/author-of-day';
import { RecommendedBooks } from './_components/bookstore/recommended-books';
import { ForYouSection } from './_components/bookstore/for-you-section';
import { SearchSection } from './_components/bookstore/search-section';
import { BookRoulette } from './_components/bookstore/book-roulette';
import { getSupabaseServerClient } from '@kit/supabase/server-client';
import type { Book, Author, Category, BookOfTheDay as BookOfTheDayType, AuthorOfTheDay as AuthorOfTheDayType } from '~/lib/../types/bookstore';

// Homepage config types
type HomepageConfig = {
  section_id: string;
  enabled: boolean;
  display_order: number;
  config: Record<string, unknown>;
}[];

// Default config values (fallback)
const defaultConfig: Record<string, Record<string, unknown>> = {
  hero: {
    title: 'Welcome to Al-Ghazel Bookstore',
    subtitle: 'Discover your next favorite book from our curated collection',
    ctaText: 'Browse Collection',
    ctaLink: '/books',
    backgroundImage: '/images/hero-bg.jpg',
    showOverlay: true,
    featuredAuthorId: null as string | null,
    autoRotateAuthor: true,
  },
  categories: {
    title: 'Browse by Category',
    showIcon: true,
    showBookCount: true,
    autoScroll: false,
    scrollSpeed: 3000,
    selectedCategoryIds: [] as string[],
  },
  'book-of-the-day': {
    title: 'Book of the Day',
    bookId: null as string | null,
    featuredDate: null as string | null,
    reason: '',
    showRating: true,
    showPrice: true,
    showAddToCart: true,
    layout: 'mercury',
  },
  'author-of-the-day': {
    title: 'Author Spotlight',
    authorId: null as string | null,
    featuredDate: null as string | null,
    reason: '',
    showBio: true,
    showBookCount: true,
    showSocialLinks: true,
    maxBooks: 3,
    selectedBookIds: [] as string[],
    layout: 'mercury',
  },
  'recommended-books': {
    title: 'Recommended for You',
    subtitle: 'Handpicked selections based on popularity',
    selectedBookIds: [] as string[],
  },
  'for-you': {
    title: 'New Releases Just for You',
    subtitle: 'Fresh arrivals tailored to your taste',
    source: 'new-releases',
    categoryId: null as string | null,
    bookCount: 12,
    selectedBookIds: [] as string[],
    showNewBadge: true,
    showDiscount: true,
    layout: 'horizontal-scroll',
  },
  'book-roulette': {
    title: 'Feeling Lucky?',
    subtitle: 'Spin to discover a random book from our collection',
    categoryId: null as string | null,
  },
  search: {
    title: 'Explore All Books',
    placeholder: 'Search by title, author, ISBN...',
    layout: 'mercury',
    pageSize: 12,
    showFilters: true,
    showSuggestions: true,
    filterCategories: true,
    filterAuthors: true,
    filterPrice: true,
    filterRating: true,
    filterFormat: true,
    filterLanguage: true,
  },
};

// Database types
type DbBook = {
  id: string;
  title: string;
  subtitle: string | null;
  description: string | null;
  author_id: string;
  cover_image_url: string | null;
  publisher: string | null;
  published_date: string | null;
  pages: number | null;
  language: string | null;
  format: string | null;
  price: number;
  original_price: number | null;
  discount_percentage: number | null;
  stock_quantity: number | null;
  rating: number | null;
  rating_count: number | null;
  is_featured: boolean | null;
  is_bestseller: boolean | null;
  is_new_release: boolean | null;
  created_at: string | null;
  // Nested relations
  authors: {
    id: string;
    name: string;
    bio: string | null;
    avatar_url: string | null;
    nationality: string | null;
    website_url: string | null;
    social_links: Record<string, unknown> | null;
    book_count?: number | null;
  };
  book_categories?: Array<{
    categories: {
      id: string;
      name: string;
      slug: string;
      icon: string | null;
      book_count: number | null;
    };
  }>;
};

type DbAuthor = {
  id: string;
  name: string;
  bio: string | null;
  avatar_url: string | null;
  nationality: string | null;
  website_url: string | null;
  social_links: Record<string, unknown> | null;
  book_count: number | null;
};

type DbCategory = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  icon: string | null;
  book_count: number | null;
  display_order: number | null;
};

type DbBookOfTheDay = {
  id: string;
  book_id: string;
  featured_date: string;
  description: string | null;
  books: DbBook;
};

type DbAuthorOfTheDay = {
  id: string;
  author_id: string;
  featured_date: string;
  description: string | null;
  authors: DbAuthor;
};

// Transform functions to convert database types to component types
function transformAuthor(dbAuthor: DbAuthor | { id: string; name: string; bio: string | null; avatar_url: string | null; nationality: string | null; website_url: string | null; social_links: Record<string, unknown> | null; book_count?: number | null }): Author {
  const socialLinks = dbAuthor.social_links as Record<string, string> | null;
  return {
    id: dbAuthor.id,
    name: dbAuthor.name,
    avatar: dbAuthor.avatar_url ?? '/images/author-placeholder.jpg',
    bio: dbAuthor.bio ?? '',
    socialLinks: {
      website: dbAuthor.website_url ?? socialLinks?.website,
      twitter: socialLinks?.twitter,
      instagram: socialLinks?.instagram,
    },
  };
}

function transformCategory(dbCategory: DbCategory): Category {
  return {
    id: dbCategory.id,
    name: dbCategory.name,
    slug: dbCategory.slug,
    icon: dbCategory.icon ?? '📚',
    bookCount: dbCategory.book_count ?? 0,
    description: dbCategory.description ?? undefined,
  };
}

function transformBook(dbBook: DbBook): Book {
  const categories: Category[] = dbBook.book_categories?.map(bc => ({
    id: bc.categories.id,
    name: bc.categories.name,
    slug: bc.categories.slug,
    icon: bc.categories.icon ?? '📚',
    bookCount: bc.categories.book_count ?? 0,
  })) ?? [];

  return {
    id: dbBook.id,
    title: dbBook.title,
    author: transformAuthor(dbBook.authors),
    coverImage: dbBook.cover_image_url ?? '/images/book-placeholder.jpg',
    price: dbBook.price,
    originalPrice: dbBook.original_price ?? undefined,
    discountPercentage: dbBook.discount_percentage ?? undefined,
    description: dbBook.description ?? '',
    categories,
    rating: dbBook.rating ?? 0,
    publishedDate: new Date(dbBook.published_date ?? Date.now()),
    isbn: '',
    pages: dbBook.pages ?? 0,
    language: dbBook.language ?? undefined,
    publisher: dbBook.publisher ?? undefined,
  };
}

// Fetch homepage config from database
async function getHomepageConfig(): Promise<HomepageConfig> {
  const supabase = getSupabaseServerClient();
  const { data, error } = await (supabase
    .from('homepage_config' as any)
    .select('*')
    .order('display_order', { ascending: true }));

  if (error || !data) {
    // Return default config structure
    return Object.entries(defaultConfig).map(([sectionId, config], index) => ({
      section_id: sectionId,
      enabled: true,
      display_order: index + 1,
      config,
    }));
  }

  return data as unknown as HomepageConfig;
}

// Get config value with fallback
function getConfigValue(config: HomepageConfig, sectionId: string, key: string, defaultValue?: unknown) {
  const section = config.find(s => s.section_id === sectionId);
  const value = section?.config[key];
  return value ?? defaultValue ?? defaultConfig[sectionId]?.[key];
}

async function getCategories(config: HomepageConfig): Promise<Category[]> {
  const supabase = getSupabaseServerClient();
  const selectedIds = getConfigValue(config, 'categories', 'selectedCategoryIds', []) as string[];

  let query = supabase
    .from('categories')
    .select('*')
    .order('display_order', { ascending: true });

  // Filter by selected categories if any are selected
  if (selectedIds.length > 0) {
    query = query.in('id', selectedIds);
  }

  const { data, error } = await query;

  if (error) {
    return [];
  }

  return (data ?? []).map(transformCategory);
}

async function getBookById(bookId: string): Promise<Book | null> {
  const supabase = getSupabaseServerClient();
  const { data, error } = await supabase
    .from('books')
    .select('*, authors(*), book_categories(categories(*))')
    .eq('id', bookId)
    .single();

  if (error || !data) {
    return null;
  }

  return transformBook(data as DbBook);
}

async function getAuthorById(authorId: string): Promise<Author | null> {
  const supabase = getSupabaseServerClient();
  const { data, error } = await supabase
    .from('authors')
    .select('*')
    .eq('id', authorId)
    .single();

  if (error || !data) {
    return null;
  }

  return transformAuthor(data as DbAuthor);
}

async function getAuthorBooksWithDetails(authorId: string, limit = 3): Promise<Book[]> {
  const supabase = getSupabaseServerClient();
  const { data, error } = await supabase
    .from('books')
    .select('*, authors(*), book_categories(categories(*))')
    .eq('author_id', authorId)
    .order('rating', { ascending: false })
    .limit(limit);

  if (error) {
    return [];
  }

  return (data as DbBook[]).map(transformBook);
}

async function getBooksByIds(bookIds: string[]): Promise<Book[]> {
  if (bookIds.length === 0) return [];

  const supabase = getSupabaseServerClient();
  const { data, error } = await supabase
    .from('books')
    .select('*, authors(*), book_categories(categories(*))')
    .in('id', bookIds);

  if (error) {
    return [];
  }

  return (data as DbBook[]).map(transformBook);
}

async function getBooksWithDetails(limit = 24): Promise<Book[]> {
  const supabase = getSupabaseServerClient();
  const { data, error } = await supabase
    .from('books')
    .select('*, authors(*), book_categories(categories(*))')
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) {
    return [];
  }

  return (data as DbBook[]).map(transformBook);
}

async function getBestsellers(limit = 6): Promise<Book[]> {
  const supabase = getSupabaseServerClient();
  const { data, error } = await supabase
    .from('books')
    .select('*, authors(*), book_categories(categories(*))')
    .eq('is_bestseller', true)
    .order('rating', { ascending: false })
    .limit(limit);

  if (error) {
    return [];
  }

  return (data as DbBook[]).map(transformBook);
}

async function getNewReleases(limit = 12): Promise<Book[]> {
  const supabase = getSupabaseServerClient();
  const { data, error } = await supabase
    .from('books')
    .select('*, authors(*), book_categories(categories(*))')
    .eq('is_new_release', true)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) {
    return [];
  }

  return (data as DbBook[]).map(transformBook);
}

async function getFeaturedBooks(limit = 8): Promise<Book[]> {
  const supabase = getSupabaseServerClient();
  const { data, error } = await supabase
    .from('books')
    .select('*, authors(*), book_categories(categories(*))')
    .eq('is_featured', true)
    .order('rating', { ascending: false })
    .limit(limit);

  if (error) {
    return [];
  }

  return (data as DbBook[]).map(transformBook);
}

async function getHighestRated(limit = 8): Promise<Book[]> {
  const supabase = getSupabaseServerClient();
  const { data, error } = await supabase
    .from('books')
    .select('*, authors(*), book_categories(categories(*))')
    .not('rating', 'is', null)
    .order('rating', { ascending: false })
    .limit(limit);

  if (error) {
    return [];
  }

  return (data as DbBook[]).map(transformBook);
}

async function getBooksByCategory(categoryId: string, limit = 12): Promise<Book[]> {
  const supabase = getSupabaseServerClient();
  const { data, error } = await supabase
    .from('book_categories')
    .select('books(*, books!inner(authors(*)), book_categories(categories(*)))')
    .eq('category_id', categoryId)
    .limit(limit);

  if (error) {
    return [];
  }

  return (data as unknown as DbBook[]).map(transformBook);
}

async function getBookOfTheDayFromConfig(config: HomepageConfig): Promise<BookOfTheDayType | null> {
  const bookId = getConfigValue(config, 'book-of-the-day', 'bookId', null) as string | null;

  if (bookId) {
    const book = await getBookById(bookId);
    if (book) {
      const reason = getConfigValue(config, 'book-of-the-day', 'reason', 'A handpicked selection for today\'s readers.') as string;
      return {
        book,
        featuredAt: new Date(),
        reason,
      };
    }
  }

  // Fallback to scheduled book
  const supabase = getSupabaseServerClient();
  const today = new Date().toISOString().split('T')[0];

  const { data, error } = await supabase
    .from('book_of_the_day')
    .select('*, books(*, books!inner(authors(*)), book_categories(categories(*)))')
    .lte('featured_date', today)
    .order('featured_date', { ascending: false })
    .limit(1)
    .single();

  if (error || !data) {
    return null;
  }

  const botd = data as unknown as DbBookOfTheDay;
  return {
    book: transformBook(botd.books),
    featuredAt: new Date(botd.featured_date),
    reason: botd.description ?? 'A handpicked selection for today\'s readers.',
  };
}

async function getAuthorOfTheDayFromConfig(config: HomepageConfig): Promise<AuthorOfTheDayType | null> {
  const authorId = getConfigValue(config, 'author-of-the-day', 'authorId', null) as string | null;
  const maxBooks = getConfigValue(config, 'author-of-the-day', 'maxBooks', 3) as number;

  if (authorId) {
    const author = await getAuthorById(authorId);
    const featuredBooks = await getAuthorBooksWithDetails(authorId, maxBooks);
    const reason = getConfigValue(config, 'author-of-the-day', 'reason', 'Celebrating one of our favorite authors today.') as string;

    if (author) {
      return {
        author,
        featuredAt: new Date(),
        reason,
        featuredBooks,
      };
    }
  }

  // Fallback to scheduled author
  const supabase = getSupabaseServerClient();
  const today = new Date().toISOString().split('T')[0];

  const { data, error } = await supabase
    .from('author_of_the_day')
    .select('*, authors(*)')
    .lte('featured_date', today)
    .order('featured_date', { ascending: false })
    .limit(1)
    .single();

  if (error || !data) {
    return null;
  }

  const aotd = data as DbAuthorOfTheDay;
  const authorBooks = await getAuthorBooksWithDetails(aotd.authors.id, maxBooks);

  return {
    author: transformAuthor(aotd.authors),
    featuredAt: new Date(aotd.featured_date),
    reason: aotd.description ?? 'Celebrating one of our favorite authors today.',
    featuredBooks: authorBooks,
  };
}

async function getRecommendedBooksFromConfig(config: HomepageConfig, allBooks: Book[]): Promise<Book[]> {
  const selectedBookIds = getConfigValue(config, 'recommended-books', 'selectedBookIds', []) as string[];

  // If admin has selected specific books, use those
  if (selectedBookIds.length > 0) {
    return await getBooksByIds(selectedBookIds);
  }

  // Fallback to random books (shuffle and take 6)
  const shuffled = [...allBooks].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, 6);
}

async function getForYouBooksFromConfig(config: HomepageConfig, allBooks: Book[]): Promise<Book[]> {
  const source = getConfigValue(config, 'for-you', 'source', 'new-releases') as string;
  const categoryId = getConfigValue(config, 'for-you', 'categoryId', null) as string | null;
  const bookCount = getConfigValue(config, 'for-you', 'bookCount', 12) as number;
  const selectedBookIds = getConfigValue(config, 'for-you', 'selectedBookIds', []) as string[];

  // If manual selection, use selected book IDs
  if (source === 'manual' && selectedBookIds.length > 0) {
    return await getBooksByIds(selectedBookIds);
  }

  // Use source-based selection
  switch (source) {
    case 'new-releases':
      return await getNewReleases(bookCount);
    case 'featured':
      return await getFeaturedBooks(bookCount);
    case 'personalized':
      // Fallback to new releases for personalized
      return await getNewReleases(bookCount);
    case 'category':
      if (categoryId) {
        return await getBooksByCategory(categoryId, bookCount);
      }
      return await getNewReleases(bookCount);
    default:
      return await getNewReleases(bookCount);
  }
}

async function getRouletteBooksFromConfig(config: HomepageConfig): Promise<Book[]> {
  const categoryId = getConfigValue(config, 'book-roulette', 'categoryId', null) as string | null;

  // If a category is specified, get random books from that category
  if (categoryId) {
    const categoryBooks = await getBooksByCategory(categoryId, 100);
    // Shuffle to get random selection
    return categoryBooks.sort(() => Math.random() - 0.5).slice(0, 12);
  }

  // If no category (all categories selected), get all random books
  const allBooks = await getBooksWithDetails(200);
  // Shuffle to get random selection
  return allBooks.sort(() => Math.random() - 0.5).slice(0, 12);
}

async function getAuthors(): Promise<Author[]> {
  const supabase = getSupabaseServerClient();
  const { data, error } = await supabase
    .from('authors')
    .select('*')
    .order('name', { ascending: true });

  if (error) {
    return [];
  }

  return (data as DbAuthor[]).map(transformAuthor);
}

// Get all authors for hero section rotation
async function getAllAuthors(): Promise<Author[]> {
  const supabase = getSupabaseServerClient();
  const { data, error } = await supabase
    .from('authors')
    .select('*')
    .order('name', { ascending: true });

  if (error || !data) {
    return [];
  }

  return (data as DbAuthor[]).map(transformAuthor);
}

// Get featured author for hero section with date-based rotation
async function getHeroFeaturedAuthor(config: HomepageConfig, allAuthors: Author[]): Promise<Author | null> {
  if (allAuthors.length === 0) return null;

  const autoRotate = getConfigValue(config, 'hero', 'autoRotateAuthor', true) as boolean;
  const featuredAuthorId = getConfigValue(config, 'hero', 'featuredAuthorId', null) as string | null;

  // Priority 1: If auto-rotation is explicitly enabled, use date-based rotation
  if (autoRotate === true) {
    // Use current date to select a consistent author for the day
    const today = new Date();
    const dateString = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

    // Create a simple hash from the date string to get a consistent index
    let hash = 0;
    for (let i = 0; i < dateString.length; i++) {
      hash = ((hash << 5) - hash) + dateString.charCodeAt(i);
      hash |= 0;
    }
    const index = Math.abs(hash) % allAuthors.length;
    return allAuthors[index] || null;
  }

  // Priority 2: If a specific author is explicitly selected (not null/empty), use that author
  if (featuredAuthorId && featuredAuthorId.trim() !== '') {
    const selectedAuthor = allAuthors.find((a) => a.id === featuredAuthorId);
    if (selectedAuthor) {
      return selectedAuthor;
    }
  }

  // Priority 3: Fallback to date-based rotation when no explicit author is selected
  const today = new Date();
  const dateString = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

  // Create a simple hash from the date string to get a consistent index
  let hash = 0;
  for (let i = 0; i < dateString.length; i++) {
    hash = ((hash << 5) - hash) + dateString.charCodeAt(i);
    hash |= 0;
  }
  const index = Math.abs(hash) % allAuthors.length;
  return allAuthors[index] || null;
}

// Get trending books for hero section
async function getTrendingBooks(limit = 6): Promise<Book[]> {
  const supabase = getSupabaseServerClient();
  const { data, error } = await supabase
    .from('books')
    .select('*, authors(*), book_categories(categories(*))')
    .order('rating', { ascending: false })
    .limit(limit);

  if (error) {
    return [];
  }

  return (data as DbBook[]).map(transformBook);
}

export default async function BookstoreHome() {
  // Fetch homepage config
  const homepageConfig = await getHomepageConfig();

  // Fetch all authors for hero section
  const allAuthors = await getAllAuthors();

  // Fetch hero featured author and trending books
  const [heroFeaturedAuthor, trendingBooks] = await Promise.all([
    allAuthors.length > 0 ? getHeroFeaturedAuthor(homepageConfig, allAuthors) : null,
    getTrendingBooks(6),
  ]);

  // Fetch all data in parallel
  const [
    categories,
    allBooks,
    bookOfTheDay,
    authorOfTheDay,
    authors,
  ] = await Promise.all([
    getCategories(homepageConfig),
    getBooksWithDetails(24),
    getBookOfTheDayFromConfig(homepageConfig),
    getAuthorOfTheDayFromConfig(homepageConfig),
    getAuthors(),
  ]);

  // Fetch section-specific books based on config
  const [recommendedBooks, forYouBooks, rouletteBooks] = await Promise.all([
    getRecommendedBooksFromConfig(homepageConfig, allBooks),
    getForYouBooksFromConfig(homepageConfig, allBooks),
    getRouletteBooksFromConfig(homepageConfig),
  ]);

  // Get config values for titles
  const categoriesTitle = getConfigValue(homepageConfig, 'categories', 'title', 'Browse by Category') as string;
  const bookOfTheDayLayout = getConfigValue(homepageConfig, 'book-of-the-day', 'layout', 'mercury') as string;
  const authorOfTheDayLayout = getConfigValue(homepageConfig, 'author-of-the-day', 'layout', 'mercury') as string;
  const recommendedTitle = getConfigValue(homepageConfig, 'recommended-books', 'title', 'Recommended for You') as string;
  const recommendedSubtitle = getConfigValue(homepageConfig, 'recommended-books', 'subtitle', 'Handpicked selections based on popularity') as string;
  const forYouTitle = getConfigValue(homepageConfig, 'for-you', 'title', 'New Releases Just for You') as string;
  const forYouSubtitle = getConfigValue(homepageConfig, 'for-you', 'subtitle', 'Fresh arrivals tailored to your taste') as string;
  const rouletteTitle = getConfigValue(homepageConfig, 'book-roulette', 'title', 'Feeling Lucky?') as string;
  const rouletteSubtitle = getConfigValue(homepageConfig, 'book-roulette', 'subtitle', 'Spin to discover a random book from our collection') as string;
  const searchTitle = getConfigValue(homepageConfig, 'search', 'title', 'Explore All Books') as string;
  const searchPlaceholder = getConfigValue(homepageConfig, 'search', 'placeholder', 'Search by title, author, ISBN...') as string;
  const searchLayout = getConfigValue(homepageConfig, 'search', 'layout', 'mercury') as 'mercury' | 'venus' | 'mars' | 'jupiter' | 'saturn';
  const searchPageSize = getConfigValue(homepageConfig, 'search', 'pageSize', 12) as number;

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <HeroSection featuredAuthor={heroFeaturedAuthor} featuredBooks={trendingBooks} />

      {/* Main Content */}
      <div className="flex flex-col space-y-24 py-12">
        {/* Categories */}
        <section id="categories" className="container mx-auto px-4">
          <CategoryCarousel
            categories={categories}
            title={categoriesTitle}
          />
        </section>

        {/* Book of the Day */}
        {bookOfTheDay && (
          <section id="book-of-the-day" className="container mx-auto px-4">
            <BookOfTheDay featured={bookOfTheDay} layout={bookOfTheDayLayout} />
          </section>
        )}

        {/* Author of the Day */}
        {authorOfTheDay && (
          <section id="authors" className="container mx-auto px-4">
            <AuthorOfTheDay featured={authorOfTheDay} layout={authorOfTheDayLayout} />
          </section>
        )}

        {/* Recommended Books */}
        <section id="bestsellers" className="container mx-auto px-4">
          <RecommendedBooks
            books={recommendedBooks}
            title={recommendedTitle}
            subtitle={recommendedSubtitle}
          />
        </section>

        {/* For You Section */}
        <section id="new-releases" className="container mx-auto px-4">
          <ForYouSection
            books={forYouBooks}
            title={forYouTitle}
            subtitle={forYouSubtitle}
          />
        </section>

        {/* Book Roulette */}
        <section id="sale" className="container mx-auto px-4">
          <BookRoulette books={rouletteBooks} title={rouletteTitle} subtitle={rouletteSubtitle} />
        </section>

        {/* Search Section */}
        <section id="browse-books" className="container mx-auto px-4">
          <SearchSection
            categories={categories}
            authors={authors}
            title={searchTitle}
            placeholder={searchPlaceholder}
            layout={searchLayout}
            pageSize={searchPageSize}
          />
        </section>
      </div>
    </div>
  );
}
