/**
 * Hero Section Component
 * Two-column layout with sidebar navigation and featured content
 */

'use client';

import {
  HomeIcon,
  BookOpenIcon,
  FolderOpenIcon,
  UserIcon,
  TrendingUpIcon,
  SparklesIcon,
  TagIcon,
  SearchIcon
} from 'lucide-react';
import { cn } from '@kit/ui/utils';
import Image from 'next/image';
import Link from 'next/link';
import { BookCarousel } from './book-carousel';
import { GridBackground } from './grid-background';
import type { Author, Book } from '../../../../types/bookstore';

const navigationItems = [
  { icon: HomeIcon, label: 'Home', href: '#' },
  { icon: BookOpenIcon, label: 'Books', href: '#books' },
  { icon: FolderOpenIcon, label: 'Categories', href: '#categories' },
  { icon: UserIcon, label: 'Authors', href: '#authors' },
  { icon: TrendingUpIcon, label: 'Bestsellers', href: '#bestsellers' },
  { icon: SparklesIcon, label: 'New Releases', href: '#new-releases' },
  { icon: TagIcon, label: 'Sale', href: '#sale' },
  { icon: SearchIcon, label: 'Browse Books', href: '#browse-books' }
];

interface HeroSectionProps {
  featuredAuthor?: Author | null;
  featuredBooks?: Book[];
}

export function HeroSection({ featuredAuthor, featuredBooks = [] }: HeroSectionProps) {
  return (
    <section className="relative min-h-[80vh] bg-background overflow-hidden">
      <GridBackground />
      <div className="container mx-auto px-4 py-12 relative z-10">
        <div className="flex gap-8">
          {/* Sidebar Navigation - Hidden on mobile/tablet */}
          <aside className="hidden lg:block w-[280px] flex-shrink-0">
            <nav className="sticky top-8 space-y-2">
              {navigationItems.map((item) => (
                <Link
                  key={item.label}
                  href={item.href}
                  className="flex items-center gap-3 px-4 py-3 rounded-lg text-black dark:text-beige hover:bg-beige dark:hover:bg-neutral-800 transition-colors group"
                >
                  <item.icon className="w-5 h-5 text-orange group-hover:scale-110 transition-transform" />
                  <span className="font-medium">{item.label}</span>
                </Link>
              ))}
            </nav>
          </aside>

          {/* Main Content */}
          <div className="flex-1 min-w-0">
            {/* Headline */}
            <div className="mb-12">
              <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-black dark:text-beige leading-tight mb-4">
                Keep the story
                <span className="block text-orange">going..</span>
              </h1>
              <p className="text-xl text-muted-foreground max-w-2xl">
                Discover your next favorite book from our curated collection of
                bestsellers, hidden gems, and timeless classics.
              </p>
            </div>

            {/* Author Profile Card */}
            {featuredAuthor && (
              <div className="mb-12 p-6 bg-white dark:bg-card rounded-2xl shadow-sm border-b-4 border-orange">
                <div className="flex items-start gap-6">
                  <div className="relative w-24 h-24 flex-shrink-0">
                    <Image
                      src={featuredAuthor.avatar}
                      alt={featuredAuthor.name}
                      fill
                      className="rounded-full object-cover"
                      sizes="96px"
                    />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-sm font-semibold text-orange mb-1">
                      Featured Author
                    </h3>
                    <Link href={`/authors/${featuredAuthor.id}`}>
                      <h2 className="text-2xl font-bold text-black dark:text-beige mb-2 hover:text-orange transition-colors cursor-pointer">
                        {featuredAuthor.name}
                      </h2>
                    </Link>
                    <p className="text-muted-foreground mb-4 line-clamp-2">
                      {featuredAuthor.bio}
                    </p>
                    <Link
                      href={`/authors/${featuredAuthor.id}`}
                      className="text-sm font-semibold text-black dark:text-beige hover:text-orange transition-colors inline-flex items-center gap-1"
                    >
                      View all books →
                    </Link>
                  </div>
                </div>
              </div>
            )}

            {/* Featured Books Carousel */}
            {featuredBooks.length > 0 && (
              <div>
                <h2 className="text-2xl font-bold text-black dark:text-beige mb-6">
                  Trending This Week
                </h2>
                <BookCarousel books={featuredBooks} />
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
