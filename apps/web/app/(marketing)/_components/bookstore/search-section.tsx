/**
 * Search Section Component - "Explore All Books"
 * Server-side filtering with infinite scroll and planet layout styles
 */

'use client';

import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Search, SlidersHorizontal, X, Loader2 } from 'lucide-react';
import { cn } from '@kit/ui/utils';
import { Button } from '@kit/ui/button';
import { Input } from '@kit/ui/input';
import { Badge } from '@kit/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@kit/ui/select';
import { BookCard } from './book-card';
import type { Book, Category, Author } from '../../../../types/bookstore';

type PlanetLayout = 'mercury' | 'venus' | 'mars' | 'jupiter' | 'saturn';

interface ExploreFilters {
  query: string;
  category?: string;
  author?: string;
  minPrice?: number;
  maxPrice?: number;
  minRating?: number;
}

interface ExploreResponse {
  books: Book[];
  nextCursor: string | null;
  hasMore: boolean;
  totalCount: number;
  personalizedRatio?: number;
}

interface SearchSectionProps {
  initialBooks?: Book[];
  categories: Category[];
  authors: Author[];
  title?: string;
  placeholder?: string;
  layout?: PlanetLayout;
  pageSize?: number;
  className?: string;
}

export function SearchSection({
  initialBooks = [],
  categories,
  authors,
  title = 'Explore All Books',
  placeholder = 'Search by title, author, ISBN...',
  layout = 'mercury',
  pageSize = 12,
  className
}: SearchSectionProps) {
  const searchParams = useSearchParams();
  const router = useRouter();

  // State
  const [books, setBooks] = useState<Book[]>(initialBooks);
  const [cursor, setCursor] = useState<string | null>(searchParams.get('cursor'));
  const [hasMore, setHasMore] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [showFilters, setShowFilters] = useState(false); // Client-side state only

  // Track if component is mounted (past hydration)
  const hasMounted = useRef(false);

  // Layout state - start with prop value to match SSR, then read from localStorage after hydration
  const [selectedLayout, setSelectedLayout] = useState<PlanetLayout>(layout);

  // Filters state
  const [filters, setFilters] = useState<ExploreFilters>({
    query: searchParams.get('query') || '',
    category: searchParams.get('category') || undefined,
    author: searchParams.get('author') || undefined,
    minPrice: searchParams.get('minPrice') ? parseFloat(searchParams.get('minPrice')!) : undefined,
    maxPrice: searchParams.get('maxPrice') ? parseFloat(searchParams.get('maxPrice')!) : undefined,
    minRating: searchParams.get('minRating') ? parseFloat(searchParams.get('minRating')!) : undefined,
  });

  // Personalization info (only for authenticated users)
  const [personalizedRatio, setPersonalizedRatio] = useState<number | undefined>();

  // Observer target for infinite scroll
  const observerTarget = useRef<HTMLDivElement>(null);
  const formRef = useRef<HTMLFormElement>(null);

  // Read from localStorage after hydration (once)
  useEffect(() => {
    if (!hasMounted.current) {
      hasMounted.current = true;
      const saved = localStorage.getItem('bookstore-layout');
      if (saved && ['mercury', 'venus', 'mars', 'jupiter', 'saturn'].includes(saved)) {
        setSelectedLayout(saved as PlanetLayout);
      }
    }
  }, []);

  // Save layout to localStorage when changed
  useEffect(() => {
    if (hasMounted.current) {
      localStorage.setItem('bookstore-layout', selectedLayout);
    }
  }, [selectedLayout]);

  // ============================================================================
  // URL Sync
  // ============================================================================

  const updateURL = useCallback((newFilters: ExploreFilters, newCursor?: string | null) => {
    const params = new URLSearchParams();

    if (newFilters.query) params.set('query', newFilters.query);
    if (newFilters.category) params.set('category', newFilters.category);
    if (newFilters.author) params.set('author', newFilters.author);
    if (newFilters.minPrice !== undefined) params.set('minPrice', newFilters.minPrice.toString());
    if (newFilters.maxPrice !== undefined) params.set('maxPrice', newFilters.maxPrice.toString());
    if (newFilters.minRating !== undefined) params.set('minRating', newFilters.minRating.toString());
    if (newCursor) params.set('cursor', newCursor);
    // Note: layout and pageSize are NOT added to URL - they're client-side preferences

    const queryString = params.toString();
    router.push(`${queryString ? `?${queryString}` : ''}`, { scroll: false });
  }, [router]);

  // ============================================================================
  // Data Fetching
  // ============================================================================

  const fetchBooks = useCallback(async (resetData = false) => {
    if (isLoading) return;

    setIsLoading(true);

    try {
      const params = new URLSearchParams();
      if (filters.query) params.set('query', filters.query);
      if (filters.category) params.set('category', filters.category);
      if (filters.author) params.set('author', filters.author);
      if (filters.minPrice !== undefined) params.set('minPrice', filters.minPrice.toString());
      if (filters.maxPrice !== undefined) params.set('maxPrice', filters.maxPrice.toString());
      if (filters.minRating !== undefined) params.set('minRating', filters.minRating.toString());
      if (!resetData && cursor) params.set('cursor', cursor);
      params.set('pageSize', pageSize.toString());

      const response = await fetch(`/api/books/explore?${params.toString()}`);
      const data: ExploreResponse = await response.json();

      if (response.ok) {
        if (resetData) {
          setBooks(data.books);
          setCursor(data.nextCursor);
        } else {
          setBooks(prev => [...prev, ...data.books]);
          setCursor(data.nextCursor);
        }
        setHasMore(data.hasMore);
        setPersonalizedRatio(data.personalizedRatio);

        // Update URL with new cursor
        updateURL(filters, data.nextCursor);
      } else {
        console.error('Failed to fetch books:', data);
      }
    } catch (error) {
      console.error('Error fetching books:', error);
    } finally {
      setIsLoading(false);
      setIsInitialLoad(false);
    }
  }, [filters, cursor, pageSize, isLoading, updateURL]);

  // Initial load
  useEffect(() => {
    if (initialBooks.length === 0) {
      fetchBooks(true);
    } else {
      setIsInitialLoad(false);
    }
  }, []);

  // ============================================================================
  // Infinite Scroll
  // ============================================================================

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting && hasMore && !isLoading) {
          fetchBooks(false);
        }
      },
      { threshold: 0.1, rootMargin: '100px' }
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
  }, [hasMore, isLoading, fetchBooks]);

  // ============================================================================
  // Filter Handlers
  // ============================================================================

  const handleFilterChange = (key: keyof ExploreFilters, value: string | number | undefined) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setCursor(null); // Reset cursor for new search
    fetchBooks(true);
  };

  const clearFilter = (key: keyof ExploreFilters) => {
    const newFilters = { ...filters, [key]: undefined };
    setFilters(newFilters);
    setCursor(null);
    fetchBooks(true);
  };

  const clearAllFilters = () => {
    const emptyFilters: ExploreFilters = { query: '' };
    setFilters(emptyFilters);
    setCursor(null);
    fetchBooks(true);
  };

  // ============================================================================
  // Computed Values
  // ============================================================================

  const hasActiveFilters = useMemo(() => {
    return !!(
      filters.query ||
      filters.category ||
      filters.author ||
      filters.minPrice !== undefined ||
      filters.maxPrice !== undefined ||
      filters.minRating !== undefined
    );
  }, [filters]);

  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (filters.query) count++;
    if (filters.category) count++;
    if (filters.author) count++;
    if (filters.minPrice !== undefined) count++;
    if (filters.maxPrice !== undefined) count++;
    if (filters.minRating !== undefined) count++;
    return count;
  }, [filters]);

  // ============================================================================
  // Layout Classes
  // ============================================================================

  const layoutClasses = useMemo(() => {
    switch (selectedLayout) {
      case 'mercury':
        return 'grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4';
      case 'venus':
        return 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6';
      case 'mars':
        return 'flex flex-col gap-4';
      case 'jupiter':
        return 'columns-1 md:columns-2 lg:columns-3 gap-4 space-y-4';
      case 'saturn':
        return 'flex flex-col gap-3';
      default:
        return 'grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4';
    }
  }, [selectedLayout]);

  // ============================================================================
  // Render
  // ============================================================================

  return (
    <section
      id="explore"
      className={cn('bg-white dark:bg-card rounded-3xl shadow-sm overflow-hidden', className)}
    >
      <div className="container mx-auto px-4 py-12">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-3xl font-bold text-black dark:text-beige">{title}</h2>
            {personalizedRatio !== undefined && (
              <p className="text-sm text-muted-foreground mt-1">
                {Math.round(personalizedRatio * 100)}% personalized for you
              </p>
            )}
          </div>
          <div className="flex items-center gap-3">
            <Select value={selectedLayout} onValueChange={(value) => {
              setSelectedLayout(value as PlanetLayout);
              updateURL(filters, cursor);
            }}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Layout" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="mercury">Mercury</SelectItem>
                <SelectItem value="venus">Venus</SelectItem>
                <SelectItem value="mars">Mars</SelectItem>
                <SelectItem value="jupiter">Jupiter</SelectItem>
                <SelectItem value="saturn">Saturn</SelectItem>
              </SelectContent>
            </Select>
            <Button
              variant="outline"
              size="icon"
              onClick={() => {
                setShowFilters(!showFilters);
                updateURL(filters, cursor);
              }}
              className={cn(
                'h-10 w-10',
                showFilters && 'bg-orange text-white hover:bg-orange/90'
              )}
            >
              <SlidersHorizontal className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Search Form */}
        <form ref={formRef} onSubmit={handleFormSubmit}>
          <div className="flex gap-3 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                type="text"
                name="query"
                placeholder={placeholder}
                value={filters.query}
                onChange={(e) => handleFilterChange('query', e.target.value)}
                className="pl-12 h-12 text-base"
              />
            </div>
            <Button type="submit" className="h-12 px-6 bg-orange hover:bg-orange/90">
              Search
            </Button>
          </div>

          {/* Filters Panel */}
          {showFilters && (
            <div className={cn(
              'grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6 p-6 rounded-xl',
              'bg-beige-light dark:bg-neutral-800',
              'animate-in fade-in slide-in-from-top-2 duration-300'
            )}>
              {/* Category */}
              <div>
                <label className="block text-sm font-medium text-black dark:text-beige mb-2">
                  Category
                </label>
                <Select
                  value={filters.category || 'all'}
                  onValueChange={(value) => handleFilterChange('category', value === 'all' ? undefined : value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="All Categories" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    {categories.map((category) => (
                      <SelectItem key={category.id} value={category.id}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Author */}
              <div>
                <label className="block text-sm font-medium text-black dark:text-beige mb-2">
                  Author
                </label>
                <Select
                  value={filters.author || 'all'}
                  onValueChange={(value) => handleFilterChange('author', value === 'all' ? undefined : value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="All Authors" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Authors</SelectItem>
                    {authors.slice(0, 50).map((author) => (
                      <SelectItem key={author.id} value={author.id}>
                        {author.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Min Price */}
              <div>
                <label className="block text-sm font-medium text-black dark:text-beige mb-2">
                  Min Price
                </label>
                <Input
                  type="number"
                  placeholder="No minimum"
                  value={filters.minPrice ?? ''}
                  onChange={(e) => handleFilterChange('minPrice', e.target.value ? parseFloat(e.target.value) : undefined)}
                  min="0"
                  step="0.01"
                />
              </div>

              {/* Max Price */}
              <div>
                <label className="block text-sm font-medium text-black dark:text-beige mb-2">
                  Max Price
                </label>
                <Input
                  type="number"
                  placeholder="No maximum"
                  value={filters.maxPrice ?? ''}
                  onChange={(e) => handleFilterChange('maxPrice', e.target.value ? parseFloat(e.target.value) : undefined)}
                  min="0"
                  step="0.01"
                />
              </div>

              {/* Min Rating */}
              <div>
                <label className="block text-sm font-medium text-black dark:text-beige mb-2">
                  Min Rating
                </label>
                <Select
                  value={filters.minRating?.toString() || 'all'}
                  onValueChange={(value) => handleFilterChange('minRating', value === 'all' ? undefined : parseFloat(value))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Any Rating" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Any Rating</SelectItem>
                    <SelectItem value="4.5">4.5+ ★</SelectItem>
                    <SelectItem value="4">4+ ★</SelectItem>
                    <SelectItem value="3.5">3.5+ ★</SelectItem>
                    <SelectItem value="3">3+ ★</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Actions */}
              <div className="flex items-end gap-2">
                <Button
                  type="submit"
                  className="flex-1 bg-orange hover:bg-orange/90"
                >
                  Apply Filters
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={clearAllFilters}
                  disabled={!hasActiveFilters}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )}

          {/* Active Filters */}
          {hasActiveFilters && (
            <div className="flex flex-wrap gap-2 mb-6">
              {filters.query && (
                <Badge variant="secondary" className="gap-1">
                  Search: "{filters.query}"
                  <button
                    type="button"
                    onClick={() => clearFilter('query')}
                    className="ml-1 hover:text-black dark:hover:text-beige"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </Badge>
              )}
              {filters.category && (
                <Badge variant="secondary" className="gap-1">
                  {categories.find((c) => c.id === filters.category)?.name}
                  <button
                    type="button"
                    onClick={() => clearFilter('category')}
                    className="ml-1 hover:text-black dark:hover:text-beige"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </Badge>
              )}
              {filters.author && (
                <Badge variant="secondary" className="gap-1">
                  {authors.find((a) => a.id === filters.author)?.name}
                  <button
                    type="button"
                    onClick={() => clearFilter('author')}
                    className="ml-1 hover:text-black dark:hover:text-beige"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </Badge>
              )}
              {filters.minPrice !== undefined && (
                <Badge variant="secondary" className="gap-1">
                  Min: ${filters.minPrice}
                  <button
                    type="button"
                    onClick={() => clearFilter('minPrice')}
                    className="ml-1 hover:text-black dark:hover:text-beige"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </Badge>
              )}
              {filters.maxPrice !== undefined && (
                <Badge variant="secondary" className="gap-1">
                  Max: ${filters.maxPrice}
                  <button
                    type="button"
                    onClick={() => clearFilter('maxPrice')}
                    className="ml-1 hover:text-black dark:hover:text-beige"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </Badge>
              )}
              {filters.minRating !== undefined && (
                <Badge variant="secondary" className="gap-1">
                  {filters.minRating}+ ★
                  <button
                    type="button"
                    onClick={() => clearFilter('minRating')}
                    className="ml-1 hover:text-black dark:hover:text-beige"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </Badge>
              )}
            </div>
          )}
        </form>

        {/* Results */}
        <div>
          {/* Results Count */}
          <div className="flex items-center justify-between mb-6">
            <p className="text-muted-foreground">
              {isInitialLoad ? (
                'Loading books...'
              ) : (
                <>
                  Showing {books.length} book{books.length !== 1 ? 's' : ''}
                  {hasMore && ' (scroll for more)'}
                </>
              )}
            </p>
          </div>

          {/* Empty State */}
          {!isInitialLoad && books.length === 0 ? (
            <div className="text-center py-16">
              <Search className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-xl font-semibold text-black dark:text-beige mb-2">
                No books found
              </h3>
              <p className="text-muted-foreground mb-6">
                Try adjusting your search or filters
              </p>
              <Button onClick={clearAllFilters}>Clear All Filters</Button>
            </div>
          ) : (
            <>
              {/* Books Grid */}
              <div className={layoutClasses}>
                {books.map((book) => (
                  <BookCard
                    key={book.id}
                    book={book}
                    variant={selectedLayout}
                  />
                ))}
              </div>

              {/* Loading Indicator */}
              {isLoading && (
                <div className="flex justify-center py-8">
                  <Loader2 className="w-8 h-8 animate-spin text-orange" />
                </div>
              )}

              {/* Observer Target */}
              <div ref={observerTarget} className="h-4" />

              {/* End of Results */}
              {!hasMore && books.length > 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  You've reached the end of the results
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </section>
  );
}
