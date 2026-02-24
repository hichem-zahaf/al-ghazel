/**
 * Book Detail Component
 * Displays full book information with cover image, details, and recommended books
 */

'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState } from 'react';
import {
  Star,
  ShoppingCart,
  Heart,
  Share2,
  ArrowLeft,
  BookOpen,
  Calendar,
  Globe,
  Building,
  FileText,
  Package,
  ArrowRight,
} from 'lucide-react';
import { cn } from '@kit/ui/utils';
import { Button } from '@kit/ui/button';
import { Badge } from '@kit/ui/badge';
import { Separator } from '@kit/ui/separator';
import { useCartStore } from '~/lib/store/cart-store';
import { triggerAddToCartAnimation, showAddToCartToast, isBookInCart } from '~/lib/utils/cart-utils';
import { BookCard } from '~/(marketing)/_components/bookstore/book-card';
import { CartSheet } from '~/(marketing)/_components/bookstore/cart-sheet';
import type { Book } from '~/types/bookstore';

interface BookDetailProps {
  book: any;
  recommendedBooks: any[];
}

function transformBook(book: any): Book {
  return {
    id: book.id,
    slug: book.slug || '',
    shortId: book.short_id || '',
    title: book.title,
    author: {
      id: book.authors?.id || '',
      name: book.authors?.name || 'Unknown Author',
      avatar: book.authors?.avatar_url || '/images/author-placeholder.jpg',
      bio: book.authors?.bio || '',
    },
    coverImage: book.cover_image_url || '/images/book-placeholder.jpg',
    price: book.price,
    originalPrice: book.original_price ?? undefined,
    discountPercentage: book.discount_percentage ?? undefined,
    description: book.description || '',
    categories:
      book.book_categories?.map((bc: any) => ({
        id: bc.categories.id,
        name: bc.categories.name,
        slug: bc.categories.slug,
        icon: '📚',
        bookCount: 0,
      })) ?? [],
    rating: book.rating || 0,
    publishedDate: new Date(book.published_date || book.created_at),
    isbn: book.isbn || '',
    pages: book.pages || 0,
    language: book.language ?? undefined,
    publisher: book.publisher ?? undefined,
  };
}

