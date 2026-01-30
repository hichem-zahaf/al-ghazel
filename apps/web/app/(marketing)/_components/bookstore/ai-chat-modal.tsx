/**
 * AI Chat Modal Component
 * Modal with AI chat interface, book cards display, and AI credits meter
 */

'use client';

import { useState, useEffect, useRef } from 'react';
import { MessageSquare, X, Send, Sparkles } from 'lucide-react';
import { cn } from '@kit/ui/utils';
import { Button } from '@kit/ui/button';
import { Input } from '@kit/ui/input';
import { BookCard } from './book-card';
import { BookSwiper } from './book-swiper';
import type { Book } from '../../../../types/bookstore';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  recommendedBooks?: Book[];
}

interface AiChatModalProps {
  books: Book[];
  isOpen: boolean;
  onClose: () => void;
}

export function AiChatModal({
  books,
  isOpen,
  onClose
}: AiChatModalProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      role: 'assistant',
      content: "Hello! I'm your AI book assistant. I can help you discover new books based on your preferences. What kind of books are you looking for?",
      timestamp: new Date(),
    }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [aiCredits, setAiCredits] = useState({ used: 12, total: 100 });
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

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

  const handleSendMessage = async () => {
    if (!input.trim()) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsTyping(true);

    // Simulate AI response
    setTimeout(() => {
      const recommendedBooks = books
        .sort(() => Math.random() - 0.5)
        .slice(0, Math.floor(Math.random() * 4) + 4); // Random 4-7 books

      const aiMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: `Based on your interest in "${userMessage.content}", here are some books I think you'll enjoy!`,
        timestamp: new Date(),
        recommendedBooks,
      };

      setMessages((prev) => [...prev, aiMessage]);
      setIsTyping(false);
      setAiCredits((prev) => ({ ...prev, used: Math.min(prev.used + 1, prev.total) }));
    }, 1500);
  };

  const creditsPercentage = (aiCredits.used / aiCredits.total) * 100;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Blur backdrop */}
      <div
        className="fixed inset-0 bg-black/30 backdrop-blur-sm transition-opacity duration-300"
        onClick={onClose}
      />

      {/* Modal content */}
      <div
        ref={modalRef}
        className="relative w-full max-w-4xl h-[80vh] bg-white dark:bg-gray-900 rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-300 flex flex-col"
      >
        {/* Header with credits meter */}
        <div className="flex-shrink-0 border-b border-border/50 p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-orange/10 flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-orange" />
              </div>
              <div>
                <h2 className="font-semibold text-lg">AI Book Assistant</h2>
                <p className="text-xs text-muted-foreground">Ask me anything about books</p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="flex-shrink-0"
            >
              <X className="w-5 h-5" />
            </Button>
          </div>

          {/* AI Credits Meter */}
          <div className="flex items-center gap-3">
            <div className="flex-1 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-orange to-orange/70 transition-all duration-500 ease-out"
                style={{ width: `${creditsPercentage}%` }}
              />
            </div>
            <span className="text-xs font-medium text-muted-foreground whitespace-nowrap">
              {aiCredits.used} / {aiCredits.total} credits
            </span>
          </div>
        </div>

        {/* Chat messages area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={cn(
                'flex gap-3',
                message.role === 'user' ? 'justify-end' : 'justify-start'
              )}
            >
              {message.role === 'assistant' && (
                <div className="w-8 h-8 rounded-full bg-orange/10 flex items-center justify-center flex-shrink-0">
                  <Sparkles className="w-4 h-4 text-orange" />
                </div>
              )}
              <div
                className={cn(
                  'max-w-[70%] rounded-2xl px-4 py-2',
                  message.role === 'user'
                    ? 'bg-orange text-white'
                    : 'bg-beige dark:bg-gray-800 text-black dark:text-white'
                )}
              >
                <p className="text-sm">{message.content}</p>
                <span className="text-[10px] opacity-70 mt-1 block">
                  {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
              {message.role === 'user' && (
                <div className="w-8 h-8 rounded-full bg-gray-300 dark:bg-gray-600 flex items-center justify-center flex-shrink-0">
                  <span className="text-xs font-bold">U</span>
                </div>
              )}
            </div>
          ))}

          {/* Typing indicator */}
          {isTyping && (
            <div className="flex gap-3 justify-start">
              <div className="w-8 h-8 rounded-full bg-orange/10 flex items-center justify-center flex-shrink-0">
                <Sparkles className="w-4 h-4 text-orange" />
              </div>
              <div className="bg-beige dark:bg-gray-800 rounded-2xl px-4 py-2">
                <div className="flex gap-1">
                  <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            </div>
          )}

          {/* Recommended Books Section */}
          {messages
            .filter((m) => m.role === 'assistant' && m.recommendedBooks && m.recommendedBooks.length > 0)
            .map((message) => (
              <div key={`books-${message.id}`} className="border-t border-border/50 pt-4">
                <p className="text-sm font-medium text-muted-foreground mb-3">
                  Recommended Books ({message.recommendedBooks?.length})
                </p>
                <BookSwiper>
                  {message.recommendedBooks?.map((book) => (
                    <div key={book.id} className="flex-shrink-0 w-48 snap-start">
                      <BookCard
                        book={book}
                        variant="compact"
                        className="w-full"
                      />
                    </div>
                  ))}
                </BookSwiper>
              </div>
            ))}

          <div ref={messagesEndRef} />
        </div>

        {/* Input area */}
        <div className="flex-shrink-0 border-t border-border/50 p-4">
          <div className="flex gap-2">
            <Input
              ref={inputRef}
              type="text"
              placeholder="Ask for book recommendations..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSendMessage();
                }
              }}
              className="flex-1"
            />
            <Button
              onClick={handleSendMessage}
              disabled={!input.trim() || isTyping}
              className="bg-orange hover:bg-orange/90"
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
