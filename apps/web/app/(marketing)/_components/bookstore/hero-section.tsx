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
  TagIcon
} from 'lucide-react';
import { cn } from '@kit/ui/utils';
import Image from 'next/image';
import Link from 'next/link';
import { mockBooks } from '../../../../data/mock-books';
import { mockAuthors } from '../../../../data/mock-authors';
import { BookCarousel } from './book-carousel';

const navigationItems = [
  { icon: HomeIcon, label: 'Home', href: '#' },
  { icon: BookOpenIcon, label: 'Books', href: '#books' },
  { icon: FolderOpenIcon, label: 'Categories', href: '#categories' },
  { icon: UserIcon, label: 'Authors', href: '#authors' },
  { icon: TrendingUpIcon, label: 'Bestsellers', href: '#bestsellers' },
  { icon: SparklesIcon, label: 'New Releases', href: '#new-releases' },
  { icon: TagIcon, label: 'Sale', href: '#sale' }
];

export function HeroSection() {
  const featuredAuthor = mockAuthors[0]!;
  const featuredBooks = mockBooks.slice(0, 6);

  return (
    <section className="relative min-h-[80vh] bg-beige-light">
      <div className="container mx-auto px-4 py-12">
        <div className="flex gap-8">
          {/* Sidebar Navigation - Hidden on mobile/tablet */}
          <aside className="hidden lg:block w-[280px] flex-shrink-0">
            <nav className="sticky top-8 space-y-2">
              {navigationItems.map((item) => (
                <Link
                  key={item.label}
                  href={item.href}
                  className="flex items-center gap-3 px-4 py-3 rounded-lg text-black hover:bg-beige transition-colors group"
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
              <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-black leading-tight mb-4">
                Keep the story
                <span className="block text-orange">going..</span>
              </h1>
              <p className="text-xl text-muted-foreground max-w-2xl">
                Discover your next favorite book from our curated collection of
                bestsellers, hidden gems, and timeless classics.
              </p>
            </div>

            {/* Author Profile Card */}
            <div className="mb-12 p-6 bg-white rounded-2xl shadow-sm">
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
                  <h2 className="text-2xl font-bold text-black mb-2">
                    {featuredAuthor.name}
                  </h2>
                  <p className="text-muted-foreground mb-4 line-clamp-2">
                    {featuredAuthor.bio}
                  </p>
                  <Link
                    href="#"
                    className="text-sm font-semibold text-black hover:text-orange transition-colors inline-flex items-center gap-1"
                  >
                    View all books →
                  </Link>
                </div>
              </div>
            </div>

            {/* Featured Books Carousel */}
            <div>
              <h2 className="text-2xl font-bold text-black mb-6">
                Trending This Week
              </h2>
              <BookCarousel books={featuredBooks} />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
