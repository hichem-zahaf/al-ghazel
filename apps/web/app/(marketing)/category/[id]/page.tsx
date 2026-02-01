'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { ArrowLeft, BookOpen, Search, SlidersHorizontal, X } from 'lucide-react';
import { useInfiniteQuery } from '@tanstack/react-query';
import { BookCard } from '~/(marketing)/_components/bookstore/book-card';
import { CategoryIcon } from '~/(marketing)/_components/bookstore/category-icon';
import { Button } from '@kit/ui/button';
import { Badge } from '@kit/ui/badge';
import { Input } from '@kit/ui/input';
import { Separator } from '@kit/ui/separator';
import type { Book } from '~/types/bookstore';

interface CategoryBooksResponse {
  books: Book[];
  nextCursor: string | null;
  hasMore: boolean;
  totalCount: number;
}

interface Category {
  id: string;
  name: string;
  slug: string;
  icon: string | null;
  description: string | null;
  book_count: number;
}

const DEFAULT_PAGE_SIZE = 12;

export default function CategoryDetailPage() {
  const params = useParams();
  const slug = params.id as string;

  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    minPrice: '',
    maxPrice: '',
    minRating: '',
    language: '',
    sortBy: 'created_at',
    sortOrder: 'desc' as 'asc' | 'desc',
  });

  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [category, setCategory] = useState<Category | null>(null);

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(searchQuery);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Fetch category info
  useEffect(() => {
    async function fetchCategory() {
      try {
        const response = await fetch(`/api/category/${slug}/info`);
        if (!response.ok) {
          if (response.status === 404) {
            notFound();
          }
          return;
        }
        const data = await response.json();
        setCategory(data);
      } catch (error) {
        console.error('Error fetching category:', error);
      }
    }
    fetchCategory();
  }, [slug]);

  // Build query params
  const buildQueryParams = useCallback((cursor: string | null = null) => {
    const params = new URLSearchParams();
    params.append('pageSize', String(DEFAULT_PAGE_SIZE));

    if (debouncedQuery) params.append('query', debouncedQuery);
    if (filters.minPrice) params.append('minPrice', filters.minPrice);
    if (filters.maxPrice) params.append('maxPrice', filters.maxPrice);
    if (filters.minRating) params.append('minRating', filters.minRating);
    if (filters.language) params.append('language', filters.language);
    params.append('sortBy', filters.sortBy);
    params.append('sortOrder', filters.sortOrder);
    if (cursor) params.append('cursor', cursor);

    return params.toString();
  }, [debouncedQuery, filters]);

  // Infinite scroll query
  const {
    data,
    error,
    isLoading,
    hasNextPage,
    fetchNextPage,
    isFetchingNextPage,
  } = useInfiniteQuery({
    queryKey: ['category-books', slug, debouncedQuery, filters],
    queryFn: async ({ pageParam }: { pageParam: string | null }) => {
      const response = await fetch(`/api/category/${slug}?${buildQueryParams(pageParam)}`);
      if (!response.ok) {
        throw new Error('Failed to fetch books');
      }
      return (await response.json()) as CategoryBooksResponse;
    },
    initialPageParam: null as string | null,
    getNextPageParam: (lastPage) => lastPage.nextCursor,
    enabled: !!slug,
  });

  // Infinite scroll observer
  const observerTarget = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const firstEntry = entries[0];
        if (firstEntry?.isIntersecting && hasNextPage && !isFetchingNextPage) {
          fetchNextPage();
        }
      },
      { threshold: 0.1 }
    );

    const currentTarget = observerTarget.current;
    if (currentTarget) {
      observer.observe(currentTarget);
    }

    return () => {
      if (currentTarget) {
        observer.unobserve(currentTarget);
      }
    };
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  // Flatten all books from pages
  const allBooks = data?.pages.flatMap((page: CategoryBooksResponse) => page.books) ?? [];
  const totalCount = data?.pages[0]?.totalCount ?? 0;

  // Filter handlers
  const handleFilterChange = (key: string, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const clearFilters = () => {
    setFilters({
      minPrice: '',
      maxPrice: '',
      minRating: '',
      language: '',
      sortBy: 'created_at',
      sortOrder: 'desc',
    });
    setSearchQuery('');
  };

  const hasActiveFilters = Object.values(filters).some((v) => v !== '' && v !== 'created_at' && v !== 'desc') || searchQuery !== '';

  if (!category && isLoading) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="animate-pulse">
          <div className="h-8 bg-muted rounded w-1/3 mb-4"></div>
          <div className="h-64 bg-muted rounded"></div>
        </div>
      </div>
    );
  }

  if (!category) {
    notFound();
    return null;
  }

  return (
    <>
      {/* Back Button */}
      <div className="container mx-auto px-4 py-6">
        <Link href="/category">
          <Button variant="ghost" size="sm" className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back to Categories
          </Button>
        </Link>
      </div>

      {/* Category Header */}
      <div className="container mx-auto px-4 pb-8">
        <div className="mb-8">
          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-6">
            <div className="flex items-start gap-4">
              <div className="text-orange">
                <CategoryIcon iconName={category.icon} size={56} />
              </div>
              <div>
                <h1 className="text-4xl lg:text-5xl font-bold text-black dark:text-beige mb-2">
                  {category.name}
                </h1>
                {category.description && (
                  <p className="text-lg text-muted-foreground mb-3">{category.description}</p>
                )}
                <div className="flex items-center gap-2">
                  <BookOpen className="h-4 w-4 text-orange" />
                  <span className="text-muted-foreground">
                    <span className="font-semibold text-black dark:text-beige">{totalCount}</span> books
                  </span>
                </div>
              </div>
            </div>
          </div>

          <Separator />

          {/* Search and Filters */}
          <div className="mt-6 space-y-4">
            {/* Search Bar */}
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Search books in this category..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Button
                variant="outline"
                onClick={() => setShowFilters(!showFilters)}
                className="gap-2"
              >
                <SlidersHorizontal className="h-4 w-4" />
                Filters
                {hasActiveFilters && (
                  <Badge variant="secondary" className="ml-1 h-5 px-1.5 text-xs">
                    {(Object.values(filters).filter((v) => v !== '' && v !== 'created_at' && v !== 'desc').length) + (searchQuery ? 1 : 0)}
                  </Badge>
                )}
              </Button>
            </div>

            {/* Filters Panel */}
            {showFilters && (
              <div className="p-4 bg-muted/30 rounded-lg space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-black dark:text-beige">Filters</h3>
                  {hasActiveFilters && (
                    <Button variant="ghost" size="sm" onClick={clearFilters} className="gap-1 text-sm">
                      <X className="h-3 w-3" />
                      Clear All
                    </Button>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {/* Price Range */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Price Range</label>
                    <div className="flex gap-2">
                      <Input
                        type="number"
                        placeholder="Min"
                        value={filters.minPrice}
                        onChange={(e) => handleFilterChange('minPrice', e.target.value)}
                        className="flex-1"
                      />
                      <Input
                        type="number"
                        placeholder="Max"
                        value={filters.maxPrice}
                        onChange={(e) => handleFilterChange('maxPrice', e.target.value)}
                        className="flex-1"
                      />
                    </div>
                  </div>

                  {/* Minimum Rating */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Min Rating</label>
                    <select
                      value={filters.minRating}
                      onChange={(e) => handleFilterChange('minRating', e.target.value)}
                      className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2"
                    >
                      <option value="">Any</option>
                      <option value="4">4+ Stars</option>
                      <option value="3">3+ Stars</option>
                      <option value="2">2+ Stars</option>
                      <option value="1">1+ Stars</option>
                    </select>
                  </div>

                  {/* Language */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Language</label>
                    <select
                      value={filters.language}
                      onChange={(e) => handleFilterChange('language', e.target.value)}
                      className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2"
                    >
                      <option value="">Any</option>
                      <option value="English">English</option>
                      <option value="Arabic">Arabic</option>
                      <option value="French">French</option>
                      <option value="Spanish">Spanish</option>
                    </select>
                  </div>

                  {/* Sort By */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Sort By</label>
                    <select
                      value={`${filters.sortBy}-${filters.sortOrder}`}
                      onChange={(e) => {
                        const [sortBy, sortOrder] = e.target.value.split('-') as [string, 'asc' | 'desc'];
                        setFilters((prev) => ({ ...prev, sortBy: sortBy ?? 'created_at', sortOrder }));
                      }}
                      className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2"
                    >
                      <option value="created_at-desc">Newest First</option>
                      <option value="created_at-asc">Oldest First</option>
                      <option value="price-asc">Price: Low to High</option>
                      <option value="price-desc">Price: High to Low</option>
                      <option value="rating-desc">Highest Rated</option>
                      <option value="title-asc">Title: A to Z</option>
                      <option value="title-desc">Title: Z to A</option>
                    </select>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Results Count */}
        <div className="flex items-center justify-between mb-4">
          <p className="text-sm text-muted-foreground">
            {isLoading ? (
              'Loading...'
            ) : (
              <>
                Showing <span className="font-semibold text-black dark:text-beige">{allBooks.length}</span> of{' '}
                <span className="font-semibold text-black dark:text-beige">{totalCount}</span> books
              </>
            )}
          </p>
        </div>

        {/* Books Grid */}
        {error ? (
          <div className="text-center py-16">
            <p className="text-destructive">Failed to load books. Please try again.</p>
          </div>
        ) : allBooks.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {allBooks.map((book: Book) => (
              <BookCard key={book.id} book={book} variant="mercury" />
            ))}
          </div>
        ) : !isLoading ? (
          <div className="text-center py-16 bg-muted/30 rounded-lg">
            <BookOpen className="h-16 w-16 mx-auto mb-4 text-muted-foreground/50" />
            <h3 className="text-xl font-semibold text-black dark:text-beige mb-2">
              No books found
            </h3>
            <p className="text-muted-foreground mb-4">
              Try adjusting your search or filters to find what you&apos;re looking for.
            </p>
            {hasActiveFilters && (
              <Button variant="outline" onClick={clearFilters}>
                Clear Filters
              </Button>
            )}
          </div>
        ) : null}

        {/* Loading / Infinite Scroll Trigger */}
        <div ref={observerTarget} className="mt-8">
          {isFetchingNextPage && (
            <div className="flex justify-center py-8">
              <div className="flex gap-2">
                <div className="w-2 h-2 bg-orange rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                <div className="w-2 h-2 bg-orange rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                <div className="w-2 h-2 bg-orange rounded-full animate-bounce"></div>
              </div>
            </div>
          )}
        </div>

        {/* End of Results */}
        {!hasNextPage && allBooks.length > 0 && !isFetchingNextPage && (
          <div className="text-center py-8">
            <p className="text-muted-foreground text-sm">
              You&apos;ve reached the end of the results
            </p>
          </div>
        )}
      </div>
    </>
  );
}
