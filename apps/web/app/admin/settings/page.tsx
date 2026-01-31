'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
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
  X,
  Check,
  Loader2,
  AlertCircle,
} from 'lucide-react';
import { format } from 'date-fns';
import { useDrag, useDrop, DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';

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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@kit/ui/alert-dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@kit/ui/tabs';
import { cn } from '@kit/ui/utils';
import { AdminDataTable, FilterConfig } from '../_components/admin-data-table';

// Types
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

interface SectionConfig {
  id: string;
  section_id: string;
  section_title: string;
  section_description: string | null;
  enabled: boolean;
  order: number;
  config: Record<string, unknown>;
}

interface Book {
  id: string;
  title: string;
  subtitle: string | null;
  author_id: string;
  authors?: { id: string; name: string } | null;
  cover_image_url: string | null;
  price: number;
  rating: number | null;
  is_featured: boolean | null;
  is_bestseller: boolean | null;
  is_new_release: boolean | null;
}

interface Author {
  id: string;
  name: string;
  bio: string | null;
  avatar_url: string | null;
  book_count?: number;
}

interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  icon: string | null;
  book_count: number | null;
  display_order: number | null;
}

// Mock coupons
const mockCoupons: Coupon[] = [
  { id: 'c1', code: 'SUMMER20', discountType: 'percentage', discountValue: 20, usageLimit: 100, usedCount: 45, validFrom: new Date('2024-01-01'), validUntil: new Date('2024-12-31'), isActive: true },
  { id: 'c2', code: 'WELCOME10', discountType: 'fixed', discountValue: 10, usageLimit: 500, usedCount: 123, validFrom: new Date('2024-01-01'), validUntil: new Date('2024-06-30'), isActive: true },
];

// Drag and Drop Types
const ItemType = 'SECTION';

// Draggable Section Card Component
interface DraggableSectionCardProps {
  section: SectionConfig;
  index: number;
  moveSection: (dragIndex: number, hoverIndex: number) => void;
  expandedSection: string | null;
  setExpandedSection: (id: string | null) => void;
  onSectionChange: (sectionId: string, updates: Partial<SectionConfig>) => void;
  books: Book[];
  authors: Author[];
  categories: Category[];
}

