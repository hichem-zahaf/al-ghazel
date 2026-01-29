/**
 * Book Discovery Modal Component
 * Tinder-style book discovery with swipeable cards
 */

'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { X, Heart, X as XIcon, Info, Star, BookOpen, Tag, DollarSign } from 'lucide-react';
import { cn } from '@kit/ui/utils';
import { Button } from '@kit/ui/button';
import { Badge } from '@kit/ui/badge';
import type { Book } from '../../../../types/bookstore';

interface BookDiscoveryModalProps {
  books: Book[];
  isOpen: boolean;
  onClose: () => void;
}

interface SwipeState {
  startX: number;
  currentX: number;
  isDragging: boolean;
}

export function BookDiscoveryModal({ books, isOpen, onClose }: BookDiscoveryModalProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showInfo, setShowInfo] = useState(false);
  const [swipeState, setSwipeState] = useState<SwipeState>({
    startX: 0,
    currentX: 0,
    isDragging: false
  });
  const cardRef = useRef<HTMLDivElement>(null);

  const currentBook = books[currentIndex];

  // Reset state when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
      setCurrentIndex(0);
      setShowInfo(false);
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;

      switch (e.key) {
        case 'ArrowLeft':
          handleSwipe('left');
          break;
        case 'ArrowRight':
          handleSwipe('right');
          break;
        case 'Escape':
          onClose();
          break;
        case 'i':
        case 'I':
          setShowInfo((prev) => !prev);
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const getCurrentRotation = useCallback(() => {
    const delta = swipeState.currentX - swipeState.startX;
    return delta * 0.1; // Rotation based on swipe distance
  }, [swipeState]);

  const handleSwipe = (direction: 'left' | 'right') => {
    // Animate card out
    const card = cardRef.current;
    if (!card) return;

    const exitX = direction === 'left' ? -window.innerWidth : window.innerWidth;
    const rotation = direction === 'left' ? -30 : 30;

    card.style.transition = 'transform 0.3s ease-out, opacity 0.3s ease-out';
    card.style.transform = `translateX(${exitX}px) rotate(${rotation}deg)`;
    card.style.opacity = '0';

    setTimeout(() => {
      setCurrentIndex((prev) => (prev + 1) % books.length);
      setShowInfo(false);
      setSwipeState({ startX: 0, currentX: 0, isDragging: false });

      // Reset card position for next card
      requestAnimationFrame(() => {
        card.style.transition = '';
        card.style.transform = '';
        card.style.opacity = '1';
      });
    }, 300);
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    setSwipeState({
      startX: e.clientX,
      currentX: e.clientX,
      isDragging: true
    });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!swipeState.isDragging) return;
    setSwipeState((prev) => ({ ...prev, currentX: e.clientX }));
  };

  const handleMouseUp = () => {
    if (!swipeState.isDragging) return;

    const delta = swipeState.currentX - swipeState.startX;
    const threshold = 100; // Pixels to trigger swipe

    if (Math.abs(delta) > threshold) {
      handleSwipe(delta > 0 ? 'right' : 'left');
    } else {
      setSwipeState({ startX: 0, currentX: 0, isDragging: false });
    }
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    const touch = e.touches[0];
    if (!touch) return;
    setSwipeState({
      startX: touch.clientX,
      currentX: touch.clientX,
      isDragging: true
    });
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!swipeState.isDragging) return;
    const touch = e.touches[0];
    if (!touch) return;
    setSwipeState((prev) => ({ ...prev, currentX: touch.clientX }));
  };

  const handleTouchEnd = () => {
    if (!swipeState.isDragging) return;

    const delta = swipeState.currentX - swipeState.startX;
    const threshold = 100;

    if (Math.abs(delta) > threshold) {
      handleSwipe(delta > 0 ? 'right' : 'left');
    } else {
      setSwipeState({ startX: 0, currentX: 0, isDragging: false });
    }
  };

  const getSwipeDirection = () => {
    const delta = swipeState.currentX - swipeState.startX;
    if (Math.abs(delta) < 50) return null;
    return delta > 0 ? 'right' : 'left';
  };

  const swipeDirection = getSwipeDirection();
  const translateX = swipeState.isDragging ? swipeState.currentX - swipeState.startX : 0;
  const rotation = swipeState.isDragging ? getCurrentRotation() : 0;

  if (!isOpen) return null;
  if (!currentBook) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Blur backdrop */}
      <div
        className="fixed inset-0 bg-black/40 backdrop-blur-md transition-opacity duration-300"
        onClick={onClose}
      />

      {/* Modal content */}
      <div className="relative w-full max-w-lg mx-auto animate-in fade-in zoom-in-95 duration-300">
        {/* Close button */}
        <Button
          variant="ghost"
          size="icon"
          onClick={onClose}
          className="absolute -top-14 right-0 z-20 text-white hover:text-orange transition-colors"
        >
          <X className="w-6 h-6" />
        </Button>

        {/* Algorithm info banner */}
        <div className="absolute -top-14 left-0 right-16 text-center">
          <p className="text-white/90 text-sm">
            <Sparkles className="w-4 h-4 inline-block mr-1 text-orange" />
            Your swipes help us find your perfect book match
          </p>
        </div>

        {/* Card Stack */}
        <div className="relative h-[600px] flex items-center justify-center">
          {/* Card */}
          <div
            ref={cardRef}
            className={cn(
              'relative w-full max-w-sm aspect-[3/4] rounded-3xl overflow-hidden',
              'bg-white dark:bg-gray-900 shadow-2xl',
              'cursor-grab active:cursor-grabbing',
              'transition-transform duration-75 ease-out'
            )}
            style={{
              transform: `translateX(${translateX}px) rotate(${rotation}deg)`,
              touchAction: 'none'
            }}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
          >
            {/* Book cover image */}
            <div className="absolute inset-0">
              <img
                src={currentBook.coverImage}
                alt={currentBook.title}
                className="w-full h-full object-cover"
                draggable={false}
              />
              {/* Gradient overlay for text readability */}
              <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/80" />
            </div>

            {/* LIKE/NOPE stamps */}
            <div
              className={cn(
                'absolute top-16 left-8 text-6xl font-bold border-4 px-4 py-2 rounded-lg transition-opacity duration-200',
                swipeDirection === 'left'
                  ? 'opacity-100 border-red-500 text-red-500 rotate-[-12deg]'
                  : 'opacity-0'
              )}
            >
              NOPE
            </div>
            <div
              className={cn(
                'absolute top-16 right-8 text-6xl font-bold border-4 px-4 py-2 rounded-lg transition-opacity duration-200',
                swipeDirection === 'right'
                  ? 'opacity-100 border-green-500 text-green-500 rotate-[12deg]'
                  : 'opacity-0'
              )}
            >
              LIKE
            </div>

            {/* Info button (like Tinder's bio button) */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowInfo(!showInfo);
              }}
              className="absolute top-4 right-4 w-12 h-12 rounded-full bg-black/30 backdrop-blur-sm flex items-center justify-center text-white hover:bg-black/50 transition-all hover:scale-110"
            >
              <Info className="w-6 h-6" />
            </button>

            {/* Book Info Overlay */}
            <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
              <h2 className="text-3xl font-bold mb-2 drop-shadow-lg">
                {currentBook.title}
              </h2>
              <p className="text-lg opacity-90 mb-3 drop-shadow-md">
                by {currentBook.author.name}
              </p>

              {/* Rating badge */}
              <div className="flex items-center gap-2 mb-4">
                <div className="flex items-center bg-black/30 backdrop-blur-sm rounded-full px-3 py-1">
                  <Star className="w-4 h-4 fill-yellow-400 text-yellow-400 mr-1" />
                  <span className="font-semibold">{currentBook.rating}</span>
                </div>
                <Badge className="bg-orange text-white border-0">
                  ${currentBook.price.toFixed(2)}
                </Badge>
              </div>

              {/* Expanded info panel (like Tinder bio) */}
              <div
                className={cn(
                  'overflow-hidden transition-all duration-300 ease-in-out',
                  showInfo ? 'max-h-48 opacity-100' : 'max-h-0 opacity-0'
                )}
              >
                <div className="bg-black/30 backdrop-blur-sm rounded-2xl p-4 mb-4">
                  <div className="flex items-center gap-2 mb-2">
                    <BookOpen className="w-4 h-4 text-orange" />
                    <span className="text-sm font-semibold">Description</span>
                  </div>
                  <p className="text-sm opacity-90 line-clamp-3 mb-3">
                    {currentBook.description}
                  </p>

                  <div className="flex items-center gap-2 mb-2">
                    <Tag className="w-4 h-4 text-orange" />
                    <span className="text-sm font-semibold">Categories</span>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {currentBook.categories.map((category) => (
                      <Badge
                        key={category.id}
                        variant="secondary"
                        className="text-xs bg-white/20 text-white border-0"
                      >
                        {category.name}
                      </Badge>
                    ))}
                  </div>

                  <div className="grid grid-cols-2 gap-2 mt-3 text-xs">
                    <div className="flex items-center gap-1">
                      <BookOpen className="w-3 h-3 opacity-70" />
                      <span className="opacity-90">{currentBook.pages} pages</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <DollarSign className="w-3 h-3 opacity-70" />
                      <span className="opacity-90">{currentBook.publisher}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex items-center justify-center gap-6">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleSwipe('left');
                  }}
                  className="w-16 h-16 rounded-full bg-gradient-to-br from-red-400 to-red-600 shadow-lg flex items-center justify-center text-white hover:scale-110 active:scale-95 transition-all border-4 border-white"
                >
                  <XIcon className="w-8 h-8" />
                </button>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowInfo(!showInfo);
                  }}
                  className={cn(
                    'w-12 h-12 rounded-full flex items-center justify-center transition-all',
                    showInfo
                      ? 'bg-orange text-white scale-110 shadow-lg'
                      : 'bg-white/20 backdrop-blur-sm text-white hover:bg-white/30'
                  )}
                >
                  <Info className="w-5 h-5" />
                </button>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleSwipe('right');
                  }}
                  className="w-16 h-16 rounded-full bg-gradient-to-br from-green-400 to-green-600 shadow-lg flex items-center justify-center text-white hover:scale-110 active:scale-95 transition-all border-4 border-white"
                >
                  <Heart className="w-8 h-8" />
                </button>
              </div>

              {/* Hint text */}
              <p className="text-center text-white/60 text-xs mt-4">
                Swipe or use arrow keys • Press <kbd className="px-1 py-0.5 bg-white/20 rounded">I</kbd> for info
              </p>
            </div>
          </div>

          {/* Progress indicator */}
          <div className="absolute -bottom-12 left-0 right-0 flex items-center justify-center gap-2">
            <span className="text-white/80 text-sm">
              {currentIndex + 1} of {books.length}
            </span>
            <div className="flex gap-1">
              {books.map((_, index) => (
                <div
                  key={index}
                  className={cn(
                    'w-2 h-2 rounded-full transition-all duration-300',
                    index === currentIndex
                      ? 'bg-orange w-8'
                      : index < currentIndex
                      ? 'bg-green-500'
                      : 'bg-white/30'
                  )}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Sparkles({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" />
      <path d="M5 3v4" />
      <path d="M19 17v4" />
      <path d="M3 5h4" />
      <path d="M17 19h4" />
    </svg>
  );
}
