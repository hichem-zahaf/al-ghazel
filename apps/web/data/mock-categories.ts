/**
 * Mock Categories Data
 * Sample book categories for the bookstore
 */

import type { Category } from '../types/bookstore';

export const mockCategories: Category[] = [
  {
    id: 'cat-1',
    name: 'Fiction',
    slug: 'fiction',
    icon: '📚',
    bookCount: 342,
    description: 'Explore imaginary worlds and stories'
  },
  {
    id: 'cat-2',
    name: 'Non-Fiction',
    slug: 'non-fiction',
    icon: '📖',
    bookCount: 256,
    description: 'Real stories and factual information'
  },
  {
    id: 'cat-3',
    name: 'Mystery',
    slug: 'mystery',
    icon: '🔍',
    bookCount: 189,
    description: 'Suspenseful puzzles and thrillers'
  },
  {
    id: 'cat-4',
    name: 'Romance',
    slug: 'romance',
    icon: '💕',
    bookCount: 234,
    description: 'Love stories and relationships'
  },
  {
    id: 'cat-5',
    name: 'Science Fiction',
    slug: 'sci-fi',
    icon: '🚀',
    bookCount: 178,
    description: 'Futuristic worlds and technology'
  },
  {
    id: 'cat-6',
    name: 'Fantasy',
    slug: 'fantasy',
    icon: '🐉',
    bookCount: 267,
    description: 'Magical worlds and mythical creatures'
  },
  {
    id: 'cat-7',
    name: 'Biography',
    slug: 'biography',
    icon: '👤',
    bookCount: 145,
    description: 'Life stories of remarkable people'
  },
  {
    id: 'cat-8',
    name: 'Self-Help',
    slug: 'self-help',
    icon: '💡',
    bookCount: 198,
    description: 'Personal development and growth'
  },
  {
    id: 'cat-9',
    name: 'History',
    slug: 'history',
    icon: '🏛️',
    bookCount: 167,
    description: 'Events and stories from the past'
  },
  {
    id: 'cat-10',
    name: 'Thriller',
    slug: 'thriller',
    icon: '⚡',
    bookCount: 201,
    description: 'Heart-pounding suspense'
  },
  {
    id: 'cat-11',
    name: 'Children',
    slug: 'children',
    icon: '🧒',
    bookCount: 289,
    description: 'Books for young readers'
  },
  {
    id: 'cat-12',
    name: 'Poetry',
    slug: 'poetry',
    icon: '✨',
    bookCount: 112,
    description: 'Beautiful verses and prose'
  }
];
