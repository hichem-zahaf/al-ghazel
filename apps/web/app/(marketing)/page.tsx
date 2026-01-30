/**
 * Bookstore Marketing Page
 * Immersive bookstore website with horizontal scrolling sections
 */

'use client';

import { HeroSection } from './_components/bookstore/hero-section';
import { CategoryCarousel } from './_components/bookstore/category-carousel';
import { BookOfTheDay } from './_components/bookstore/book-of-day';
import { AuthorOfTheDay } from './_components/bookstore/author-of-day';
import { RecommendedBooks } from './_components/bookstore/recommended-books';
import { ForYouSection } from './_components/bookstore/for-you-section';
import { SearchSection } from './_components/bookstore/search-section';
import { BookRoulette } from './_components/bookstore/book-roulette';
import { mockBooks, bookOfTheDay, authorOfTheDay } from '../../data/mock-books';
import { mockCategories } from '../../data/mock-categories';
import { mockAuthors } from '../../data/mock-authors';

function BookstoreHome() {
  // Get different book sets for each section
  const trendingBooks = mockBooks.slice(0, 6);
  const recommendedBooks = mockBooks.slice(6, 12);
  const forYouBooks = mockBooks.slice(12, 24);
  const rouletteBooks = mockBooks.slice(0, 8);

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <HeroSection />

      {/* Main Content */}
      <div className="flex flex-col space-y-24 py-12">
        {/* Categories */}
        <section id="categories" className="container mx-auto px-4">
          <CategoryCarousel
            categories={mockCategories}
            title="Browse by Category"
          />
        </section>

        {/* Book of the Day */}
        <section id="book-of-the-day" className="container mx-auto px-4">
          <BookOfTheDay featured={bookOfTheDay} />
        </section>

        {/* Author of the Day */}
        <section id="authors" className="container mx-auto px-4">
          <AuthorOfTheDay featured={authorOfTheDay} />
        </section>

        {/* Recommended Books */}
        <section id="bestsellers" className="container mx-auto px-4">
          <RecommendedBooks books={recommendedBooks} />
        </section>

        {/* For You Section */}
        <section id="new-releases" className="container mx-auto px-4">
          <ForYouSection books={forYouBooks} />
        </section>

        {/* Book Roulette */}
        <section id="sale" className="container mx-auto px-4">
          <BookRoulette books={rouletteBooks} />
        </section>

        {/* Search Section */}
        <section className="container mx-auto px-4">
          <SearchSection
            books={mockBooks}
            categories={mockCategories}
            authors={mockAuthors}
          />
        </section>
      </div>
    </div>
  );
}

export default BookstoreHome;
