'use client';

import { useState } from 'react';
import {
  Plus,
  Pencil,
  Trash2,
  Star,
  UserCog,
  Sparkles,
  SlidersHorizontal,
  Tags,
  LayoutDashboard,
  Save,
  GripVertical,
  Eye,
  EyeOff,
  ChevronDown,
  ChevronUp,
  Image as ImageIcon,
  Type,
  Layers,
  BookOpen,
  User,
  Search,
  Shuffle,
  AlignHorizontalSpaceAround,
} from 'lucide-react';
import { format } from 'date-fns';

import { PageBody } from '@kit/ui/page';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@kit/ui/card';
import { Button } from '@kit/ui/button';
import { Badge } from '@kit/ui/badge';
import { Input } from '@kit/ui/input';
import { Textarea } from '@kit/ui/textarea';
import { Label } from '@kit/ui/label';
import { Switch } from '@kit/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@kit/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@kit/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@kit/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@kit/ui/tabs';
import { cn } from '@kit/ui/utils';
import { AdminDataTable, FilterConfig } from '../_components/admin-data-table';

interface Coupon {
  id: string;
  code: string;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  usageLimit: number;
  usedCount: number;
  validFrom: Date;
  validUntil: Date;
  isActive: boolean;
}

// Homepage Section Configuration Types
interface SectionConfig {
  id: string;
  title: string;
  description: string;
  icon: React.ElementType;
  enabled: boolean;
  order: number;
  config: Record<string, unknown>;
}

interface HomepageConfig {
  heroSection: SectionConfig;
  categoriesSection: SectionConfig;
  bookOfTheDaySection: SectionConfig;
  authorOfTheDaySection: SectionConfig;
  recommendedBooksSection: SectionConfig;
  forYouSection: SectionConfig;
  bookRouletteSection: SectionConfig;
  searchSection: SectionConfig;
}

const mockCoupons: Coupon[] = [
  { id: 'c1', code: 'SUMMER20', discountType: 'percentage', discountValue: 20, usageLimit: 100, usedCount: 45, validFrom: new Date('2024-01-01'), validUntil: new Date('2024-12-31'), isActive: true },
  { id: 'c2', code: 'WELCOME10', discountType: 'fixed', discountValue: 10, usageLimit: 500, usedCount: 123, validFrom: new Date('2024-01-01'), validUntil: new Date('2024-06-30'), isActive: true },
];

// Mock homepage section configurations
const homepageSections: SectionConfig[] = [
  {
    id: 'hero',
    title: 'Hero Section',
    description: 'Main banner and call-to-action area at the top of the page',
    icon: Layers,
    enabled: true,
    order: 1,
    config: {
      title: 'Welcome to Al-Ghazel Bookstore',
      subtitle: 'Discover your next favorite book from our curated collection',
      ctaText: 'Browse Collection',
      ctaLink: '/books',
      backgroundImage: '/images/hero-bg.jpg',
      showOverlay: true,
    },
  },
  {
    id: 'categories',
    title: 'Category Carousel',
    description: 'Horizontal scrollable list of book categories',
    icon: AlignHorizontalSpaceAround,
    enabled: true,
    order: 2,
    config: {
      title: 'Browse by Category',
      showIcon: true,
      showBookCount: true,
      autoScroll: false,
      scrollSpeed: 3000,
    },
  },
  {
    id: 'book-of-the-day',
    title: 'Book of the Day',
    description: 'Featured book with detailed description',
    icon: BookOpen,
    enabled: true,
    order: 3,
    config: {
      title: 'Book of the Day',
      showRating: true,
      showPrice: true,
      showAddToCart: true,
      layout: 'featured',
    },
  },
  {
    id: 'author-of-the-day',
    title: 'Author of the Day',
    description: 'Featured author spotlight section',
    icon: User,
    enabled: true,
    order: 4,
    config: {
      title: 'Author Spotlight',
      showBio: true,
      showBookCount: true,
      showSocialLinks: true,
      maxBooks: 3,
    },
  },
  {
    id: 'recommended-books',
    title: 'Recommended Books',
    description: 'Bestsellers and trending books section',
    icon: Star,
    enabled: true,
    order: 5,
    config: {
      title: 'Recommended for You',
      subtitle: 'Handpicked selections based on popularity',
      bookCount: 6,
      showRating: true,
      showAuthor: true,
      layout: 'grid',
    },
  },
  {
    id: 'for-you',
    title: 'For You Section',
    description: 'Personalized new releases and recommendations',
    icon: Sparkles,
    enabled: true,
    order: 6,
    config: {
      title: 'New Releases Just for You',
      subtitle: 'Fresh arrivals tailored to your taste',
      bookCount: 12,
      showNewBadge: true,
      showDiscount: true,
      layout: 'horizontal-scroll',
    },
  },
  {
    id: 'book-roulette',
    title: 'Book Roulette',
    description: 'Interactive random book discovery section',
    icon: Shuffle,
    enabled: true,
    order: 7,
    config: {
      title: 'Feeling Lucky?',
      description: 'Spin to discover a random book from our collection',
      showAnimation: true,
      dailyLimit: 10,
    },
  },
  {
    id: 'search',
    title: 'Search Section',
    description: 'Advanced search and filter area',
    icon: Search,
    enabled: true,
    order: 8,
    config: {
      title: 'Find Your Perfect Book',
      showFilters: true,
      showSuggestions: true,
      filterCategories: true,
      filterAuthors: true,
      filterPrice: true,
    },
  },
];

