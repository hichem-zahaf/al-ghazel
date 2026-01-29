/**
 * Book Roulette Component
 * Spinning wheel with random book selection
 */

'use client';

import { useState, useEffect } from 'react';
import { Sparkles, X } from 'lucide-react';
import { cn } from '@kit/ui/utils';
import { Button } from '@kit/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle
} from '@kit/ui/dialog';
import Image from 'next/image';
import type { Book } from '../../../../types/bookstore';

interface BookRouletteProps {
  books: Book[];
  className?: string;
}

const ROULETTE_COLORS = [
  '#FA8112', // Orange
  '#F5E7C6', // Beige
  '#FAF3E1', // Light beige
  '#E8D5B5', // Darker beige
  '#FFB347', // Light orange
  '#FFE5B4'  // Peach
];

export function BookRoulette({ books, className }: BookRouletteProps) {
  const [isSpinning, setIsSpinning] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);
  const [showConfetti, setShowConfetti] = useState(false);

  // Select a random book
  const spinWheel = () => {
    if (isSpinning || books.length === 0) return;

    setIsSpinning(true);
    setSelectedBook(null);
    setShowConfetti(false);

    // Random number of full rotations (3-5) plus random segment
    const fullRotations = 360 * (3 + Math.floor(Math.random() * 3));
    const segmentAngle = 360 / books.length;
    const randomSegment = Math.floor(Math.random() * books.length);
    const segmentRotation = randomSegment * segmentAngle;

    // Add offset to center the segment
    const finalRotation = fullRotations + segmentRotation + segmentAngle / 2;

    setRotation(finalRotation);

    // Show result after animation
    setTimeout(() => {
      setSelectedBook(books[randomSegment] ?? null);
      setIsSpinning(false);
      setShowConfetti(true);
    }, 3000);
  };

  const closeModal = () => {
    setSelectedBook(null);
    setShowConfetti(false);
  };

  // Create wheel segments
  const wheelSegments = books.slice(0, 8).map((book, index) => {
    const angle = (360 / books.length) * index;
    const color = ROULETTE_COLORS[index % ROULETTE_COLORS.length];

    return {
      book,
      angle,
      color
    };
  });

  return (
    <section
      className={cn(
        'bg-gradient-to-br from-orange/10 to-beige-light rounded-3xl overflow-hidden',
        className
      )}
    >
      <div className="container mx-auto px-4 py-16 text-center">
        <div className="mb-8">
          <h2 className="text-4xl font-bold text-black mb-4">
            Book Roulette 🎰
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Feeling adventurous? Spin the wheel and discover your next random
            read! You might find a hidden gem.
          </p>
        </div>

        {/* Wheel */}
        <div className="relative max-w-md mx-auto mb-8">
          {/* Pointer */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-2 z-10">
            <div className="w-0 h-0 border-l-[15px] border-r-[15px] border-t-[25px] border-l-transparent border-r-transparent border-t-black" />
          </div>

          {/* Spinning Wheel */}
          <div
            className={cn(
              'relative w-80 h-80 mx-auto rounded-full shadow-2xl overflow-hidden transition-transform duration-[3000ms] ease-out',
              isSpinning && 'animate-none'
            )}
            style={{
              transform: `rotate(${rotation}deg)`,
              transition: isSpinning ? 'transform 3000ms cubic-bezier(0.17, 0.67, 0.12, 0.99)' : 'none'
            }}
          >
            <svg
              viewBox="0 0 100 100"
              className="w-full h-full"
              style={{
                transform: 'rotate(-90deg)'
              }}
            >
              {wheelSegments.map((segment, index) => {
                const startAngle = (index / wheelSegments.length) * 360;
                const endAngle = ((index + 1) / wheelSegments.length) * 360;

                // Create pie slice path
                const x1 = 50 + 50 * Math.cos((startAngle * Math.PI) / 180);
                const y1 = 50 + 50 * Math.sin((startAngle * Math.PI) / 180);
                const x2 = 50 + 50 * Math.cos((endAngle * Math.PI) / 180);
                const y2 = 50 + 50 * Math.sin((endAngle * Math.PI) / 180);

                const largeArcFlag = endAngle - startAngle > 180 ? 1 : 0;

                const pathData = `M 50 50 L ${x1} ${y1} A 50 50 0 ${largeArcFlag} 1 ${x2} ${y2} Z`;

                // Calculate text position - starting from center and extending outward
                // Position at 65% of the radius (32.5 from center) for better visibility
                const midAngle = startAngle + (endAngle - startAngle) / 2;
                const textRadius = 32.5;
                const textX = 50 + textRadius * Math.cos((midAngle * Math.PI) / 180);
                const textY = 50 + textRadius * Math.sin((midAngle * Math.PI) / 180);

                return (
                  <g key={segment.book.id}>
                    <path d={pathData} fill={segment.color} stroke="#222222" strokeWidth="0.5" />
                    <text
                      x={textX}
                      y={textY}
                      textAnchor="middle"
                      dominantBaseline="middle"
                      fontSize="3.5"
                      fill="#222222"
                      fontWeight="bold"
                      transform={`rotate(${midAngle}, ${textX}, ${textY})`}
                      className="pointer-events-none"
                    >
                      {segment.book.title.substring(0, 12)}...
                    </text>
                  </g>
                );
              })}
            </svg>
          </div>

          {/* Center circle */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 bg-black rounded-full flex items-center justify-center shadow-lg z-10">
            <Sparkles className="w-8 h-8 text-orange" />
          </div>
        </div>

        {/* Spin Button */}
        <Button
          size="lg"
          onClick={spinWheel}
          disabled={isSpinning || books.length === 0}
          className="bg-orange text-white hover:bg-orange/90 text-lg px-12 py-6 h-auto shadow-lg"
        >
          {isSpinning ? (
            <>
              <Sparkles className="w-5 h-5 mr-2 animate-spin" />
              Spinning...
            </>
          ) : (
            <>
              <Sparkles className="w-5 h-5 mr-2" />
              Spin the Wheel!
            </>
          )}
        </Button>

        <p className="text-sm text-muted-foreground mt-4">
          {books.length} books in the wheel
        </p>
      </div>

      {/* Result Modal */}
      <Dialog open={!!selectedBook} onOpenChange={closeModal}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-2xl flex items-center gap-2">
              <Sparkles className="w-6 h-6 text-orange" />
              Your Random Read!
            </DialogTitle>
          </DialogHeader>

          {selectedBook && (
            <div className="relative">
              {/* Confetti Effect */}
              {showConfetti && (
                <div className="absolute inset-0 pointer-events-none overflow-hidden">
                  {[...Array(50)].map((_, i) => (
                    <div
                      key={i}
                      className="absolute animate-confetti"
                      style={{
                        left: `${Math.random() * 100}%`,
                        animationDelay: `${Math.random() * 2}s`,
                        backgroundColor: ROULETTE_COLORS[Math.floor(Math.random() * ROULETTE_COLORS.length)]
                      }}
                    />
                  ))}
                </div>
              )}

              <div className="flex flex-col sm:flex-row gap-6">
                {/* Book Cover */}
                <div className="relative w-40 h-60 flex-shrink-0 mx-auto sm:mx-0">
                  <Image
                    src={selectedBook.coverImage}
                    alt={selectedBook.title}
                    fill
                    className="rounded-lg object-cover shadow-lg"
                    sizes="160px"
                  />
                </div>

                {/* Book Details */}
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-black mb-1">
                    {selectedBook.title}
                  </h3>
                  <p className="text-muted-foreground mb-3">
                    {selectedBook.author.name}
                  </p>

                  <div className="flex items-center gap-3 mb-4">
                    <span className="text-2xl font-bold text-orange">
                      ${selectedBook.price.toFixed(2)}
                    </span>
                    <div className="flex items-center gap-1">
                      <span className="text-yellow-500">★★★★★</span>
                      <span className="text-sm text-muted-foreground">
                        {selectedBook.rating}
                      </span>
                    </div>
                  </div>

                  <p className="text-sm text-muted-foreground line-clamp-3 mb-4">
                    {selectedBook.description}
                  </p>

                  <Button className="w-full bg-orange hover:bg-orange/90">
                    Add to Cart - ${selectedBook.price.toFixed(2)}
                  </Button>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <style jsx>{`
        @keyframes confetti-fall {
          0% {
            transform: translateY(-100%) rotate(0deg);
            opacity: 1;
          }
          100% {
            transform: translateY(100vh) rotate(720deg);
            opacity: 0;
          }
        }

        .animate-confetti {
          position: absolute;
          width: 10px;
          height: 10px;
          animation: confetti-fall 3s ease-out forwards;
        }
      `}</style>
    </section>
  );
}
