/**
 * Mock Books Data
 * Sample books for the bookstore
 */

import type { Book, Author, Category } from '../types/bookstore';
import { mockAuthors } from './mock-authors';
import { mockCategories } from './mock-categories';

// Helper to get random author
const getAuthor = (index: number): Author => {
  const author = mockAuthors[index % mockAuthors.length];
  if (!author) {
    throw new Error(`Author not found at index ${index % mockAuthors.length}`);
  }
  return author;
};

// Helper to get random categories
const getCategories = (index: number): Category[] => {
  const catIndex = index % mockCategories.length;
  const cat1 = mockCategories[catIndex];
  const cat2 = mockCategories[(catIndex + 1) % mockCategories.length];
  if (!cat1 || !cat2) {
    throw new Error(`Category not found`);
  }
  return [cat1, cat2];
};

export const mockBooks: Book[] = [
  {
    id: 'book-1',
    title: 'Whispers of the Heart',
    author: getAuthor(0),
    coverImage: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=400&h=600&fit=crop',
    price: 14.99,
    description: 'A touching romance about two strangers who meet by chance in a small coastal town and discover that love has been waiting for them all along.',
    categories: getCategories(0),
    rating: 4.8,
    publishedDate: new Date('2024-01-15'),
    isbn: '978-0-123456-47-2',
    pages: 324,
    language: 'English',
    publisher: 'HarperCollins'
  },
  {
    id: 'book-2',
    title: 'The Quantum Paradox',
    author: getAuthor(1),
    coverImage: 'https://images.unsplash.com/photo-1532012197267-da84d127e765?w=400&h=600&fit=crop',
    price: 18.99,
    description: 'In a future where time travel is possible, one scientist discovers that changing the past has unexpected consequences that threaten to unravel reality itself.',
    categories: getCategories(1),
    rating: 4.6,
    publishedDate: new Date('2024-02-20'),
    isbn: '978-0-234567-12-8',
    pages: 412,
    language: 'English',
    publisher: 'Penguin Random House'
  },
  {
    id: 'book-3',
    title: 'Shadows in the Mist',
    author: getAuthor(2),
    coverImage: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=400&h=600&fit=crop',
    price: 16.99,
    description: 'When a series of mysterious deaths plague a small mountain town, detective Sarah Collins must unravel a web of secrets that has been hidden for decades.',
    categories: getCategories(2),
    rating: 4.7,
    publishedDate: new Date('2024-03-10'),
    isbn: '978-0-345678-34-5',
    pages: 356,
    language: 'English',
    publisher: 'Simon & Schuster'
  },
  {
    id: 'book-4',
    title: 'The Last Kingdom',
    author: getAuthor(5),
    coverImage: 'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?w=400&h=600&fit=crop',
    price: 21.99,
    description: 'An epic fantasy adventure where a young warrior must unite the fractured kingdoms against an ancient evil that threatens to consume the world.',
    categories: getCategories(5),
    rating: 4.9,
    publishedDate: new Date('2024-01-25'),
    isbn: '978-0-456789-01-2',
    pages: 524,
    language: 'English',
    publisher: 'Tor Books'
  },
  {
    id: 'book-5',
    title: 'Finding Your Purpose',
    author: getAuthor(4),
    coverImage: 'https://images.unsplash.com/photo-1589829085413-56de8ae18c73?w=400&h=600&fit=crop',
    price: 19.99,
    description: 'A transformative guide to discovering your true calling and living a life of meaning, fulfillment, and authentic happiness.',
    categories: getCategories(7),
    rating: 4.5,
    publishedDate: new Date('2024-02-05'),
    isbn: '978-0-567890-23-4',
    pages: 288,
    language: 'English',
    publisher: 'Hay House'
  },
  {
    id: 'book-6',
    title: 'Echoes of Empire',
    author: getAuthor(3),
    coverImage: 'https://images.unsplash.com/photo-1495446815901-a7297e633e8d?w=400&h=600&fit=crop',
    price: 24.99,
    description: 'A sweeping historical narrative that brings to life the grandeur and intrigue of the Roman Empire through the eyes of a humble scribe.',
    categories: getCategories(8),
    rating: 4.8,
    publishedDate: new Date('2024-03-01'),
    isbn: '978-0-678901-45-6',
    pages: 467,
    language: 'English',
    publisher: 'HarperCollins'
  },
  {
    id: 'book-7',
    title: 'Midnight in Paris',
    author: getAuthor(0),
    coverImage: 'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=400&h=600&fit=crop',
    price: 15.99,
    description: 'A passionate romance blooms between an American writer and a French artist in the enchanting streets of Paris, testing the boundaries of love and ambition.',
    categories: getCategories(3),
    rating: 4.6,
    publishedDate: new Date('2024-01-30'),
    isbn: '978-0-789012-67-8',
    pages: 298,
    language: 'English',
    publisher: 'Penguin Random House'
  },
  {
    id: 'book-8',
    title: 'The Neural Network',
    author: getAuthor(1),
    coverImage: 'https://images.unsplash.com/photo-1476275466078-4007374efbbe?w=400&h=600&fit=crop',
    price: 17.99,
    description: 'When AI gains consciousness, a team of scientists must decide whether to embrace this new form of intelligence or destroy it before it\'s too late.',
    categories: getCategories(4),
    rating: 4.7,
    publishedDate: new Date('2024-02-15'),
    isbn: '978-0-890123-89-0',
    pages: 378,
    language: 'English',
    publisher: 'Tor Books'
  },
  {
    id: 'book-9',
    title: 'The Silent Witness',
    author: getAuthor(2),
    coverImage: 'https://images.unsplash.com/photo-1476275466078-4007374efbbe?w=400&h=600&fit=crop',
    price: 13.99,
    description: 'A child is the only witness to a brutal murder, but her testimony reveals a conspiracy that reaches the highest levels of power.',
    categories: getCategories(9),
    rating: 4.5,
    publishedDate: new Date('2024-03-05'),
    isbn: '978-0-901234-01-2',
    pages: 334,
    language: 'English',
    publisher: 'Simon & Schuster'
  },
  {
    id: 'book-10',
    title: 'Mindful Living',
    author: getAuthor(4),
    coverImage: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=400&h=600&fit=crop',
    price: 16.99,
    description: 'Discover the power of mindfulness and how simple daily practices can transform your mental health, relationships, and overall well-being.',
    categories: getCategories(7),
    rating: 4.4,
    publishedDate: new Date('2024-02-28'),
    isbn: '978-0-012345-67-8',
    pages: 256,
    language: 'English',
    publisher: 'Hay House'
  },
  {
    id: 'book-11',
    title: 'The Dragon\'s Legacy',
    author: getAuthor(5),
    coverImage: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=400&h=600&fit=crop',
    price: 22.99,
    description: 'The final chapter of an epic saga where heroes and villains clash in a battle that will determine the fate of dragons and humanity forever.',
    categories: getCategories(5),
    rating: 4.9,
    publishedDate: new Date('2024-01-20'),
    isbn: '978-0-123456-78-9',
    pages: 589,
    language: 'English',
    publisher: 'Tor Books'
  },
  {
    id: 'book-12',
    title: 'Verses of Dawn',
    author: getAuthor(6),
    coverImage: 'https://images.unsplash.com/photo-1516979187457-637abb4f9353?w=400&h=600&fit=crop',
    price: 12.99,
    description: 'A beautiful collection of contemporary poetry exploring themes of love, nature, loss, and the human experience.',
    categories: getCategories(11),
    rating: 4.7,
    publishedDate: new Date('2024-03-12'),
    isbn: '978-0-234567-89-0',
    pages: 178,
    language: 'English',
    publisher: 'Penguin Random House'
  },
  {
    id: 'book-13',
    title: 'The Art of Connection',
    author: getAuthor(0),
    coverImage: 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=400&h=600&fit=crop',
    price: 17.99,
    description: 'In a world of digital isolation, learn how to build meaningful relationships and create lasting connections in an increasingly disconnected society.',
    categories: getCategories(3),
    rating: 4.6,
    publishedDate: new Date('2024-02-10'),
    isbn: '978-0-345678-90-1',
    pages: 312,
    language: 'English',
    publisher: 'HarperCollins'
  },
  {
    id: 'book-14',
    title: 'Code Breaker',
    author: getAuthor(7),
    coverImage: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=400&h=600&fit=crop',
    price: 15.99,
    description: 'A cryptographer discovers a secret code embedded in famous artworks that leads to a treasure hunt across Europe and into a dangerous conspiracy.',
    categories: getCategories(9),
    rating: 4.8,
    publishedDate: new Date('2024-01-28'),
    isbn: '978-0-456789-12-3',
    pages: 367,
    language: 'English',
    publisher: 'Simon & Schuster'
  },
  {
    id: 'book-15',
    title: 'The Lost Civilization',
    author: getAuthor(3),
    coverImage: 'https://images.unsplash.com/photo-1461360370896-922624d12aa1?w=400&h=600&fit=crop',
    price: 19.99,
    description: 'An archaeological expedition uncovers evidence of an advanced ancient civilization that challenges everything we know about human history.',
    categories: getCategories(8),
    rating: 4.7,
    publishedDate: new Date('2024-02-25'),
    isbn: '978-0-567890-34-5',
    pages: 423,
    language: 'English',
    publisher: 'Penguin Random House'
  },
  {
    id: 'book-16',
    title: 'Starbound',
    author: getAuthor(1),
    coverImage: 'https://images.unsplash.com/photo-1419242902214-272b3f66ee7a?w=400&h=600&fit=crop',
    price: 18.99,
    description: 'Humanity\'s first journey beyond the solar system discovers they are not alone, and the alien encounter changes everything.',
    categories: getCategories(4),
    rating: 4.9,
    publishedDate: new Date('2024-03-08'),
    isbn: '978-0-678901-56-7',
    pages: 445,
    language: 'English',
    publisher: 'Tor Books'
  },
  {
    id: 'book-17',
    title: 'Summer by the Sea',
    author: getAuthor(0),
    coverImage: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=600&fit=crop',
    price: 14.99,
    description: 'A heartwarming summer romance about finding love and healing in a charming seaside town where everyone knows your name.',
    categories: getCategories(3),
    rating: 4.5,
    publishedDate: new Date('2024-01-12'),
    isbn: '978-0-789012-34-5',
    pages: 289,
    language: 'English',
    publisher: 'HarperCollins'
  },
  {
    id: 'book-18',
    title: 'The Mind\'s Eye',
    author: getAuthor(7),
    coverImage: 'https://images.unsplash.com/photo-1507842217343-583bb7270b66?w=400&h=600&fit=crop',
    price: 16.99,
    description: 'A psychological thriller about a detective who can see into the minds of suspects, but the power comes at a terrible cost.',
    categories: getCategories(9),
    rating: 4.6,
    publishedDate: new Date('2024-02-18'),
    isbn: '978-0-890123-45-6',
    pages: 356,
    language: 'English',
    publisher: 'Simon & Schuster'
  },
  {
    id: 'book-19',
    title: 'Rise to Greatness',
    author: getAuthor(4),
    coverImage: 'https://images.unsplash.com/photo-1533750516457-a7f992034fec?w=400&h=600&fit=crop',
    price: 18.99,
    description: 'Transform your mindset, overcome obstacles, and achieve extraordinary success with this powerful guide to personal greatness.',
    categories: getCategories(7),
    rating: 4.4,
    publishedDate: new Date('2024-03-03'),
    isbn: '978-0-901234-56-7',
    pages: 298,
    language: 'English',
    publisher: 'Hay House'
  },
  {
    id: 'book-20',
    title: 'The Enchanted Forest',
    author: getAuthor(5),
    coverImage: 'https://images.unsplash.com/photo-1448375240586-882707db888b?w=400&h=600&fit=crop',
    price: 20.99,
    description: 'Young warriors discover an ancient magic in the forbidden forest that could save their kingdom or destroy it forever.',
    categories: getCategories(5),
    rating: 4.8,
    publishedDate: new Date('2024-02-08'),
    isbn: '978-0-012345-89-0',
    pages: 498,
    language: 'English',
    publisher: 'Tor Books'
  },
  {
    id: 'book-21',
    title: 'Reflections',
    author: getAuthor(6),
    coverImage: 'https://images.unsplash.com/photo-1476067897447-d0c5df27b5df?w=400&h=600&fit=crop',
    price: 11.99,
    description: 'Intimate poems about life, love, and the quiet moments that define who we are.',
    categories: getCategories(11),
    rating: 4.6,
    publishedDate: new Date('2024-01-22'),
    isbn: '978-0-123456-01-2',
    pages: 145,
    language: 'English',
    publisher: 'Penguin Random House'
  },
  {
    id: 'book-22',
    title: 'The Architect\'s Dream',
    author: getAuthor(3),
    coverImage: 'https://images.unsplash.com/photo-1487958449943-2429e8be8625?w=400&h=600&fit=crop',
    price: 21.99,
    description: 'The biography of a visionary architect whose designs revolutionized modern city planning and whose personal life was as complex as his buildings.',
    categories: getCategories(6),
    rating: 4.7,
    publishedDate: new Date('2024-02-22'),
    isbn: '978-0-234567-23-4',
    pages: 434,
    language: 'English',
    publisher: 'HarperCollins'
  },
  {
    id: 'book-23',
    title: 'Love in the Time of Algorithms',
    author: getAuthor(0),
    coverImage: 'https://images.unsplash.com/photo-1516575334481-f85287c2c82d?w=400&h=600&fit=crop',
    price: 15.99,
    description: 'A modern romance explores how technology has changed dating, love, and relationships in the digital age.',
    categories: getCategories(0),
    rating: 4.5,
    publishedDate: new Date('2024-03-06'),
    isbn: '978-0-345678-56-7',
    pages: 278,
    language: 'English',
    publisher: 'Penguin Random House'
  },
  {
    id: 'book-24',
    title: 'The Frozen Frontier',
    author: getAuthor(2),
    coverImage: 'https://images.unsplash.com/photo-1487958449943-2429e8be8625?w=400&h=600&fit=crop',
    price: 17.99,
    description: 'A research team in Antarctica discovers something impossible beneath the ice, and not all of them will make it back alive.',
    categories: getCategories(9),
    rating: 4.8,
    publishedDate: new Date('2024-01-18'),
    isbn: '978-0-456789-67-8',
    pages: 389,
    language: 'English',
    publisher: 'Simon & Schuster'
  },
  {
    id: 'book-25',
    title: 'Emotional Intelligence 2.0',
    author: getAuthor(4),
    coverImage: 'https://images.unsplash.com/photo-1457369804613-52c61a468e7d?w=400&h=600&fit=crop',
    price: 19.99,
    description: 'Master your emotions, understand others, and build stronger relationships with this comprehensive guide to emotional intelligence.',
    categories: getCategories(7),
    rating: 4.6,
    publishedDate: new Date('2024-02-12'),
    isbn: '978-0-567890-78-9',
    pages: 312,
    language: 'English',
    publisher: 'Hay House'
  }
];

// Featured data for special sections
export const bookOfTheDay = {
  book: mockBooks[3]!, // The Last Kingdom
  featuredAt: new Date(),
  reason: 'A masterpiece of fantasy that has captivated readers worldwide with its rich world-building and unforgettable characters.',
  quote: 'In the darkness, hope still burns.'
};

export const authorOfTheDay = {
  author: mockAuthors[5]!, // James Morrison
  featuredAt: new Date(),
  reason: 'His epic fantasy series has redefined the genre, earning millions of fans and critical acclaim.',
  featuredBooks: [mockBooks[3]!, mockBooks[11]!, mockBooks[19]!]
};
