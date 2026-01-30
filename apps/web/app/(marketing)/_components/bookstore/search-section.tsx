/**
 * Search Section Component
 * Inline search with filters and real-time results
 */

'use client';

import { useState, useMemo, useEffect } from 'react';
import { Search, SlidersHorizontal, X } from 'lucide-react';
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
import type { Book, Category, Author, SearchFilters, SortOption } from '../../../../types/bookstore';

interface SearchSectionProps {
  books: Book[];
  categories: Category[];
  authors: Author[];
  className?: string;
}

export function SearchSection({
  books,
  categories,
  authors,
  className
}: SearchSectionProps) {
  const [filters, setFilters] = useState<SearchFilters>({
    query: '',
    minPrice: undefined,
    maxPrice: undefined,
    minRating: undefined
  });
  const [sortBy, setSortBy] = useState<SortOption>('relevance');
  const [showFilters, setShowFilters] = useState(false);

  // Debounced search
  const [debouncedQuery, setDebouncedQuery] = useState(filters.query);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(filters.query);
    }, 300);

    return () => clearTimeout(timer);
  }, [filters.query]);

  // Filter and sort books
  const filteredBooks = useMemo(() => {
    let results = books.filter((book) => {
      // Query filter
      const matchesQuery =
        !debouncedQuery ||
        book.title.toLowerCase().includes(debouncedQuery.toLowerCase()) ||
        book.author.name.toLowerCase().includes(debouncedQuery.toLowerCase()) ||
        book.description.toLowerCase().includes(debouncedQuery.toLowerCase());

      // Category filter
      const matchesCategory =
        !filters.category || book.categories.some((c: { id: string }) => c.id === filters.category);

      // Author filter
      const matchesAuthor = !filters.author || book.author.id === filters.author;

      // Price filter
      const matchesPrice =
        (!filters.minPrice || book.price >= filters.minPrice) &&
        (!filters.maxPrice || book.price <= filters.maxPrice);

      // Rating filter
      const matchesRating = !filters.minRating || book.rating >= filters.minRating;

      return (
        matchesQuery &&
        matchesCategory &&
        matchesAuthor &&
        matchesPrice &&
        matchesRating
      );
    });

    // Sort results
    results.sort((a, b) => {
      switch (sortBy) {
        case 'price-low':
          return a.price - b.price;
        case 'price-high':
          return b.price - a.price;
        case 'rating':
          return b.rating - a.rating;
        case 'date-newest':
          return b.publishedDate.getTime() - a.publishedDate.getTime();
        case 'date-oldest':
          return a.publishedDate.getTime() - b.publishedDate.getTime();
        default:
          return 0;
      }
    });

    return results;
  }, [books, debouncedQuery, filters, sortBy]);

  const clearFilters = () => {
    setFilters({
      query: '',
      minPrice: undefined,
      maxPrice: undefined,
      minRating: undefined
    });
    setSortBy('relevance');
  };

  const hasActiveFilters =
    filters.query ||
    filters.category ||
    filters.author ||
    filters.minPrice !== undefined ||
    filters.maxPrice !== undefined ||
    filters.minRating !== undefined;

  return (
    <section
      id="search"
      className={cn('bg-white dark:bg-card rounded-3xl shadow-sm overflow-hidden', className)}
    >
      <div className="container mx-auto px-4 py-12">
        <h2 className="text-3xl font-bold text-black dark:text-beige mb-8">Search Books</h2>

        {/* Search Input */}
        <div className="flex gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search by title, author, or description..."
              value={filters.query}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFilters({ ...filters, query: e.target.value })}
              className="pl-12 h-12 text-base"
            />
          </div>
          <Button
            variant="outline"
            size="icon"
            onClick={() => setShowFilters(!showFilters)}
            className={cn(
              'h-12 w-12',
              showFilters && 'bg-orange text-white hover:bg-orange/90'
            )}
          >
            <SlidersHorizontal className="w-5 h-5" />
          </Button>
        </div>

        {/* Filters */}
        {showFilters && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6 p-6 bg-beige-light dark:bg-neutral-800 rounded-lg">
            <div>
              <label className="block text-sm font-medium text-black dark:text-beige mb-2">
                Category
              </label>
              <Select
                value={filters.category || 'all'}
                onValueChange={(value: string) =>
                  setFilters({
                    ...filters,
                    category: value === 'all' ? undefined : value
                  })
                }
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

            <div>
              <label className="block text-sm font-medium text-black dark:text-beige mb-2">
                Author
              </label>
              <Select
                value={filters.author || 'all'}
                onValueChange={(value: string) =>
                  setFilters({
                    ...filters,
                    author: value === 'all' ? undefined : value
                  })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="All Authors" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Authors</SelectItem>
                  {authors.map((author) => (
                    <SelectItem key={author.id} value={author.id}>
                      {author.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="block text-sm font-medium text-black dark:text-beige mb-2">
                Min Price
              </label>
              <Input
                type="number"
                placeholder="No minimum"
                value={filters.minPrice ?? ''}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setFilters({
                    ...filters,
                    minPrice: e.target.value ? parseFloat(e.target.value) : undefined
                  })
                }
                min="0"
                step="0.01"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-black dark:text-beige mb-2">
                Max Price
              </label>
              <Input
                type="number"
                placeholder="No maximum"
                value={filters.maxPrice ?? ''}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setFilters({
                    ...filters,
                    maxPrice: e.target.value ? parseFloat(e.target.value) : undefined
                  })
                }
                min="0"
                step="0.01"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-black dark:text-beige mb-2">
                Min Rating
              </label>
              <Select
                value={filters.minRating?.toString() || 'all'}
                onValueChange={(value: string) =>
                  setFilters({
                    ...filters,
                    minRating: value === 'all' ? undefined : parseFloat(value)
                  })
                }
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

            <div>
              <label className="block text-sm font-medium text-black dark:text-beige mb-2">
                Sort By
              </label>
              <Select value={sortBy} onValueChange={(value: string) => setSortBy(value as SortOption)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="relevance">Relevance</SelectItem>
                  <SelectItem value="price-low">Price: Low to High</SelectItem>
                  <SelectItem value="price-high">Price: High to Low</SelectItem>
                  <SelectItem value="rating">Highest Rated</SelectItem>
                  <SelectItem value="date-newest">Newest First</SelectItem>
                  <SelectItem value="date-oldest">Oldest First</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-end">
              <Button
                variant="outline"
                onClick={clearFilters}
                disabled={!hasActiveFilters}
                className="w-full"
              >
                <X className="w-4 h-4 mr-2" />
                Clear Filters
              </Button>
            </div>
          </div>
        )}

        {/* Active Filters Badges */}
        {hasActiveFilters && (
          <div className="flex flex-wrap gap-2 mb-6">
            {filters.query && (
              <Badge variant="secondary" className="gap-1">
                Search: "{filters.query}"
                <button
                  onClick={() => setFilters({ ...filters, query: '' })}
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
                  onClick={() => setFilters({ ...filters, category: undefined })}
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
                  onClick={() => setFilters({ ...filters, author: undefined })}
                  className="ml-1 hover:text-black dark:hover:text-beige"
                >
                  <X className="w-3 h-3" />
                </button>
              </Badge>
            )}
          </div>
        )}

        {/* Results */}
        <div>
          <div className="flex items-center justify-between mb-6">
            <p className="text-muted-foreground">
              {filteredBooks.length === books.length
                ? `Showing all ${books.length} books`
                : `Found ${filteredBooks.length} of ${books.length} books`}
            </p>
          </div>

          {filteredBooks.length === 0 ? (
            <div className="text-center py-16">
              <Search className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-xl font-semibold text-black dark:text-beige mb-2">
                No books found
              </h3>
              <p className="text-muted-foreground mb-6">
                Try adjusting your search or filters
              </p>
              <Button onClick={clearFilters}>Clear All Filters</Button>
            </div>
          ) : (
            <div
              className={cn(
                'grid gap-6',
                'grid-cols-2',
                'md:grid-cols-3',
                'lg:grid-cols-4',
                'xl:grid-cols-5'
              )}
            >
              {filteredBooks.map((book) => (
                <BookCard key={book.id} book={book} variant="default" />
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
