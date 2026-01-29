/**
 * Search Modal Component
 * Floating centered search box with blur overlay and swipeable book cards
 */

'use client';

import { useState, useEffect, useRef } from 'react';
import { Search, X } from 'lucide-react';
import { cn } from '@kit/ui/utils';
import { Button } from '@kit/ui/button';
import { Input } from '@kit/ui/input';
import { BookCard } from './book-card';
import type { Book, Category, Author } from '../../../../types/bookstore';

interface SearchModalProps {
  books: Book[];
  categories: Category[];
  authors: Author[];
  isOpen: boolean;
  onClose: () => void;
}

export function SearchModal({
  books,
  categories,
  authors,
  isOpen,
  onClose
}: SearchModalProps) {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const modalRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Filter books based on query
  const filteredBooks = books.filter((book) => {
    if (!query.trim()) return [];
    const searchLower = query.toLowerCase();
    return (
      book.title.toLowerCase().includes(searchLower) ||
      book.author.name.toLowerCase().includes(searchLower) ||
      book.description.toLowerCase().includes(searchLower) ||
      book.categories.some((cat) => cat.name.toLowerCase().includes(searchLower))
    );
  });

  // Reset index when query changes
  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  // Focus input when opened
  useEffect(() => {
    if (isOpen) {
      inputRef.current?.focus();
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen || filteredBooks.length === 0) return;

      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          setSelectedIndex((prev) =>
            prev < filteredBooks.length - 1 ? prev + 1 : 0
          );
          break;
        case 'ArrowUp':
          e.preventDefault();
          setSelectedIndex((prev) =>
            prev > 0 ? prev - 1 : filteredBooks.length - 1
          );
          break;
        case 'Escape':
          onClose();
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, filteredBooks.length, onClose]);

  // Handle backdrop click
  useEffect(() => {
    const handleBackdropClick = (e: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleBackdropClick);
      return () => document.removeEventListener('mousedown', handleBackdropClick);
    }
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-24 sm:pt-32">
      {/* Blur backdrop */}
      <div
        className="fixed inset-0 bg-black/30 backdrop-blur-sm transition-opacity duration-300"
        onClick={onClose}
      />

      {/* Modal content */}
      <div
        ref={modalRef}
        className="relative w-full max-w-2xl mx-4 animate-in fade-in slide-in-from-top-4 duration-300"
      >
        {/* Search box */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl overflow-hidden">
          <div className="flex items-center gap-3 p-4 border-b border-border/50">
            <Search className="w-5 h-5 text-muted-foreground flex-shrink-0" />
            <Input
              ref={inputRef}
              type="text"
              placeholder="Search books, authors, or categories..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="flex-1 border-0 focus-visible:ring-0 focus-visible:ring-offset-0 text-base"
            />
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="flex-shrink-0"
            >
              <X className="w-5 h-5" />
            </Button>
          </div>

          {/* Results section */}
          <div className="max-h-[60vh] overflow-y-auto">
            {!query.trim() ? (
              <div className="p-8 text-center">
                <Search className="w-16 h-16 mx-auto text-muted-foreground/50 mb-4" />
                <p className="text-muted-foreground">
                  Start typing to search books...
                </p>
              </div>
            ) : filteredBooks.length === 0 ? (
              <div className="p-8 text-center">
                <p className="text-muted-foreground mb-2">No books found</p>
                <p className="text-sm text-muted-foreground">
                  Try searching for something else
                </p>
              </div>
            ) : (
              <div className="p-4">
                <p className="text-sm text-muted-foreground mb-4 px-2">
                  {filteredBooks.length} {filteredBooks.length === 1 ? 'result' : 'results'} found
                </p>
                <div className="space-y-2">
                  {filteredBooks.map((book, index) => (
                    <div
                      key={book.id}
                      className={cn(
                        'transform transition-all duration-300 ease-out cursor-pointer',
                        'rounded-xl hover:bg-beige-light dark:hover:bg-gray-800',
                        selectedIndex === index
                          ? 'bg-beige-light dark:bg-gray-800 scale-[1.02] shadow-md'
                          : index > selectedIndex
                          ? 'translate-x-4 opacity-50'
                          : '-translate-x-4 opacity-50',
                        'hover:opacity-100 hover:translate-x-0'
                      )}
                      onClick={() => {
                        // Handle book selection
                        window.location.href = `#book-${book.id}`;
                        onClose();
                      }}
                      onMouseEnter={() => setSelectedIndex(index)}
                    >
                      <div className="flex gap-4 p-3">
                        <div className="relative w-16 h-24 flex-shrink-0 rounded-lg overflow-hidden bg-beige">
                          <img
                            src={book.coverImage}
                            alt={book.title}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-semibold text-black dark:text-white line-clamp-1 mb-1">
                            {book.title}
                          </h4>
                          <p className="text-sm text-muted-foreground mb-2">
                            {book.author.name}
                          </p>
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-bold text-orange text-sm">
                              ${book.price.toFixed(2)}
                            </span>
                            {book.categories.slice(0, 2).map((category) => (
                              <span
                                key={category.id}
                                className="text-xs px-2 py-0.5 bg-secondary rounded-full"
                              >
                                {category.name}
                              </span>
                            ))}
                          </div>
                        </div>
                        <div className="flex items-center justify-center">
                          <div
                            className={cn(
                              'w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all duration-300',
                              selectedIndex === index
                                ? 'border-orange bg-orange text-white scale-110'
                                : 'border-border opacity-0'
                            )}
                          >
                            <Search className="w-4 h-4" />
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