// Section Config Fields Component
function SectionConfigFields({ section }: { section: SectionConfig }) {
  const config = section.config;

  if (section.id === 'hero') {
    return (
      <div className="space-y-6">
        {/* Hero Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor={`${section.id}-title`}>Hero Title</Label>
            <Input id={`${section.id}-title`} defaultValue={config.title as string} placeholder="Welcome to Al-Ghazel Bookstore" />
          </div>
          <div className="space-y-2">
            <Label htmlFor={`${section.id}-subtitle`}>Hero Subtitle</Label>
            <Input id={`${section.id}-subtitle`} defaultValue={config.subtitle as string} placeholder="Discover your next favorite book" />
          </div>
          <div className="space-y-2">
            <Label htmlFor={`${section.id}-cta`}>CTA Button Text</Label>
            <Input id={`${section.id}-cta`} defaultValue={config.ctaText as string} placeholder="Browse Collection" />
          </div>
          <div className="space-y-2">
            <Label htmlFor={`${section.id}-link`}>CTA Link</Label>
            <Input id={`${section.id}-link`} defaultValue={config.ctaLink as string} placeholder="/books" />
          </div>
          <div className="space-y-2 md:col-span-2">
            <Label htmlFor={`${section.id}-bg`}>Background Image URL</Label>
            <Input id={`${section.id}-bg`} defaultValue={config.backgroundImage as string} placeholder="/images/hero-bg.jpg" />
          </div>
          <div className="flex items-center justify-between bg-background rounded-lg p-3 border md:col-span-2">
            <div>
              <Label htmlFor={`${section.id}-overlay`}>Show Dark Overlay</Label>
              <p className="text-xs text-muted-foreground">Add overlay for better text readability</p>
            </div>
            <Switch id={`${section.id}-overlay`} defaultChecked={config.showOverlay as boolean} />
          </div>
        </div>
      </div>
    );
  }

  if (section.id === 'categories') {
    return (
      <div className="space-y-6">
        {/* Section Title */}
        <div className="space-y-2">
          <Label htmlFor={`${section.id}-title`}>Section Title</Label>
          <Input id={`${section.id}-title`} defaultValue={config.title as string} placeholder="Browse by Category" />
        </div>

        {/* Categories Selection */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label>Select Categories to Display</Label>
            <Button variant="outline" size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Add All Categories
            </Button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {['Fiction', 'Non-Fiction', 'Science', 'History', 'Biography', 'Mystery', 'Romance', 'Children'].map((cat) => (
              <div key={cat} className="flex items-center gap-3 p-3 border rounded-lg hover:bg-muted/50 cursor-pointer">
                <Switch id={`cat-${cat}`} defaultChecked={['Fiction', 'Non-Fiction', 'Science', 'History'].includes(cat)} />
                <Label htmlFor={`cat-${cat}`} className="flex-1 cursor-pointer">{cat}</Label>
                <span className="text-xs text-muted-foreground">12 books</span>
              </div>
            ))}
          </div>
        </div>

        {/* Display Options */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex items-center justify-between bg-background rounded-lg p-3 border">
            <div>
              <Label htmlFor={`${section.id}-icon`}>Show Category Icons</Label>
              <p className="text-xs text-muted-foreground">Display emoji/icon for each</p>
            </div>
            <Switch id={`${section.id}-icon`} defaultChecked={config.showIcon as boolean} />
          </div>
          <div className="flex items-center justify-between bg-background rounded-lg p-3 border">
            <div>
              <Label htmlFor={`${section.id}-count`}>Show Book Counts</Label>
              <p className="text-xs text-muted-foreground">Display number of books</p>
            </div>
            <Switch id={`${section.id}-count`} defaultChecked={config.showBookCount as boolean} />
          </div>
          <div className="flex items-center justify-between bg-background rounded-lg p-3 border">
            <div>
              <Label htmlFor={`${section.id}-autoscroll`}>Auto-scroll</Label>
              <p className="text-xs text-muted-foreground">Automatically scroll</p>
            </div>
            <Switch id={`${section.id}-autoscroll`} defaultChecked={config.autoScroll as boolean} />
          </div>
          <div className="space-y-2">
            <Label htmlFor={`${section.id}-speed`}>Scroll Speed (ms)</Label>
            <Input id={`${section.id}-speed`} type="number" defaultValue={config.scrollSpeed as number} />
          </div>
        </div>
      </div>
    );
  }

  if (section.id === 'book-of-the-day') {
    return (
      <div className="space-y-6">
        {/* Book Selection */}
        <div className="space-y-3">
          <Label>Select Featured Book</Label>
          <Select>
            <SelectTrigger id={`${section.id}-book`}>
              <SelectValue placeholder="Choose a book to feature..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1">The Midnight Library - Matt Haig</SelectItem>
              <SelectItem value="2">Atomic Habits - James Clear</SelectItem>
              <SelectItem value="3">The Great Gatsby - F. Scott Fitzgerald</SelectItem>
              <SelectItem value="4">Project Hail Mary - Andy Weir</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Schedule */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor={`${section.id}-date`}>Featured Date</Label>
            <Input id={`${section.id}-date`} type="date" />
          </div>
          <div className="space-y-2">
            <Label htmlFor={`${section.id}-time`}>Featured Time (optional)</Label>
            <Input id={`${section.id}-time`} type="time" />
          </div>
        </div>

        {/* Description */}
        <div className="space-y-2">
          <Label htmlFor={`${section.id}-reason`}>Feature Reason</Label>
          <Textarea id={`${section.id}-reason`} placeholder="Why this book is special..." rows={3} />
        </div>

        {/* Display Options */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor={`${section.id}-layout`}>Layout Style</Label>
            <Select defaultValue={config.layout as string}>
              <SelectTrigger id={`${section.id}-layout`}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="featured">Featured (Large)</SelectItem>
                <SelectItem value="compact">Compact</SelectItem>
                <SelectItem value="minimal">Minimal</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Display Options</Label>
            <div className="flex flex-wrap gap-2">
              <Badge variant="outline" className="cursor-pointer hover:bg-orange-50">Rating</Badge>
              <Badge variant="outline" className="cursor-pointer hover:bg-orange-50">Price</Badge>
              <Badge variant="outline" className="cursor-pointer hover:bg-orange-50">Add to Cart</Badge>
            </div>
          </div>
        </div>

        {/* Scheduled Books Preview */}
        <div className="border-t pt-4">
          <h5 className="font-medium mb-3">Upcoming Schedule</h5>
          <div className="space-y-2">
            <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg text-sm">
              <div>
                <span className="font-medium">The Midnight Library</span>
                <span className="text-muted-foreground ml-2">by Matt Haig</span>
              </div>
              <span className="text-muted-foreground">Feb 1, 2024</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (section.id === 'author-of-the-day') {
    return (
      <div className="space-y-6">
        {/* Author Selection */}
        <div className="space-y-3">
          <Label>Select Featured Author</Label>
          <Select>
            <SelectTrigger id={`${section.id}-author`}>
              <SelectValue placeholder="Choose an author to feature..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1">Matt Haig</SelectItem>
              <SelectItem value="2">James Clear</SelectItem>
              <SelectItem value="3">F. Scott Fitzgerald</SelectItem>
              <SelectItem value="4">Andy Weir</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Schedule */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor={`${section.id}-date`}>Featured Date</Label>
            <Input id={`${section.id}-date`} type="date" />
          </div>
          <div className="space-y-2">
            <Label htmlFor={`${section.id}-time`}>Featured Time (optional)</Label>
            <Input id={`${section.id}-time`} type="time" />
          </div>
        </div>

        {/* Description */}
        <div className="space-y-2">
          <Label htmlFor={`${section.id}-reason`}>Feature Reason</Label>
          <Textarea id={`${section.id}-reason`} placeholder="Why this author is special..." rows={3} />
        </div>

        {/* Books to Showcase */}
        <div className="space-y-3">
          <Label>Books to Showcase (max 3)</Label>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="p-3 border rounded-lg hover:border-orange-300 cursor-pointer">
                <Input placeholder={`Book ${i} title...`} className="border-0 p-0 focus-visible:ring-0" />
              </div>
            ))}
          </div>
        </div>

        {/* Display Options */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Display Options</Label>
            <div className="flex flex-wrap gap-2">
              <Badge variant="outline" className="cursor-pointer hover:bg-orange-50">Bio</Badge>
              <Badge variant="outline" className="cursor-pointer hover:bg-orange-50">Book Count</Badge>
              <Badge variant="outline" className="cursor-pointer hover:bg-orange-50">Social Links</Badge>
            </div>
          </div>
        </div>

        {/* Scheduled Authors Preview */}
        <div className="border-t pt-4">
          <h5 className="font-medium mb-3">Upcoming Schedule</h5>
          <div className="space-y-2">
            <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg text-sm">
              <div>
                <span className="font-medium">Matt Haig</span>
                <span className="text-muted-foreground ml-2">• 5 books</span>
              </div>
              <span className="text-muted-foreground">Feb 1, 2024</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (section.id === 'recommended-books') {
    return (
      <div className="space-y-6">
        {/* Section Titles */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor={`${section.id}-title`}>Section Title</Label>
            <Input id={`${section.id}-title`} defaultValue={config.title as string} />
          </div>
          <div className="space-y-2">
            <Label htmlFor={`${section.id}-subtitle`}>Subtitle</Label>
            <Input id={`${section.id}-subtitle`} defaultValue={config.subtitle as string} />
          </div>
        </div>

        {/* Book Selection Source */}
        <div className="space-y-3">
          <Label>Book Selection Source</Label>
          <Select defaultValue="bestsellers">
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="bestsellers">Bestsellers (is_bestseller=true)</SelectItem>
              <SelectItem value="featured">Featured Books (is_featured=true)</SelectItem>
              <SelectItem value="new">New Releases (is_new_release=true)</SelectItem>
              <SelectItem value="highest-rated">Highest Rated</SelectItem>
              <SelectItem value="manual">Manual Selection</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Number of Books */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor={`${section.id}-count`}>Number of Books</Label>
            <Input id={`${section.id}-count`} type="number" defaultValue={config.bookCount as number} min={1} max={24} />
          </div>
          <div className="space-y-2">
            <Label htmlFor={`${section.id}-layout`}>Layout</Label>
            <Select defaultValue={config.layout as string}>
              <SelectTrigger id={`${section.id}-layout`}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="grid">Grid</SelectItem>
                <SelectItem value="horizontal-scroll">Horizontal Scroll</SelectItem>
                <SelectItem value="list">List</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Manual Book Selection (shown when source is manual) */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label>Manually Selected Books</Label>
            <Button variant="outline" size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Add Books
            </Button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
            <div className="p-3 border rounded-lg flex items-center gap-3">
              <div className="h-12 w-8 bg-orange-100 rounded"></div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm truncate">The Midnight Library</p>
                <p className="text-xs text-muted-foreground truncate">Matt Haig</p>
              </div>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                <Trash2 className="h-4 w-4 text-destructive" />
              </Button>
            </div>
          </div>
        </div>

        {/* Display Options */}
        <div className="space-y-2">
          <Label>Card Display Options</Label>
          <div className="flex flex-wrap gap-2">
            <Badge variant="outline" className="cursor-pointer hover:bg-orange-50">Rating</Badge>
            <Badge variant="outline" className="cursor-pointer hover:bg-orange-50">Author</Badge>
            <Badge variant="outline" className="cursor-pointer hover:bg-orange-50">Price</Badge>
            <Badge variant="outline" className="cursor-pointer hover:bg-orange-50">Add to Cart</Badge>
          </div>
        </div>
      </div>
    );
  }

  if (section.id === 'for-you') {
    return (
      <div className="space-y-6">
        {/* Section Titles */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor={`${section.id}-title`}>Section Title</Label>
            <Input id={`${section.id}-title`} defaultValue={config.title as string} />
          </div>
          <div className="space-y-2">
            <Label htmlFor={`${section.id}-subtitle`}>Subtitle</Label>
            <Input id={`${section.id}-subtitle`} defaultValue={config.subtitle as string} />
          </div>
        </div>

        {/* Book Selection Source */}
        <div className="space-y-3">
          <Label>Book Selection Source</Label>
          <Select defaultValue="new-releases">
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="new-releases">New Releases (is_new_release=true)</SelectItem>
              <SelectItem value="featured">Featured Books</SelectItem>
              <SelectItem value="personalized">Personalized (user-based)</SelectItem>
              <SelectItem value="category">By Category</SelectItem>
              <SelectItem value="manual">Manual Selection</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Category Filter (shown when source is category) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor={`${section.id}-category`}>Filter by Category</Label>
            <Select>
              <SelectTrigger id={`${section.id}-category`}>
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="fiction">Fiction</SelectItem>
                <SelectItem value="non-fiction">Non-Fiction</SelectItem>
                <SelectItem value="science">Science</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor={`${section.id}-count`}>Number of Books</Label>
            <Input id={`${section.id}-count`} type="number" defaultValue={config.bookCount as number} min={1} max={24} />
          </div>
        </div>

        {/* Manual Selection */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label>Manually Selected Books</Label>
            <Button variant="outline" size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Add Books
            </Button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
            <div className="p-3 border rounded-lg flex items-center gap-3">
              <div className="h-12 w-8 bg-orange-100 rounded"></div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm truncate">Project Hail Mary</p>
                <p className="text-xs text-muted-foreground truncate">Andy Weir</p>
              </div>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                <Trash2 className="h-4 w-4 text-destructive" />
              </Button>
            </div>
          </div>
        </div>

        {/* Layout & Display */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor={`${section.id}-layout`}>Layout</Label>
            <Select defaultValue={config.layout as string}>
              <SelectTrigger id={`${section.id}-layout`}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="grid">Grid</SelectItem>
                <SelectItem value="horizontal-scroll">Horizontal Scroll</SelectItem>
                <SelectItem value="list">List</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Card Badges</Label>
            <div className="flex flex-wrap gap-2">
              <Badge variant="outline" className="cursor-pointer hover:bg-orange-50">New Badge</Badge>
              <Badge variant="outline" className="cursor-pointer hover:bg-orange-50">Discount</Badge>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (section.id === 'book-roulette') {
    return (
      <div className="space-y-6">
        {/* Section Titles */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor={`${section.id}-title`}>Section Title</Label>
            <Input id={`${section.id}-title`} defaultValue={config.title as string} />
          </div>
          <div className="space-y-2">
            <Label htmlFor={`${section.id}-desc`}>Description</Label>
            <Input id={`${section.id}-desc`} defaultValue={config.description as string} />
          </div>
        </div>

        {/* Book Pool Source */}
        <div className="space-y-3">
          <Label>Book Pool Source</Label>
          <Select defaultValue="all">
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Books</SelectItem>
              <SelectItem value="featured">Featured Books</SelectItem>
              <SelectItem value="category">By Category</SelectItem>
              <SelectItem value="manual">Manual Selection</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Category Filter */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label htmlFor={`${section.id}-category`}>Filter by Category</Label>
            <Select>
              <SelectTrigger id={`${section.id}-category`}>
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="fiction">Fiction</SelectItem>
                <SelectItem value="mystery">Mystery</SelectItem>
                <SelectItem value="romance">Romance</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor={`${section.id}-limit`}>Daily Spin Limit</Label>
            <Input id={`${section.id}-limit`} type="number" defaultValue={config.dailyLimit as number} min={1} max={100} />
          </div>
          <div className="flex items-end">
            <Switch id={`${section.id}-anim`} defaultChecked={config.showAnimation as boolean} />
            <Label htmlFor={`${section.id}-anim`} className="ml-2">Animation</Label>
          </div>
        </div>

        {/* Manual Book Pool */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label>Books in Roulette Pool</Label>
            <Button variant="outline" size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Add Books
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">If left empty, all books from the selected source will be used.</p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="p-2 border rounded-lg flex items-center gap-2">
                <div className="h-10 w-8 bg-orange-100 rounded shrink-0"></div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium truncate">Book Title {i}</p>
                  <p className="text-xs text-muted-foreground truncate">Author Name</p>
                </div>
                <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                  <Trash2 className="h-3 w-3 text-destructive" />
                </Button>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (section.id === 'search') {
    return (
      <div className="space-y-6">
        {/* Section Title */}
        <div className="space-y-2">
          <Label htmlFor={`${section.id}-title`}>Section Title</Label>
          <Input id={`${section.id}-title`} defaultValue={config.title as string} />
        </div>

        {/* Placeholder Text */}
        <div className="space-y-2">
          <Label htmlFor={`${section.id}-placeholder`}>Search Placeholder</Label>
          <Input id={`${section.id}-placeholder`} placeholder="Search by title, author, ISBN..." />
        </div>

        {/* Filter Options */}
        <div className="space-y-3">
          <Label>Available Filters</Label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center gap-2">
                <Switch id={`${section.id}-filter-cat`} defaultChecked={config.filterCategories as boolean} />
                <Label htmlFor={`${section.id}-filter-cat`} className="cursor-pointer">Category</Label>
              </div>
            </div>
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center gap-2">
                <Switch id={`${section.id}-filter-auth`} defaultChecked={config.filterAuthors as boolean} />
                <Label htmlFor={`${section.id}-filter-auth`} className="cursor-pointer">Author</Label>
              </div>
            </div>
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center gap-2">
                <Switch id={`${section.id}-filter-price`} defaultChecked={config.filterPrice as boolean} />
                <Label htmlFor={`${section.id}-filter-price`} className="cursor-pointer">Price Range</Label>
              </div>
            </div>
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center gap-2">
                <Switch id={`${section.id}-filter-rating`} defaultChecked={true} />
                <Label htmlFor={`${section.id}-filter-rating`} className="cursor-pointer">Rating</Label>
              </div>
            </div>
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center gap-2">
                <Switch id={`${section.id}-filter-format`} defaultChecked={true} />
                <Label htmlFor={`${section.id}-filter-format`} className="cursor-pointer">Format</Label>
              </div>
            </div>
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center gap-2">
                <Switch id={`${section.id}-filter-lang`} defaultChecked={true} />
                <Label htmlFor={`${section.id}-filter-lang`} className="cursor-pointer">Language</Label>
              </div>
            </div>
          </div>
        </div>

        {/* Other Options */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex items-center justify-between bg-background rounded-lg p-3 border">
            <div>
              <Label htmlFor={`${section.id}-filters`}>Show Filters Panel</Label>
              <p className="text-xs text-muted-foreground">Display filter options by default</p>
            </div>
            <Switch id={`${section.id}-filters`} defaultChecked={config.showFilters as boolean} />
          </div>
          <div className="flex items-center justify-between bg-background rounded-lg p-3 border">
            <div>
              <Label htmlFor={`${section.id}-suggestions`}>Show Suggestions</Label>
              <p className="text-xs text-muted-foreground">Auto-complete suggestions</p>
            </div>
            <Switch id={`${section.id}-suggestions`} defaultChecked={config.showSuggestions as boolean} />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="text-muted-foreground text-sm">
      No configuration options available for this section.
    </div>
  );
}

export default function AdminSettingsPage() {
  const [activeTab, setActiveTab] = useState('homepage');
  const [searchParams] = useState(new URLSearchParams());
  const initialTab = searchParams.get('tab') || 'homepage';
  const [isCouponModalOpen, setIsCouponModalOpen] = useState(false);

  // Homepage sections state
  const [sections, setSections] = useState<SectionConfig[]>(homepageSections);
  const [expandedSection, setExpandedSection] = useState<string | null>(null);

  // Coupon Table Columns
  const couponColumns = [
    {
      accessorKey: 'code',
      header: 'Code',
      cell: ({ row }: any) => <span className="font-mono font-medium">{row.getValue('code')}</span>,
    },
    {
      accessorKey: 'discountType',
      header: 'Type',
      cell: ({ row }: any) => (
        <Badge variant="outline" className="capitalize">{row.getValue('discountType')}</Badge>
      ),
    },
    {
      accessorKey: 'discountValue',
      header: 'Discount',
      cell: ({ row }: any) => {
        const coupon = row.original;
        return (
          <span className="font-medium">
            {coupon.discountType === 'percentage' ? `${coupon.discountValue}%` : `$${coupon.discountValue}`}
          </span>
        );
      },
    },
    {
      accessorKey: 'usedCount',
      header: 'Used',
      cell: ({ row }: any) => {
        const coupon = row.original;
        return (
          <span>{coupon.usedCount}/{coupon.usageLimit}</span>
        );
      },
    },
    {
      accessorKey: 'validUntil',
      header: 'Valid Until',
      cell: ({ row }: any) => <span>{format(row.getValue('validUntil'), 'MMM d, yyyy')}</span>,
    },
    {
      accessorKey: 'isActive',
      header: 'Status',
      cell: ({ row }: any) => (
        <Badge className={cn(row.getValue('isActive') ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800')}>
          {row.getValue('isActive') ? 'Active' : 'Inactive'}
        </Badge>
      ),
    },
  ];

  return (
    <PageBody>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold">Settings</h1>
          <p className="text-muted-foreground mt-1">
            Manage your bookstore content, inventory, and configurations
          </p>
        </div>

        {/* Tabs */}
        <Tabs defaultValue={initialTab} value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3 lg:grid-cols-6 h-auto">
            <TabsTrigger value="homepage" className="gap-2">
              <LayoutDashboard className="h-4 w-4" />
              <span className="hidden sm:inline">Home</span>
            </TabsTrigger>
            <TabsTrigger value="recommendations" className="gap-2">
              <Sparkles className="h-4 w-4" />
              <span className="hidden sm:inline">AI Recs</span>
            </TabsTrigger>
            <TabsTrigger value="book-of-day" className="gap-2">
              <Star className="h-4 w-4" />
              <span className="hidden sm:inline">Book</span>
            </TabsTrigger>
            <TabsTrigger value="author-of-day" className="gap-2">
              <UserCog className="h-4 w-4" />
              <span className="hidden sm:inline">Author</span>
            </TabsTrigger>
            <TabsTrigger value="coupons" className="gap-2">
              <Tags className="h-4 w-4" />
              <span className="hidden sm:inline">Coupons</span>
            </TabsTrigger>
            <TabsTrigger value="algorithms" className="gap-2">
              <SlidersHorizontal className="h-4 w-4" />
              <span className="hidden sm:inline">Algo</span>
            </TabsTrigger>
          </TabsList>

          {/* Homepage Tab */}
          <TabsContent value="homepage" className="space-y-6">
            {/* Overview Header */}
            <Card className="bg-gradient-to-br from-orange-50 to-beige-50 dark:from-orange-950/20 dark:to-beige-950/20 border-orange-200 dark:border-orange-800">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-2xl">Homepage Layout</CardTitle>
                    <CardDescription className="mt-2">
                      Configure the sections that appear on your homepage. Drag to reorder, toggle visibility, and customize each section.
                    </CardDescription>
                  </div>
                  <Button className="gap-2">
                    <Save className="h-4 w-4" />
                    Save All Changes
                  </Button>
                </div>
              </CardHeader>
            </Card>

            {/* Sections Grid */}
            <div className="space-y-4">
              {sections
                .sort((a, b) => a.order - b.order)
                .map((section) => {
                  const Icon = section.icon;
                  const isExpanded = expandedSection === section.id;

                  return (
                    <Card
                      key={section.id}
                      className={cn(
                        'transition-all duration-200',
                        !section.enabled && 'opacity-60',
                        isExpanded && 'ring-2 ring-orange-200 dark:ring-orange-800'
                      )}
                    >
                      {/* Section Header */}
                      <div className="flex items-center gap-4 p-4">
                        <GripVertical className="h-5 w-5 text-muted-foreground cursor-grab" />

                        {/* Icon */}
                        <div className={cn(
                          'flex h-12 w-12 items-center justify-center rounded-xl',
                          section.enabled
                            ? 'bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400'
                            : 'bg-muted text-muted-foreground'
                        )}>
                          <Icon className="h-6 w-6" />
                        </div>

                        {/* Info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-3">
                            <h3 className="font-semibold text-lg">{section.title}</h3>
                            <Badge variant={section.enabled ? 'default' : 'secondary'} className="gap-1">
                              Order {section.order}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground mt-0.5">{section.description}</p>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-2">
                          <Switch
                            checked={section.enabled}
                            onCheckedChange={(checked) => {
                              setSections(sections.map(s =>
                                s.id === section.id ? { ...s, enabled: checked } : s
                              ));
                            }}
                          />
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setExpandedSection(isExpanded ? null : section.id)}
                          >
                            {isExpanded ? (
                              <ChevronUp className="h-4 w-4" />
                            ) : (
                              <ChevronDown className="h-4 w-4" />
                            )}
                          </Button>
                        </div>
                      </div>

                      {/* Expanded Config */}
                      {isExpanded && (
                        <div className="border-t bg-muted/30 p-4 space-y-6">
                          {/* Quick Stats */}
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                            <div className="bg-background rounded-lg p-3 border">
                              <p className="text-xs text-muted-foreground">Status</p>
                              <p className="font-medium flex items-center gap-1.5 mt-1">
                                {section.enabled ? (
                                  <><Eye className="h-3.5 w-3.5 text-green-600" /><span className="text-green-600">Visible</span></>
                                ) : (
                                  <><EyeOff className="h-3.5 w-3.5 text-muted-foreground" /><span>Hidden</span></>
                                )}
                              </p>
                            </div>
                            <div className="bg-background rounded-lg p-3 border">
                              <p className="text-xs text-muted-foreground">Position</p>
                              <p className="font-medium mt-1">{section.order} of {sections.length}</p>
                            </div>
                            <div className="bg-background rounded-lg p-3 border">
                              <p className="text-xs text-muted-foreground">Config Items</p>
                              <p className="font-medium mt-1">{Object.keys(section.config).length}</p>
                            </div>
                            <div className="bg-background rounded-lg p-3 border">
                              <p className="text-xs text-muted-foreground">Section ID</p>
                              <p className="font-mono text-sm mt-1">{section.id}</p>
                            </div>
                          </div>

                          {/* Configuration Form */}
                          <div>
                            <h4 className="font-semibold mb-4 flex items-center gap-2">
                              <SlidersHorizontal className="h-4 w-4" />
                              Section Configuration
                            </h4>

                            {/* Render config fields based on section type */}
                            <SectionConfigFields section={section} />
                          </div>

                          {/* Section Actions */}
                          <div className="flex items-center justify-between pt-4 border-t">
                            <div className="flex items-center gap-2">
                              <Button variant="outline" size="sm">
                                <Eye className="h-4 w-4 mr-2" />
                                Preview
                              </Button>
                              <Button variant="outline" size="sm">
                                Reset to Default
                              </Button>
                            </div>
                            <div className="flex items-center gap-2">
                              <Button variant="ghost" size="sm" className="text-destructive">
                                <Trash2 className="h-4 w-4 mr-2" />
                                Reset Section
                              </Button>
                              <Button size="sm">
                                <Save className="h-4 w-4 mr-2" />
                                Save Config
                              </Button>
                            </div>
                          </div>
                        </div>
                      )}
                    </Card>
                  );
                })}
            </div>

            {/* Add Section Button */}
            <Card className="border-dashed">
              <CardContent className="flex flex-col items-center justify-center py-8">
                <Button variant="ghost" className="gap-2">
                  <Plus className="h-5 w-5" />
                  Add New Section
                </Button>
                <p className="text-sm text-muted-foreground mt-2">
                  Create custom sections or add from templates
                </p>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Recommendations Tab */}
          <TabsContent value="recommendations" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>AI-Powered Recommendations</CardTitle>
                <CardDescription>Configure recommendation algorithm settings</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="ai-enabled">Enable AI Recommendations</Label>
                    <p className="text-sm text-muted-foreground">Use AI to suggest books to users</p>
                  </div>
                  <Switch id="ai-enabled" defaultChecked />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="ai-provider">AI Provider</Label>
                  <Select defaultValue="openai">
                    <SelectTrigger id="ai-provider">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="openai">OpenAI</SelectItem>
                      <SelectItem value="anthropic">Anthropic</SelectItem>
                      <SelectItem value="custom">Custom</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="ai-model">AI Model</Label>
                  <Input id="ai-model" defaultValue="gpt-4-turbo" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="collaborative-weight">Collaborative Filtering Weight</Label>
                  <Input id="collaborative-weight" type="number" defaultValue="40" />
                  <p className="text-xs text-muted-foreground">Percentage (0-100)</p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="content-weight">Content-Based Weight</Label>
                  <Input id="content-weight" type="number" defaultValue="30" />
                  <p className="text-xs text-muted-foreground">Percentage (0-100)</p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="trending-weight">Trending Weight</Label>
                  <Input id="trending-weight" type="number" defaultValue="20" />
                  <p className="text-xs text-muted-foreground">Percentage (0-100)</p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="new-releases-weight">New Releases Weight</Label>
                  <Input id="new-releases-weight" type="number" defaultValue="10" />
                  <p className="text-xs text-muted-foreground">Percentage (0-100)</p>
                </div>
                <Button>Save Changes</Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Book of the Day Tab */}
          <TabsContent value="book-of-day" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Book of the Day</CardTitle>
                <CardDescription>Schedule featured books to highlight on the homepage</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="botd-book">Select Book</Label>
                  <Select>
                    <SelectTrigger id="botd-book">
                      <SelectValue placeholder="Choose a book..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">The Midnight Library</SelectItem>
                      <SelectItem value="2">Atomic Habits</SelectItem>
                      <SelectItem value="3">The Great Gatsby</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="botd-date">Featured Date</Label>
                  <Input id="botd-date" type="date" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="botd-description">Description</Label>
                  <Textarea id="botd-description" placeholder="Why this book is special..." />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="botd-display-order">Display Order</Label>
                  <Input id="botd-display-order" type="number" defaultValue="1" />
                </div>
                <Button>Schedule Book</Button>

                <div className="border-t pt-6">
                  <h3 className="font-semibold mb-4">Scheduled Books</h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                      <div>
                        <p className="font-medium">The Midnight Library</p>
                        <p className="text-sm text-muted-foreground">Feb 1, 2024</p>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm"><Pencil className="h-4 w-4" /></Button>
                        <Button variant="outline" size="sm"><Trash2 className="h-4 w-4" /></Button>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Author of the Day Tab */}
          <TabsContent value="author-of-day" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Author of the Day</CardTitle>
                <CardDescription>Schedule featured authors to highlight on the homepage</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="aotd-author">Select Author</Label>
                  <Select>
                    <SelectTrigger id="aotd-author">
                      <SelectValue placeholder="Choose an author..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">Matt Haig</SelectItem>
                      <SelectItem value="2">James Clear</SelectItem>
                      <SelectItem value="3">F. Scott Fitzgerald</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="aotd-date">Featured Date</Label>
                  <Input id="aotd-date" type="date" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="aotd-description">Description</Label>
                  <Textarea id="aotd-description" placeholder="Why this author is special..." />
                </div>
                <Button>Schedule Author</Button>

                <div className="border-t pt-6">
                  <h3 className="font-semibold mb-4">Scheduled Authors</h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                      <div>
                        <p className="font-medium">Matt Haig</p>
                        <p className="text-sm text-muted-foreground">Feb 1, 2024</p>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm"><Pencil className="h-4 w-4" /></Button>
                        <Button variant="outline" size="sm"><Trash2 className="h-4 w-4" /></Button>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Coupons Tab */}
          <TabsContent value="coupons" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Discount Coupons</CardTitle>
                    <CardDescription>Create and manage discount coupons</CardDescription>
                  </div>
                  <Button onClick={() => setIsCouponModalOpen(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Coupon
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <AdminDataTable
                  columns={couponColumns}
                  data={mockCoupons}
                  searchable={true}
                  searchPlaceholder="Search by code..."
                  selectable={true}
                  pagination={true}
                  pageSize={10}
                  onRowClick={(coupon) => {
                    // Open coupon edit modal
                  }}
                />
              </CardContent>
            </Card>
          </TabsContent>

          {/* Algorithms Tab */}
          <TabsContent value="algorithms" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>User Personalization Algorithms</CardTitle>
                <CardDescription>Configure how user personalization works</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="personalization-enabled">Enable Personalization</Label>
                    <p className="text-sm text-muted-foreground">Customize experience based on user behavior</p>
                  </div>
                  <Switch id="personalization-enabled" defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="browse-history">Track Browse History</Label>
                    <p className="text-sm text-muted-foreground">Use browsing to improve recommendations</p>
                  </div>
                  <Switch id="browse-history" defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="purchase-history">Track Purchase History</Label>
                    <p className="text-sm text-muted-foreground">Use purchases to improve recommendations</p>
                  </div>
                  <Switch id="purchase-history" defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="roulette-enabled">Book Roulette</Label>
                    <p className="text-sm text-muted-foreground">Allow users to discover random books</p>
                  </div>
                  <Switch id="roulette-enabled" defaultChecked />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="roulette-daily-limit">Roulette Daily Limit</Label>
                  <Input id="roulette-daily-limit" type="number" defaultValue="10" />
                  <p className="text-xs text-muted-foreground">Maximum spins per user per day</p>
                </div>
                <Button>Save Changes</Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Coupon Edit Modal */}
        <Dialog open={isCouponModalOpen} onOpenChange={setIsCouponModalOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Coupon</DialogTitle>
              <DialogDescription>Create a new discount coupon</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="coupon-code">Code</Label>
                <Input id="coupon-code" placeholder="SUMMER20" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="coupon-type">Discount Type</Label>
                  <Select>
                    <SelectTrigger id="coupon-type">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="percentage">Percentage</SelectItem>
                      <SelectItem value="fixed">Fixed Amount</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="coupon-value">Discount Value</Label>
                  <Input id="coupon-value" type="number" placeholder="20" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="coupon-min">Min Purchase</Label>
                  <Input id="coupon-min" type="number" placeholder="0" />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="coupon-limit">Usage Limit</Label>
                  <Input id="coupon-limit" type="number" placeholder="100" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="coupon-start">Valid From</Label>
                  <Input id="coupon-start" type="date" />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="coupon-end">Valid Until</Label>
                  <Input id="coupon-end" type="date" />
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsCouponModalOpen(false)}>Cancel</Button>
              <Button>
                <Save className="h-4 w-4 mr-2" />
                Create Coupon
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </PageBody>
  );
}