function DraggableSectionCard({
  section,
  index,
  moveSection,
  expandedSection,
  setExpandedSection,
  onSectionChange,
  books,
  authors,
  categories,
}: DraggableSectionCardProps) {
  const ref = useRef<HTMLDivElement>(null);

  const [{ isDragging }, drag] = useDrag({
    type: ItemType,
    item: { index },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  const [, drop] = useDrop({
    accept: ItemType,
    hover(item: { index: number }, monitor) {
      if (!ref.current) {
        return;
      }
      const dragIndex = item.index;
      const hoverIndex = index;

      if (dragIndex === hoverIndex) {
        return;
      }

      moveSection(dragIndex, hoverIndex);
      item.index = hoverIndex;
    },
  });

  drag(drop(ref));

  const isExpanded = expandedSection === section.section_id;

  const sectionIcons: Record<string, React.ElementType> = {
    hero: Layers,
    categories: AlignHorizontalSpaceAround,
    'book-of-the-day': BookOpen,
    'author-of-the-day': User,
    'recommended-books': Star,
    'for-you': Sparkles,
    'book-roulette': Shuffle,
    search: Search,
  };

  const Icon = sectionIcons[section.section_id] || Layers;

  return (
    <div ref={ref} className={cn(isDragging && 'opacity-50')}>
      <Card
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
              <h3 className="font-semibold text-lg">{section.section_title}</h3>
              <Badge variant={section.enabled ? 'default' : 'secondary'} className="gap-1">
                Order {section.order}
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground mt-0.5">{section.section_description}</p>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2">
            <Switch
              checked={section.enabled}
              onCheckedChange={(checked) => onSectionChange(section.section_id, { enabled: checked })}
            />
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setExpandedSection(isExpanded ? null : section.section_id)}
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
                <p className="font-medium mt-1">{section.order}</p>
              </div>
              <div className="bg-background rounded-lg p-3 border">
                <p className="text-xs text-muted-foreground">Config Items</p>
                <p className="font-medium mt-1">{Object.keys(section.config).length}</p>
              </div>
              <div className="bg-background rounded-lg p-3 border">
                <p className="text-xs text-muted-foreground">Section ID</p>
                <p className="font-mono text-sm mt-1">{section.section_id}</p>
              </div>
            </div>

            {/* Configuration Form */}
            <div>
              <h4 className="font-semibold mb-4 flex items-center gap-2">
                <SlidersHorizontal className="h-4 w-4" />
                Section Configuration
              </h4>

              {/* Render config fields based on section type */}
              <SectionConfigFields
                section={section}
                onChange={(updates) => onSectionChange(section.section_id, updates)}
                books={books}
                authors={authors}
                categories={categories}
              />
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}

// Section Config Fields Component with real data
interface SectionConfigFieldsProps {
  section: SectionConfig;
  onChange: (updates: Partial<SectionConfig>) => void;
  books: Book[];
  authors: Author[];
  categories: Category[];
}

function SectionConfigFields({ section, onChange, books, authors, categories }: SectionConfigFieldsProps) {
  const config = section.config as Record<string, unknown>;

  const updateConfig = (key: string, value: unknown) => {
    onChange({
      config: {
        ...config,
        [key]: value,
      },
    });
  };

  if (section.section_id === 'hero') {
    return (
      <div className="space-y-6">
        {/* Featured Author Selection */}
        <div className="space-y-4">
          <h4 className="font-semibold flex items-center gap-2">
            <User className="h-4 w-4" />
            Featured Author
          </h4>
          <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
            <div>
              <Label htmlFor={`${section.section_id}-auto-rotate`}>Enable Author Auto-Rotation</Label>
              <p className="text-xs text-muted-foreground">Automatically pick a random author each day</p>
            </div>
            <Switch
              id={`${section.section_id}-auto-rotate`}
              checked={Boolean(config.autoRotateAuthor)}
              onCheckedChange={(checked) => updateConfig('autoRotateAuthor', checked)}
            />
          </div>
          {(!Boolean(config.autoRotateAuthor) || Boolean(config.featuredAuthorId)) && (
            <div className="space-y-2">
              <Label htmlFor={`${section.section_id}-author`}>Select Featured Author</Label>
              <Select
                value={(config.featuredAuthorId as string) || ''}
                onValueChange={(value) => updateConfig('featuredAuthorId', value)}
              >
                <SelectTrigger id={`${section.section_id}-author`}>
                  <SelectValue placeholder="Select an author to feature..." />
                </SelectTrigger>
                <SelectContent>
                  {authors.map((author) => (
                    <SelectItem key={author.id} value={author.id}>
                      {author.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
        </div>
      </div>
    );
  }

  if (section.section_id === 'categories') {
    const selectedIds = (config.selectedCategoryIds as string[]) || [];

    return (
      <div className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor={`${section.section_id}-title`}>Section Title</Label>
          <Input
            id={`${section.section_id}-title`}
            value={config.title as string || ''}
            onChange={(e) => updateConfig('title', e.target.value)}
            placeholder="Browse by Category"
          />
        </div>

        <div className="space-y-3">
          <Label>Select Categories to Display</Label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {categories.map((cat) => (
              <div
                key={cat.id}
                className="flex items-center gap-3 p-3 border rounded-lg hover:bg-muted/50 cursor-pointer"
                onClick={() => {
                  if (selectedIds.includes(cat.id)) {
                    updateConfig('selectedCategoryIds', selectedIds.filter((id) => id !== cat.id));
                  } else {
                    updateConfig('selectedCategoryIds', [...selectedIds, cat.id]);
                  }
                }}
              >
                <Switch
                  id={`cat-${cat.id}`}
                  checked={selectedIds.includes(cat.id)}
                  onCheckedChange={() => {}}
                />
                <Label htmlFor={`cat-${cat.id}`} className="flex-1 cursor-pointer">{cat.name}</Label>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (section.section_id === 'book-of-the-day') {
    return (
      <div className="space-y-6">
        <div className="space-y-3">
          <Label>Select Featured Book</Label>
          <Select
            value={config.bookId as string || ''}
            onValueChange={(value) => updateConfig('bookId', value)}
          >
            <SelectTrigger id={`${section.section_id}-book`}>
              <SelectValue placeholder="Choose a book to feature..." />
            </SelectTrigger>
            <SelectContent>
              {books.map((book) => (
                <SelectItem key={book.id} value={book.id}>
                  {book.title} - {book.authors?.name || 'Unknown Author'}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor={`${section.section_id}-layout`}>Layout Style</Label>
          <Select
            value={config.layout as string || 'mercury'}
            onValueChange={(value) => updateConfig('layout', value)}
          >
            <SelectTrigger id={`${section.section_id}-layout`}>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="mercury">Mercury</SelectItem>
              <SelectItem value="venus">Venus</SelectItem>
              <SelectItem value="mars">Mars</SelectItem>
              <SelectItem value="jupiter">Jupiter</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor={`${section.section_id}-reason`}>Feature Reason</Label>
          <Textarea
            id={`${section.section_id}-reason`}
            value={config.reason as string || ''}
            onChange={(e) => updateConfig('reason', e.target.value)}
            placeholder="Why this book is special..."
            rows={3}
          />
        </div>
      </div>
    );
  }

  if (section.section_id === 'author-of-the-day') {
    return (
      <div className="space-y-6">
        <div className="space-y-3">
          <Label>Select Featured Author</Label>
          <Select
            value={config.authorId as string || ''}
            onValueChange={(value) => updateConfig('authorId', value)}
          >
            <SelectTrigger id={`${section.section_id}-author`}>
              <SelectValue placeholder="Choose an author to feature..." />
            </SelectTrigger>
            <SelectContent>
              {authors.map((author) => (
                <SelectItem key={author.id} value={author.id}>
                  {author.name} ({author.book_count || 0} books)
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor={`${section.section_id}-layout`}>Layout Style</Label>
          <Select
            value={config.layout as string || 'mercury'}
            onValueChange={(value) => updateConfig('layout', value)}
          >
            <SelectTrigger id={`${section.section_id}-layout`}>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="mercury">Mercury</SelectItem>
              <SelectItem value="venus">Venus</SelectItem>
              <SelectItem value="mars">Mars</SelectItem>
              <SelectItem value="jupiter">Jupiter</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor={`${section.section_id}-max`}>Max Books to Show</Label>
          <Input
            id={`${section.section_id}-max`}
            type="number"
            value={config.maxBooks as number || 3}
            onChange={(e) => updateConfig('maxBooks', parseInt(e.target.value) || 3)}
            min={1}
            max={10}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor={`${section.section_id}-reason`}>Feature Reason</Label>
          <Textarea
            id={`${section.section_id}-reason`}
            value={config.reason as string || ''}
            onChange={(e) => updateConfig('reason', e.target.value)}
            placeholder="Why this author is special..."
            rows={3}
          />
        </div>
      </div>
    );
  }

  if (section.section_id === 'recommended-books') {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor={`${section.section_id}-title`}>Section Title</Label>
            <Input
              id={`${section.section_id}-title`}
              value={config.title as string || ''}
              onChange={(e) => updateConfig('title', e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor={`${section.section_id}-subtitle`}>Subtitle</Label>
            <Input
              id={`${section.section_id}-subtitle`}
              value={config.subtitle as string || ''}
              onChange={(e) => updateConfig('subtitle', e.target.value)}
            />
          </div>
        </div>

        <div className="space-y-3">
          <Label>Book Selection Source</Label>
          <Select
            value={config.source as string || 'bestsellers'}
            onValueChange={(value) => updateConfig('source', value)}
          >
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

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor={`${section.section_id}-count`}>Number of Books</Label>
            <Input
              id={`${section.section_id}-count`}
              type="number"
              value={config.bookCount as number || 6}
              onChange={(e) => updateConfig('bookCount', parseInt(e.target.value) || 6)}
              min={1}
              max={24}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor={`${section.section_id}-layout`}>Layout</Label>
            <Select
              value={config.layout as string || 'grid'}
              onValueChange={(value) => updateConfig('layout', value)}
            >
              <SelectTrigger id={`${section.section_id}-layout`}>
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

        <div className="space-y-2">
          <Label>Card Display Options</Label>
          <div className="flex flex-wrap gap-2">
            <Badge
              variant={config.showRating ? 'default' : 'outline'}
              className="cursor-pointer hover:bg-orange-50"
              onClick={() => updateConfig('showRating', !(config.showRating as boolean))}
            >
              Rating
            </Badge>
            <Badge
              variant={config.showAuthor ? 'default' : 'outline'}
              className="cursor-pointer hover:bg-orange-50"
              onClick={() => updateConfig('showAuthor', !(config.showAuthor as boolean))}
            >
              Author
            </Badge>
          </div>
        </div>
      </div>
    );
  }

  if (section.section_id === 'for-you') {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor={`${section.section_id}-title`}>Section Title</Label>
            <Input
              id={`${section.section_id}-title`}
              value={config.title as string || ''}
              onChange={(e) => updateConfig('title', e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor={`${section.section_id}-subtitle`}>Subtitle</Label>
            <Input
              id={`${section.section_id}-subtitle`}
              value={config.subtitle as string || ''}
              onChange={(e) => updateConfig('subtitle', e.target.value)}
            />
          </div>
        </div>

        <div className="space-y-3">
          <Label>Book Selection Source</Label>
          <Select
            value={config.source as string || 'new-releases'}
            onValueChange={(value) => updateConfig('source', value)}
          >
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

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor={`${section.section_id}-category`}>Filter by Category</Label>
            <Select
              value={config.categoryId as string || 'all'}
              onValueChange={(value) => updateConfig('categoryId', value === 'all' ? null : value)}
            >
              <SelectTrigger id={`${section.section_id}-category`}>
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map((cat) => (
                  <SelectItem key={cat.id} value={cat.id}>
                    {cat.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor={`${section.section_id}-count`}>Number of Books</Label>
            <Input
              id={`${section.section_id}-count`}
              type="number"
              value={config.bookCount as number || 12}
              onChange={(e) => updateConfig('bookCount', parseInt(e.target.value) || 12)}
              min={1}
              max={24}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor={`${section.section_id}-layout`}>Layout</Label>
            <Select
              value={config.layout as string || 'horizontal-scroll'}
              onValueChange={(value) => updateConfig('layout', value)}
            >
              <SelectTrigger id={`${section.section_id}-layout`}>
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
              <Badge
                variant={config.showNewBadge ? 'default' : 'outline'}
                className="cursor-pointer hover:bg-orange-50"
                onClick={() => updateConfig('showNewBadge', !(config.showNewBadge as boolean))}
              >
                New Badge
              </Badge>
              <Badge
                variant={config.showDiscount ? 'default' : 'outline'}
                className="cursor-pointer hover:bg-orange-50"
                onClick={() => updateConfig('showDiscount', !(config.showDiscount as boolean))}
              >
                Discount
              </Badge>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (section.section_id === 'book-roulette') {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor={`${section.section_id}-title`}>Section Title</Label>
            <Input
              id={`${section.section_id}-title`}
              value={config.title as string || ''}
              onChange={(e) => updateConfig('title', e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor={`${section.section_id}-desc`}>Description</Label>
            <Input
              id={`${section.section_id}-desc`}
              value={config.description as string || ''}
              onChange={(e) => updateConfig('description', e.target.value)}
            />
          </div>
        </div>

        <div className="space-y-3">
          <Label>Book Pool Source</Label>
          <Select
            value={config.source as string || 'all'}
            onValueChange={(value) => updateConfig('source', value)}
          >
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

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label htmlFor={`${section.section_id}-category`}>Filter by Category</Label>
            <Select
              value={config.categoryId as string || 'all'}
              onValueChange={(value) => updateConfig('categoryId', value === 'all' ? null : value)}
            >
              <SelectTrigger id={`${section.section_id}-category`}>
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map((cat) => (
                  <SelectItem key={cat.id} value={cat.id}>
                    {cat.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor={`${section.section_id}-limit`}>Daily Spin Limit</Label>
            <Input
              id={`${section.section_id}-limit`}
              type="number"
              value={config.dailyLimit as number || 10}
              onChange={(e) => updateConfig('dailyLimit', parseInt(e.target.value) || 10)}
              min={1}
              max={100}
            />
          </div>
          <div className="flex items-end">
            <Switch
              id={`${section.section_id}-anim`}
              checked={config.showAnimation as boolean}
              onCheckedChange={(checked) => updateConfig('showAnimation', checked)}
            />
            <Label htmlFor={`${section.section_id}-anim`} className="ml-2">Animation</Label>
          </div>
        </div>
      </div>
    );
  }

  if (section.section_id === 'search') {
    return (
      <div className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor={`${section.section_id}-title`}>Section Title</Label>
          <Input
            id={`${section.section_id}-title`}
            value={config.title as string || ''}
            onChange={(e) => updateConfig('title', e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor={`${section.section_id}-placeholder`}>Search Placeholder</Label>
          <Input
            id={`${section.section_id}-placeholder`}
            value={config.placeholder as string || ''}
            onChange={(e) => updateConfig('placeholder', e.target.value)}
            placeholder="Search by title, author, ISBN..."
          />
        </div>

        <div className="space-y-3">
          <Label>Available Filters</Label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {[
              { key: 'filterCategories', label: 'Category', defaultKey: 'filterCategories' },
              { key: 'filterAuthors', label: 'Author', defaultKey: 'filterAuthors' },
              { key: 'filterPrice', label: 'Price Range', defaultKey: 'filterPrice' },
              { key: 'filterRating', label: 'Rating', defaultKey: 'filterRating' },
              { key: 'filterFormat', label: 'Format', defaultKey: 'filterFormat' },
              { key: 'filterLanguage', label: 'Language', defaultKey: 'filterLanguage' },
            ].map((filter) => (
              <div key={filter.key} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-2">
                  <Switch
                    id={`${section.section_id}-${filter.key}`}
                    checked={config[filter.key] as boolean}
                    onCheckedChange={(checked) => updateConfig(filter.key, checked)}
                  />
                  <Label htmlFor={`${section.section_id}-${filter.key}`} className="cursor-pointer">{filter.label}</Label>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex items-center justify-between bg-background rounded-lg p-3 border">
            <div>
              <Label htmlFor={`${section.section_id}-filters`}>Show Filters Panel</Label>
              <p className="text-xs text-muted-foreground">Display filter options by default</p>
            </div>
            <Switch
              id={`${section.section_id}-filters`}
              checked={config.showFilters as boolean}
              onCheckedChange={(checked) => updateConfig('showFilters', checked)}
            />
          </div>
          <div className="flex items-center justify-between bg-background rounded-lg p-3 border">
            <div>
              <Label htmlFor={`${section.section_id}-suggestions`}>Show Suggestions</Label>
              <p className="text-xs text-muted-foreground">Auto-complete suggestions</p>
            </div>
            <Switch
              id={`${section.section_id}-suggestions`}
              checked={config.showSuggestions as boolean}
              onCheckedChange={(checked) => updateConfig('showSuggestions', checked)}
            />
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

function AdminSettingsPage() {
  const [activeTab, setActiveTab] = useState('homepage');
  const [isCouponModalOpen, setIsCouponModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveDialogOpen, setSaveDialogOpen] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [saveStatus, setSaveStatus] = useState<{ type: 'idle' | 'success' | 'error'; message: string }>({
    type: 'idle',
    message: '',
  });

  // Homepage sections state
  const [sections, setSections] = useState<SectionConfig[]>([]);
  const [expandedSection, setExpandedSection] = useState<string | null>(null);
  const [originalSections, setOriginalSections] = useState<SectionConfig[]>([]);

  // Real data state
  const [books, setBooks] = useState<Book[]>([]);
  const [authors, setAuthors] = useState<Author[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(true);

  // Fetch homepage configuration
  const fetchHomepageConfig = useCallback(async () => {
    try {
      const response = await fetch('/api/homepage-config');
      const result = await response.json();

      if (result.data) {
        const formatted = result.data.map((s: any) => ({
          id: s.id,
          section_id: s.section_id,
          section_title: s.section_title,
          section_description: s.section_description,
          enabled: s.enabled,
          order: s.display_order,
          config: s.config,
        }));
        setSections(formatted);
        setOriginalSections(JSON.parse(JSON.stringify(formatted)));
      }
    } catch (error) {
      console.error('Failed to fetch homepage config:', error);
    }
  }, []);

  // Fetch books, authors, categories
  const fetchReferenceData = useCallback(async () => {
    setIsLoadingData(true);
    try {
      const [booksRes, authorsRes, categoriesRes] = await Promise.all([
        fetch('/api/books'),
        fetch('/api/authors'),
        fetch('/api/categories'),
      ]);

      const [booksData, authorsData, categoriesData] = await Promise.all([
        booksRes.json(),
        authorsRes.json(),
        categoriesRes.json(),
      ]);

      if (booksData.data) setBooks(booksData.data);
      if (authorsData.data) setAuthors(authorsData.data);
      if (categoriesData.data) setCategories(categoriesData.data);
    } catch (error) {
      console.error('Failed to fetch reference data:', error);
    } finally {
      setIsLoadingData(false);
    }
  }, []);

  useEffect(() => {
    if (activeTab === 'homepage') {
      fetchHomepageConfig();
      fetchReferenceData();
    }
  }, [activeTab, fetchHomepageConfig, fetchReferenceData]);

  // Check for unsaved changes
  useEffect(() => {
    const hasChanges = JSON.stringify(sections) !== JSON.stringify(originalSections);
    setHasUnsavedChanges(hasChanges);
  }, [sections, originalSections]);

  // Move section (for drag and drop)
  const moveSection = useCallback((dragIndex: number, hoverIndex: number) => {
    setSections((prevSections) => {
      const newSections = [...prevSections];
      const [draggedSection] = newSections.splice(dragIndex, 1);

      if (!draggedSection) {
        return prevSections;
      }

      newSections.splice(hoverIndex, 0, draggedSection);

      // Update order values
      return newSections.map((section, index) => ({
        ...section,
        order: index + 1,
      }));
    });
  }, []);

  // Handle section change
  const handleSectionChange = useCallback((sectionId: string, updates: Partial<SectionConfig>) => {
    setSections((prev) =>
      prev.map((section) =>
        section.section_id === sectionId ? { ...section, ...updates } : section
      )
    );
  }, []);

  // Save all changes
  const saveAllChanges = async () => {
    setIsSaving(true);
    setSaveStatus({ type: 'idle', message: '' });

    try {
      const response = await fetch('/api/homepage-config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sections: sections.map((s) => ({
            section_id: s.section_id,
            enabled: s.enabled,
            display_order: s.order,
            config: s.config,
          })),
        }),
      });

      const result = await response.json();

      if (response.ok) {
        setOriginalSections(JSON.parse(JSON.stringify(sections)));
        setSaveStatus({ type: 'success', message: 'Homepage layout saved successfully!' });
      } else {
        setSaveStatus({ type: 'error', message: result.error || 'Failed to save changes' });
      }
    } catch (error) {
      setSaveStatus({ type: 'error', message: 'Network error while saving' });
    } finally {
      setIsSaving(false);
      setTimeout(() => {
        setSaveDialogOpen(false);
        if (saveStatus.type === 'success') {
          setSaveStatus({ type: 'idle', message: '' });
        }
      }, 1500);
    }
  };

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
        <Tabs defaultValue="homepage" value={activeTab} onValueChange={setActiveTab}>
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
                  <Button
                    className="gap-2"
                    disabled={!hasUnsavedChanges || isSaving}
                    onClick={() => setSaveDialogOpen(true)}
                  >
                    {isSaving ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Save className="h-4 w-4" />
                    )}
                    Save All Changes
                  </Button>
                </div>
                {saveStatus.type !== 'idle' && (
                  <div className={cn(
                    'mt-4 p-3 rounded-lg flex items-center gap-2',
                    saveStatus.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  )}>
                    {saveStatus.type === 'success' ? (
                      <Check className="h-4 w-4" />
                    ) : (
                      <AlertCircle className="h-4 w-4" />
                    )}
                    <span className="text-sm font-medium">{saveStatus.message}</span>
                  </div>
                )}
              </CardHeader>
            </Card>

            {/* Sections Grid */}
            <DndProvider backend={HTML5Backend}>
              <div className="space-y-4">
                {isLoadingData ? (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                  </div>
                ) : (
                  sections
                    .sort((a, b) => a.order - b.order)
                    .map((section, index) => (
                      <DraggableSectionCard
                        key={section.section_id}
                        section={section}
                        index={index}
                        moveSection={moveSection}
                        expandedSection={expandedSection}
                        setExpandedSection={setExpandedSection}
                        onSectionChange={handleSectionChange}
                        books={books}
                        authors={authors}
                        categories={categories}
                      />
                    ))
                )}
              </div>
            </DndProvider>
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
                      {books.slice(0, 5).map((book) => (
                        <SelectItem key={book.id} value={book.id}>
                          {book.title}
                        </SelectItem>
                      ))}
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
                      {authors.slice(0, 5).map((author) => (
                        <SelectItem key={author.id} value={author.id}>
                          {author.name}
                        </SelectItem>
                      ))}
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
                  onRowClick={(coupon) => {}}
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

        {/* Save Confirmation Dialog */}
        <AlertDialog open={saveDialogOpen} onOpenChange={setSaveDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Save Homepage Layout?</AlertDialogTitle>
              <AlertDialogDescription>
                This will save all your changes to the homepage layout configuration. The changes will be immediately visible to all users.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel disabled={isSaving}>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={(e) => {
                  e.preventDefault();
                  saveAllChanges();
                }}
                disabled={isSaving}
                className="bg-orange-600 hover:bg-orange-700"
              >
                {isSaving ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  'Save Changes'
                )}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

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

export default AdminSettingsPage;