export function BookDetail({ book, recommendedBooks }: BookDetailProps) {
  const transformedBook = transformBook(book);
  const [isAdded, setIsAdded] = useState(false);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const addItem = useCartStore((state) => state.addItem);
  const items = useCartStore((state) => state.items);
  const isInCart = isBookInCart(transformedBook.id);

  // Check if this specific book is in cart
  const bookInCart = items.some((item) => item.bookId === transformedBook.id);

  const hasDiscount = transformedBook.originalPrice && transformedBook.originalPrice > transformedBook.price;
  const reviewCount = Math.floor(Math.random() * 400) + 100;

  const handleAddToCart = () => {
    if (bookInCart) {
      // Navigate to cart page
      window.location.href = '/cart';
      return;
    }

    addItem(transformedBook);
    triggerAddToCartAnimation(transformedBook);
    showAddToCartToast(transformedBook);
    setIsAdded(true);
    setTimeout(() => setIsAdded(false), 2000);
  };

  const handleToggleWishlist = () => {
    setIsWishlisted(!isWishlisted);
  };

  const handleShare = async () => {
    if (navigator.share) {
      await navigator.share({
        title: transformedBook.title,
        text: `Check out "${transformedBook.title}" by ${transformedBook.author.name}`,
        url: window.location.href,
      });
    }
  };

  const details = [
    {
      icon: BookOpen,
      label: 'Pages',
      value: transformedBook.pages > 0 ? `${transformedBook.pages} pages` : 'N/A',
    },
    {
      icon: Globe,
      label: 'Language',
      value: transformedBook.language || 'N/A',
    },
    {
      icon: Building,
      label: 'Publisher',
      value: transformedBook.publisher || 'N/A',
    },
    {
      icon: Calendar,
      label: 'Published',
      value: transformedBook.publishedDate.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      }),
    },
    {
      icon: FileText,
      label: 'ISBN',
      value: transformedBook.isbn || 'N/A',
    },
    {
      icon: Package,
      label: 'Format',
      value: book.format || 'Hardcover',
    },
  ];

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Floating Cart Button */}
      <div className="fixed bottom-6 right-6 z-50">
        <button
          onClick={() => setIsCartOpen(true)}
          className="relative flex items-center justify-center w-14 h-14 bg-orange hover:bg-orange/90 text-white rounded-full shadow-lg transition-all hover:scale-110"
          aria-label="Open cart"
        >
          <ShoppingCart className="w-6 h-6" />
          {items.length > 0 && (
            <Badge className="absolute -top-1 -right-1 h-6 min-w-6 flex items-center justify-center p-0 text-xs bg-red-500 text-white border-2 border-orange">
              {items.length > 9 ? '9+' : items.length}
            </Badge>
          )}
        </button>
      </div>

      {/* Cart Sheet */}
      <CartSheet isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />

      {/* Back Button */}
      <div className="container mx-auto px-4 py-6">
        <Link href="/">
          <Button variant="ghost" size="sm" className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back to Home
          </Button>
        </Link>
      </div>

      {/* Main Book Details */}
      <div className="container mx-auto px-4 pb-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12">
          {/* Book Cover */}
          <div className="lg:col-span-1">
            <div className="sticky top-8">
              <div className="relative aspect-[2/3] rounded-2xl overflow-hidden shadow-2xl bg-beige dark:bg-neutral-800">
                <Image
                  src={transformedBook.coverImage}
                  alt={transformedBook.title}
                  fill
                  sizes="(max-width: 768px) 100vw, 33vw"
                  className="object-cover"
                  priority
                />
                {hasDiscount && (
                  <Badge className="absolute top-4 left-4 bg-red-500 text-white text-sm px-3 py-1 shadow-lg">
                    Save {transformedBook.discountPercentage}%
                  </Badge>
                )}
              </div>

              {/* Action Buttons */}
              <div className="mt-6 space-y-3">
                <Button
                  className={cn(
                    'w-full h-14 text-lg font-semibold transition-all duration-300',
                    bookInCart ? 'bg-green-600 hover:bg-green-700' : 'bg-orange hover:bg-orange/90'
                  )}
                  onClick={handleAddToCart}
                >
                  {bookInCart ? (
                    <>
                      Proceed to Checkout
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </>
                  ) : (
                    <>
                      <ShoppingCart className="mr-2 h-5 w-5" />
                      Add to Cart
                    </>
                  )}
                </Button>

                <div className="grid grid-cols-2 gap-3">
                  <Button
                    variant="outline"
                    size="lg"
                    className={cn(
                      'h-12 transition-all duration-300',
                      isWishlisted && 'border-pink-500 text-pink-500 hover:bg-pink-50 dark:hover:bg-pink-950'
                    )}
                    onClick={handleToggleWishlist}
                  >
                    <Heart className={cn('mr-2 h-4 w-4', isWishlisted && 'fill-current')} />
                    {isWishlisted ? 'Saved' : 'Wishlist'}
                  </Button>
                  <Button variant="outline" size="lg" className="h-12" onClick={handleShare}>
                    <Share2 className="mr-2 h-4 w-4" />
                    Share
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Book Info */}
          <div className="lg:col-span-2 space-y-8">
            {/* Title and Author */}
            <div>
              <div className="flex flex-wrap gap-2 mb-4">
                {transformedBook.categories.slice(0, 3).map((category) => (
                  <Link key={category.id} href={`/books?category=${category.slug}`}>
                    <Badge variant="secondary" className="cursor-pointer hover:bg-orange/20 transition-colors">
                      {category.name}
                    </Badge>
                  </Link>
                ))}
              </div>

              <h1 className="text-4xl lg:text-5xl font-bold text-black dark:text-beige mb-3">
                {transformedBook.title}
              </h1>

              <Link
                href={`/authors/${transformedBook.author.id}`}
                className="text-xl text-muted-foreground hover:text-orange transition-colors inline-block"
              >
                by {transformedBook.author.name}
              </Link>

              <div className="flex items-center gap-4 mt-4">
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className={cn(
                        'h-5 w-5',
                        star <= Math.floor(transformedBook.rating)
                          ? 'fill-yellow-400 text-yellow-400'
                          : 'fill-gray-200 text-gray-200 dark:fill-gray-700 dark:text-gray-700'
                      )}
                    />
                  ))}
                  <span className="ml-2 font-semibold">{transformedBook.rating}</span>
                  <span className="text-muted-foreground">({reviewCount} reviews)</span>
                </div>
              </div>
            </div>

            <Separator />

            {/* Price */}
            <div className="flex items-baseline gap-3">
              <span className="text-4xl font-bold text-orange">
                ${transformedBook.price.toFixed(2)}
              </span>
              {hasDiscount && (
                <>
                  <span className="text-xl text-muted-foreground line-through">
                    ${transformedBook.originalPrice?.toFixed(2)}
                  </span>
                  <Badge className="bg-green-500 text-white">
                    You save ${(transformedBook.originalPrice! - transformedBook.price).toFixed(2)}
                  </Badge>
                </>
              )}
            </div>

            <Separator />

            {/* Description */}
            <div>
              <h2 className="text-2xl font-bold text-black dark:text-beige mb-4">About this Book</h2>
              <p className="text-lg text-muted-foreground leading-relaxed">
                {transformedBook.description}
              </p>
            </div>

            <Separator />

            {/* Book Details */}
            <div>
              <h2 className="text-2xl font-bold text-black dark:text-beige mb-4">Product Details</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {details.map((detail) => (
                  <div key={detail.label} className="flex items-start gap-3">
                    <div className="p-2 rounded-lg bg-muted">
                      <detail.icon className="h-5 w-5 text-orange" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">{detail.label}</p>
                      <p className="font-medium">{detail.value}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Author Bio */}
            {transformedBook.author.bio && (
              <>
                <Separator />
                <div>
                  <h2 className="text-2xl font-bold text-black dark:text-beige mb-4">About the Author</h2>
                  <div className="flex gap-4">
                    <div className="relative w-20 h-20 rounded-full overflow-hidden bg-beige dark:bg-neutral-800 flex-shrink-0">
                      <Image
                        src={transformedBook.author.avatar}
                        alt={transformedBook.author.name}
                        fill
                        sizes="80px"
                        className="object-cover"
                      />
                    </div>
                    <div>
                      <Link
                        href={`/authors/${transformedBook.author.id}`}
                        className="text-lg font-semibold hover:text-orange transition-colors"
                      >
                        {transformedBook.author.name}
                      </Link>
                      <p className="text-muted-foreground mt-2">{transformedBook.author.bio}</p>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Recommended Books Section */}
        {recommendedBooks.length > 0 && (
          <div className="mt-16">
            <Separator className="mb-8" />
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-3xl font-bold text-black dark:text-beige">Recommended Books</h2>
                <p className="text-muted-foreground mt-2">You might also like these books</p>
              </div>
              <Link href="/#browse-books">
                <Button variant="outline" size="sm" className="gap-2">
                  View All Books
                  <ArrowLeft className="h-4 w-4 rotate-180" />
                </Button>
              </Link>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {recommendedBooks.slice(0, 6).map((recommendedBook) => (
                <BookCard
                  key={recommendedBook.id}
                  book={transformBook(recommendedBook)}
                  variant="mercury"
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

import React from 'react';
