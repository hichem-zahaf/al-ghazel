/**
 * AI Chat Modal Component
 * Modal with AI chat interface, book cards display, and AI credits meter
 */

'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { MessageSquare, X, Send, Sparkles, ShoppingCart, Loader2 } from 'lucide-react';
import { cn } from '@kit/ui/utils';
import { Button } from '@kit/ui/button';
import { Input } from '@kit/ui/input';
import { BookCard } from './book-card';
import { BookSwiper } from './book-swiper';
import { useUser } from '@kit/supabase/hooks/use-user';
import { toast } from 'sonner';
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

interface CreditsInfo {
  credits_used: number;
  credits_limit: number;
  is_admin: boolean;
  remaining: number | 'unlimited';
}

interface StreamingResponse {
  content?: string;
  toolCall?: { name: string; args: { books: Book[] } };
  done?: boolean;
}

export function AiChatModal({
  books,
  isOpen,
  onClose
}: AiChatModalProps) {
  const { data: user } = useUser();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [credits, setCredits] = useState<CreditsInfo | null>(null);
  const [isLoadingCredits, setIsLoadingCredits] = useState(true);
  const [currentStreamingMessage, setCurrentStreamingMessage] = useState('');
  const [streamingBooks, setStreamingBooks] = useState<Book[]>([]);
  const [showBooks, setShowBooks] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Fetch credits on mount and when user changes
  const fetchCredits = useCallback(async () => {
    if (!user) {
      setCredits(null);
      setIsLoadingCredits(false);
      return;
    }

    setIsLoadingCredits(true);
    try {
      const response = await fetch('/api/ai/chat');
      if (response.ok) {
        const data = await response.json();
        setCredits(data);
      } else {
        setCredits(null);
      }
    } catch (error) {
      console.error('Failed to fetch credits:', error);
      setCredits(null);
    } finally {
      setIsLoadingCredits(false);
    }
  }, [user]);

  useEffect(() => {
    fetchCredits();
  }, [fetchCredits]);

  // Initialize with welcome message
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      setMessages([{
        id: '1',
        role: 'assistant',
        content: "Hello! I'm your AI book assistant. I can help you discover new books based on your preferences. What kind of books are you looking for?",
        timestamp: new Date(),
      }]);
    }
  }, [isOpen, messages.length]);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, currentStreamingMessage]);

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

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      abortControllerRef.current?.abort();
    };
  }, []);

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
    if (!input.trim() || isTyping) return;

    // Check if user is logged in
    if (!user) {
      toast.error('Please login to use AI chat');
      return;
    }

    // Check credits
    if (credits && credits.remaining === 0 && !credits.is_admin) {
      toast.error('You have used all your AI credits for today');
      return;
    }

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsTyping(true);
    setCurrentStreamingMessage('');
    setStreamingBooks([]);

    // Create new AbortController for this request
    abortControllerRef.current = new AbortController();

    try {
      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userMessage.content,
          sessionId: crypto.randomUUID(),
        }),
        signal: abortControllerRef.current.signal,
      });

      if (!response.ok) {
        const errorData = await response.json();
        if (response.status === 429) {
          toast.error(`Insufficient credits. Used ${errorData.credits_used}/${errorData.credits_limit}`);
        } else {
          toast.error(errorData.error || 'Failed to send message');
        }
        setIsTyping(false);
        return;
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();

      if (!reader) {
        throw new Error('No response body');
      }

      let buffer = '';
      let accumulatedContent = '';

      while (true) {
        const { done, value } = await reader.read();

        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const data: StreamingResponse = JSON.parse(line.slice(6));

              if (data.content) {
                accumulatedContent += data.content;
                setCurrentStreamingMessage(accumulatedContent);
              }

              if (data.toolCall?.name === 'display_books' && data.toolCall.args.books) {
                setStreamingBooks(data.toolCall.args.books);
              }

              if (data.done) {
                const aiMessage: ChatMessage = {
                  id: (Date.now() + 1).toString(),
                  role: 'assistant',
                  content: accumulatedContent,
                  timestamp: new Date(),
                  recommendedBooks: streamingBooks.length > 0 ? streamingBooks : undefined,
                };
                setMessages((prev) => [...prev, aiMessage]);
                setCurrentStreamingMessage('');
                setStreamingBooks([]);

                // Refresh credits after message
                fetchCredits();
              }
            } catch (e) {
              console.error('Failed to parse SSE data:', e);
            }
          }
        }
      }
    } catch (error) {
      if ((error as Error).name !== 'AbortError') {
        console.error('Chat error:', error);
        toast.error('Failed to send message');
      }
    } finally {
      setIsTyping(false);
      abortControllerRef.current = null;
    }
  };

  // Format remaining credits
  const formatCredits = () => {
    if (isLoadingCredits) return 'Loading...';
    if (!credits) return 'Login required';
    if (credits.is_admin) return 'Unlimited (Admin)';
    if (credits.remaining === 'unlimited') return 'Unlimited';
    return `${credits.remaining} remaining`;
  };

  // Calculate credit percentage for meter
  const creditPercentage = credits && credits.credits_limit > 0
    ? ((credits.credits_limit - credits.credits_used) / credits.credits_limit) * 100
    : 100;

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
                className={cn(
                  "h-full transition-all duration-500 ease-out",
                  creditPercentage < 20
                    ? "bg-red-500"
                    : creditPercentage < 50
                    ? "bg-yellow-500"
                    : "bg-gradient-to-r from-orange to-orange/70"
                )}
                style={{ width: `${creditPercentage}%` }}
              />
            </div>
            <span className="text-xs font-medium text-muted-foreground whitespace-nowrap">
              {formatCredits()}
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
                <p className="text-sm whitespace-pre-wrap">{message.content}</p>
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

          {/* Streaming message */}
          {isTyping && currentStreamingMessage && (
            <div className="flex gap-3 justify-start">
              <div className="w-8 h-8 rounded-full bg-orange/10 flex items-center justify-center flex-shrink-0">
                <Sparkles className="w-4 h-4 text-orange" />
              </div>
              <div className="max-w-[70%] rounded-2xl px-4 py-2 bg-beige dark:bg-gray-800 text-black dark:text-white">
                <p className="text-sm whitespace-pre-wrap">{currentStreamingMessage}</p>
                <span className="inline-flex gap-1 mt-2">
                  <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </span>
              </div>
            </div>
          )}

          {/* Typing indicator */}
          {isTyping && !currentStreamingMessage && (
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

          {/* Streaming Books */}
          {isTyping && streamingBooks.length > 0 && (
            <div className="border-t border-border/50 pt-4">
              <div className="flex items-center justify-between mb-3">
                <p className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <ShoppingCart className="w-4 h-4" />
                  Recommended Books ({streamingBooks.length})
                </p>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowBooks(!showBooks)}
                  className="text-xs"
                >
                  {showBooks ? 'Hide' : 'Show'}
                </Button>
              </div>
              {showBooks && (
                <BookSwiper>
                  {streamingBooks.map((book) => (
                    <div key={book.id} className="flex-shrink-0 w-48 snap-start">
                      <BookCard
                        book={book}
                        variant="compact"
                        className="w-full"
                      />
                    </div>
                  ))}
                </BookSwiper>
              )}
            </div>
          )}

          {/* Recommended Books Section from completed messages */}
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
              placeholder={user ? "Ask for book recommendations..." : "Login to chat..."}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSendMessage();
                }
              }}
              disabled={!user || isTyping}
              className="flex-1"
            />
            <Button
              onClick={handleSendMessage}
              disabled={!input.trim() || isTyping || !user}
              className="bg-orange hover:bg-orange/90"
            >
              {isTyping ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
