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
  description: string | null;
  discount_type: 'percentage' | 'fixed';
  discount_value: number;
  min_purchase_amount: number;
  max_discount_amount: number | null;
  usage_limit: number | null;
  used_count: number;
  valid_from: string;
  valid_until: string;
  is_active: boolean;
  free_shipping: boolean;
  created_at: string;
  updated_at: string;
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

interface AIConfig {
  deployment_type: 'cloud' | 'local';
  cloud_provider: 'deepseek' | 'openai' | 'zai' | null;
  local_provider: 'ollama' | null;
  ollama_url: string | null;
  ollama_model: string | null;
  model: string | null;
  config: Record<string, unknown>;
}

// Coupon form state
interface CouponFormData {
  code: string;
  description: string;
  discount_type: 'percentage' | 'fixed';
  discount_value: string;
  min_purchase_amount: string;
  max_discount_amount: string;
  usage_limit: string;
  valid_from: string;
  valid_until: string;
  is_active: boolean;
  free_shipping: boolean;
}

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

  if (section.section_id === 'recommended-books') {
    const selectedBookIds = (config.selectedBookIds as string[]) || [];
    const [searchQuery, setSearchQuery] = useState('');
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);

    // Filter books based on search query (title or author)
    const filteredBooks = books.filter((book) => {
      if (!searchQuery) return true;
      const query = searchQuery.toLowerCase();
      const titleMatch = book.title.toLowerCase().includes(query);
      const authorMatch = book.authors?.name?.toLowerCase().includes(query) ?? false;
      return titleMatch || authorMatch;
    });

    // Get selected book objects
    const selectedBooks = books.filter((book) => selectedBookIds.includes(book.id));

    const addBook = (bookId: string) => {
      if (selectedBookIds.length >= 6) return;
      if (!selectedBookIds.includes(bookId)) {
        updateConfig('selectedBookIds', [...selectedBookIds, bookId]);
      }
      setSearchQuery('');
      setIsDropdownOpen(false);
    };

    const removeBook = (bookId: string) => {
      updateConfig('selectedBookIds', selectedBookIds.filter((id) => id !== bookId));
    };

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
          <div className="flex items-center justify-between">
            <Label>Select Books (Max 6)</Label>
            <Badge variant="outline">{selectedBookIds.length}/6</Badge>
          </div>

          {/* Search and Add Books */}
          <div className="relative">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by title or author..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setIsDropdownOpen(true);
                }}
                onFocus={() => setIsDropdownOpen(true)}
                className="pl-9"
              />
            </div>

            {/* Dropdown */}
            {isDropdownOpen && searchQuery && (
              <div className="absolute z-10 mt-1 w-full bg-background border rounded-lg shadow-lg max-h-60 overflow-auto">
                {filteredBooks.length === 0 ? (
                  <div className="p-4 text-sm text-muted-foreground text-center">
                    No books found
                  </div>
                ) : (
                  filteredBooks.map((book) => {
                    const isSelected = selectedBookIds.includes(book.id);
                    return (
                      <div
                        key={book.id}
                        className={`p-3 border-b last:border-b-0 cursor-pointer transition-colors ${
                          isSelected
                            ? 'bg-muted/50 opacity-50 cursor-not-allowed'
                            : 'hover:bg-muted/50'
                        }`}
                        onClick={() => !isSelected && addBook(book.id)}
                      >
                        <div className="flex items-center gap-3">
                          {book.cover_image_url && (
                            <img
                              src={book.cover_image_url}
                              alt={book.title}
                              className="w-10 h-14 object-cover rounded"
                            />
                          )}
                          <div className="flex-1 min-w-0">
                            <p className="font-medium truncate">{book.title}</p>
                            <p className="text-sm text-muted-foreground truncate">
                              {book.authors?.name || 'Unknown Author'}
                            </p>
                          </div>
                          {isSelected && (
                            <Check className="h-4 w-4 text-green-600 shrink-0" />
                          )}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            )}
          </div>

          {/* Selected Books List */}
          {selectedBooks.length > 0 && (
            <div className="space-y-2">
              <Label className="text-sm text-muted-foreground">Selected Books</Label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {selectedBooks.map((book) => (
                  <div
                    key={book.id}
                    className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg group"
                  >
                    {book.cover_image_url && (
                      <img
                        src={book.cover_image_url}
                        alt={book.title}
                        className="w-10 h-14 object-cover rounded"
                      />
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">{book.title}</p>
                      <p className="text-xs text-muted-foreground truncate">
                        {book.authors?.name || 'Unknown Author'}
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() => removeBook(book.id)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Quick Select from List */}
          {selectedBookIds.length < 6 && !searchQuery && (
            <details className="group">
              <summary className="cursor-pointer text-sm text-muted-foreground hover:text-foreground list-none flex items-center gap-2">
                <ChevronDown className="h-4 w-4 transition-transform group-open:rotate-180" />
                Browse all books to add
              </summary>
              <div className="mt-3 max-h-48 overflow-y-auto space-y-2 pl-6">
                {books
                  .filter((book) => !selectedBookIds.includes(book.id))
                  .slice(0, 20)
                  .map((book) => (
                    <div
                      key={book.id}
                      className="flex items-center gap-3 p-2 hover:bg-muted/50 rounded cursor-pointer"
                      onClick={() => addBook(book.id)}
                    >
                      {book.cover_image_url && (
                        <img
                          src={book.cover_image_url}
                          alt={book.title}
                          className="w-8 h-12 object-cover rounded"
                        />
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{book.title}</p>
                        <p className="text-xs text-muted-foreground truncate">
                          {book.authors?.name || 'Unknown Author'}
                        </p>
                      </div>
                    </div>
                  ))}
              </div>
            </details>
          )}
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
            <Label htmlFor={`${section.section_id}-desc`}>Subtitle</Label>
            <Input
              id={`${section.section_id}-desc`}
              value={config.subtitle as string || ''}
              onChange={(e) => updateConfig('subtitle', e.target.value)}
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor={`${section.section_id}-category`}>Category</Label>
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
          <p className="text-xs text-muted-foreground">Select a category to filter books. If no category is selected, all books will be included.</p>
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
              <SelectItem value="saturn">Saturn</SelectItem>
            </SelectContent>
          </Select>
          <p className="text-xs text-muted-foreground">Choose the visual layout style for search results</p>
        </div>

        <div className="space-y-2">
          <Label htmlFor={`${section.section_id}-pageSize`}>Page Size</Label>
          <Input
            id={`${section.section_id}-pageSize`}
            type="number"
            value={config.pageSize as number || 12}
            onChange={(e) => updateConfig('pageSize', parseInt(e.target.value) || 12)}
            min={6}
            max={48}
            step={6}
          />
          <p className="text-xs text-muted-foreground">Number of results per page (6, 12, 18, 24, 36, or 48)</p>
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
const getCouponColumns = (onEdit: (coupon: Coupon) => void, onDelete: (coupon: Coupon) => void) => [
  {
    accessorKey: 'code',
    header: 'Code',
    cell: ({ row }: any) => <span className="font-mono font-medium">{row.getValue('code')}</span>,
  },
  {
    accessorKey: 'discount_type',
    header: 'Type',
    cell: ({ row }: any) => (
      <Badge variant="outline" className="capitalize">{row.getValue('discount_type')}</Badge>
    ),
  },
  {
    accessorKey: 'discount_value',
    header: 'Discount',
    cell: ({ row }: any) => {
      const coupon = row.original;
      return (
        <span className="font-medium">
          {coupon.discount_type === 'percentage' ? `${coupon.discount_value}%` : `$${coupon.discount_value}`}
        </span>
      );
    },
  },
  {
    accessorKey: 'used_count',
    header: 'Used',
    cell: ({ row }: any) => {
      const coupon = row.original;
      return (
        <span>{coupon.used_count}/{coupon.usage_limit || '∞'}</span>
      );
    },
  },
  {
    accessorKey: 'valid_until',
    header: 'Valid Until',
    cell: ({ row }: any) => <span>{format(new Date(row.getValue('valid_until')), 'MMM d, yyyy')}</span>,
  },
  {
    accessorKey: 'is_active',
    header: 'Status',
    cell: ({ row }: any) => (
      <Badge className={cn(row.getValue('is_active') ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800')}>
        {row.getValue('is_active') ? 'Active' : 'Inactive'}
      </Badge>
    ),
  },
  {
    id: 'actions',
    header: 'Actions',
    cell: ({ row }: any) => {
      const coupon = row.original;
      return (
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              onEdit(coupon);
            }}
          >
            <Pencil className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              onDelete(coupon);
            }}
          >
            <Trash2 className="h-4 w-4 text-red-500" />
          </Button>
        </div>
      );
    },
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

  // Coupons state
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [isLoadingCoupons, setIsLoadingCoupons] = useState(true);
  const [editingCoupon, setEditingCoupon] = useState<Coupon | null>(null);
  const [couponFormData, setCouponFormData] = useState<CouponFormData>({
    code: '',
    description: '',
    discount_type: 'percentage',
    discount_value: '',
    min_purchase_amount: '',
    max_discount_amount: '',
    usage_limit: '',
    valid_from: '',
    valid_until: '',
    is_active: true,
    free_shipping: false,
  });
  const [deleteCouponDialog, setDeleteCouponDialog] = useState<{ open: boolean; coupon: Coupon | null }>({
    open: false,
    coupon: null,
  });
  const [couponActionStatus, setCouponActionStatus] = useState<{ type: 'idle' | 'success' | 'error'; message: string }>({
    type: 'idle',
    message: '',
  });

  // AI Config state
  const [aiConfig, setAiConfig] = useState<AIConfig>({
    deployment_type: 'cloud',
    cloud_provider: 'openai',
    local_provider: null,
    ollama_url: null,
    ollama_model: null,
    model: 'gpt-4o-mini',
    config: {},
  });
  const [originalAiConfig, setOriginalAiConfig] = useState<AIConfig | null>(null);
  const [isLoadingAiConfig, setIsLoadingAiConfig] = useState(false);
  const [ollamaModels, setOllamaModels] = useState<string[]>([]);
  const [isLoadingOllamaModels, setIsLoadingOllamaModels] = useState(false);
  const [ollamaUrlError, setOllamaUrlError] = useState<string | null>(null);
  const [aiConfigSaveStatus, setAiConfigSaveStatus] = useState<{ type: 'idle' | 'success' | 'error'; message: string }>({
    type: 'idle',
    message: '',
  });

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

  // Fetch coupons
  const fetchCoupons = useCallback(async () => {
    setIsLoadingCoupons(true);
    try {
      const response = await fetch('/api/coupons?includeInactive=true');
      const result = await response.json();
      if (result.data) {
        setCoupons(result.data);
      }
    } catch (error) {
      console.error('Failed to fetch coupons:', error);
    } finally {
      setIsLoadingCoupons(false);
    }
  }, []);

  // Fetch AI configuration
  const fetchAIConfig = useCallback(async () => {
    setIsLoadingAiConfig(true);
    try {
      const response = await fetch('/api/ai-config');
      const result = await response.json();
      if (result.data) {
        const config: AIConfig = {
          deployment_type: result.data.deployment_type || 'cloud',
          cloud_provider: result.data.cloud_provider || 'openai',
          local_provider: result.data.local_provider || null,
          ollama_url: result.data.ollama_url || null,
          ollama_model: result.data.ollama_model || null,
          model: result.data.model || 'gpt-4o-mini',
          config: result.data.config || {},
        };
        setAiConfig(config);
        setOriginalAiConfig(JSON.parse(JSON.stringify(config)));
      }
    } catch (error) {
      console.error('Failed to fetch AI config:', error);
    } finally {
      setIsLoadingAiConfig(false);
    }
  }, []);

  // Fetch Ollama models
  const fetchOllamaModels = useCallback(async (url: string) => {
    setIsLoadingOllamaModels(true);
    setOllamaUrlError(null);
    try {
      const response = await fetch(`/api/ai-config/ollama/models?url=${encodeURIComponent(url)}`);
      const result = await response.json();

      if (response.ok) {
        setOllamaModels(result.models || []);
        if (result.models && result.models.length > 0) {
          setAiConfig((prev) => ({ ...prev, ollama_model: prev.ollama_model || result.models[0] }));
        }
      } else {
        setOllamaUrlError(result.error || 'Failed to fetch models');
      }
    } catch (error) {
      setOllamaUrlError(error instanceof Error ? error.message : 'Failed to fetch models');
    } finally {
      setIsLoadingOllamaModels(false);
    }
  }, []);

  // Save AI configuration
  const saveAIConfig = async () => {
    setIsSaving(true);
    setAiConfigSaveStatus({ type: 'idle', message: '' });

    try {
      const response = await fetch('/api/ai-config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(aiConfig),
      });

      const result = await response.json();

      if (response.ok) {
        setOriginalAiConfig(JSON.parse(JSON.stringify(aiConfig)));
        setAiConfigSaveStatus({ type: 'success', message: 'AI configuration saved successfully!' });
      } else {
        setAiConfigSaveStatus({ type: 'error', message: result.error || 'Failed to save AI configuration' });
      }
    } catch (error) {
      setAiConfigSaveStatus({ type: 'error', message: 'Network error while saving' });
    } finally {
      setIsSaving(false);
      setTimeout(() => {
        if (aiConfigSaveStatus.type === 'success') {
          setAiConfigSaveStatus({ type: 'idle', message: '' });
        }
      }, 2000);
    }
  };

  // Open modal for new coupon
  const openNewCouponModal = useCallback(() => {
    setEditingCoupon(null);
    const today = new Date();
    const futureDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
    setCouponFormData({
      code: '',
      description: '',
      discount_type: 'percentage',
      discount_value: '',
      min_purchase_amount: '0',
      max_discount_amount: '',
      usage_limit: '',
      valid_from: today.toISOString().split('T')[0] || today.toISOString().slice(0, 10),
      valid_until: futureDate.toISOString().split('T')[0] || futureDate.toISOString().slice(0, 10),
      is_active: true,
      free_shipping: false,
    });
    setCouponActionStatus({ type: 'idle', message: '' });
    setIsCouponModalOpen(true);
  }, []);

  // Open modal for editing coupon
  const openEditCouponModal = useCallback((coupon: Coupon) => {
    setEditingCoupon(coupon);
    const fromDate = new Date(coupon.valid_from);
    const untilDate = new Date(coupon.valid_until);
    setCouponFormData({
      code: coupon.code,
      description: coupon.description || '',
      discount_type: coupon.discount_type,
      discount_value: String(coupon.discount_value),
      min_purchase_amount: String(coupon.min_purchase_amount),
      max_discount_amount: coupon.max_discount_amount ? String(coupon.max_discount_amount) : '',
      usage_limit: coupon.usage_limit ? String(coupon.usage_limit) : '',
      valid_from: fromDate.toISOString().split('T')[0] || fromDate.toISOString().slice(0, 10),
      valid_until: untilDate.toISOString().split('T')[0] || untilDate.toISOString().slice(0, 10),
      is_active: coupon.is_active,
      free_shipping: coupon.free_shipping,
    });
    setCouponActionStatus({ type: 'idle', message: '' });
    setIsCouponModalOpen(true);
  }, []);

  // Save coupon (create or update)
  const saveCoupon = async () => {
    setCouponActionStatus({ type: 'idle', message: '' });
    setIsSaving(true);

    try {
      const payload: Record<string, unknown> = {
        ...couponFormData,
        discount_value: parseFloat(couponFormData.discount_value),
        min_purchase_amount: parseFloat(couponFormData.min_purchase_amount) || 0,
        max_discount_amount: couponFormData.max_discount_amount ? parseFloat(couponFormData.max_discount_amount) : null,
        usage_limit: couponFormData.usage_limit ? parseInt(couponFormData.usage_limit) : null,
        valid_from: new Date(couponFormData.valid_from).toISOString(),
        valid_until: new Date(couponFormData.valid_until).toISOString(),
      };

      if (editingCoupon) {
        payload.id = editingCoupon.id;
      }

      const response = await fetch('/api/coupons', {
        method: editingCoupon ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (response.ok) {
        setCouponActionStatus({ type: 'success', message: `Coupon ${editingCoupon ? 'updated' : 'created'} successfully!` });
        await fetchCoupons();
        setTimeout(() => {
          setIsCouponModalOpen(false);
        }, 1000);
      } else {
        setCouponActionStatus({ type: 'error', message: result.error || `Failed to ${editingCoupon ? 'update' : 'create'} coupon` });
      }
    } catch (error) {
      setCouponActionStatus({ type: 'error', message: 'Network error while saving coupon' });
    } finally {
      setIsSaving(false);
    }
  };

  // Delete coupon
  const deleteCoupon = async () => {
    if (!deleteCouponDialog.coupon) return;

    setIsSaving(true);
    try {
      const response = await fetch(`/api/coupons?id=${deleteCouponDialog.coupon.id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        await fetchCoupons();
        setDeleteCouponDialog({ open: false, coupon: null });
      } else {
        setCouponActionStatus({ type: 'error', message: 'Failed to delete coupon' });
      }
    } catch (error) {
      setCouponActionStatus({ type: 'error', message: 'Network error while deleting coupon' });
    } finally {
      setIsSaving(false);
    }
  };

  // Calculate coupon statistics
  const couponStats = {
    total: coupons.length,
    active: coupons.filter(c => c.is_active).length,
    expired: coupons.filter(c => new Date(c.valid_until) < new Date()).length,
    totalUsed: coupons.reduce((sum, c) => sum + c.used_count, 0),
    totalDiscountValue: coupons.reduce((sum, c) => {
      if (c.discount_type === 'fixed') {
        return sum + (c.discount_value * c.used_count);
      }
      return sum; // Can't calculate percentage without order data
    }, 0),
  };

  // Update useEffect to fetch data when tab changes
  useEffect(() => {
    if (activeTab === 'homepage') {
      fetchHomepageConfig();
      fetchReferenceData();
    } else if (activeTab === 'coupons') {
      fetchCoupons();
    } else if (activeTab === 'recommendations') {
      fetchAIConfig();
    }
  }, [activeTab, fetchHomepageConfig, fetchReferenceData, fetchCoupons, fetchAIConfig]);

  useEffect(() => {
    if (activeTab === 'homepage') {
      fetchHomepageConfig();
      fetchReferenceData();
    }
  }, [activeTab, fetchHomepageConfig, fetchReferenceData]);

  // Check for unsaved AI changes
  useEffect(() => {
    if (originalAiConfig) {
      const hasChanges = JSON.stringify(aiConfig) !== JSON.stringify(originalAiConfig);
      setHasUnsavedChanges(hasChanges);
    }
  }, [aiConfig, originalAiConfig]);

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
          <TabsList className="grid w-full grid-cols-3 lg:grid-cols-4 h-auto">
            <TabsTrigger value="homepage" className="gap-2">
              <LayoutDashboard className="h-4 w-4" />
              <span className="hidden sm:inline">Home</span>
            </TabsTrigger>
            <TabsTrigger value="recommendations" className="gap-2">
              <Sparkles className="h-4 w-4" />
              <span className="hidden sm:inline">AI Recs</span>
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

          {/* Recommendations Tab - AI Configuration */}
          <TabsContent value="recommendations" className="space-y-6">
            <Card className="bg-gradient-to-br from-orange-50 to-beige-50 dark:from-orange-950/20 dark:to-beige-950/20 border-orange-200 dark:border-orange-800">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-2xl">AI Configuration</CardTitle>
                    <CardDescription className="mt-2">
                      Configure AI provider settings for recommendations and features
                    </CardDescription>
                  </div>
                  <Button
                    className="gap-2"
                    disabled={!hasUnsavedChanges || isSaving}
                    onClick={saveAIConfig}
                  >
                    {isSaving ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Save className="h-4 w-4" />
                    )}
                    Save Configuration
                  </Button>
                </div>
                {aiConfigSaveStatus.type !== 'idle' && (
                  <div className={cn(
                    'mt-4 p-3 rounded-lg flex items-center gap-2',
                    aiConfigSaveStatus.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  )}>
                    {aiConfigSaveStatus.type === 'success' ? (
                      <Check className="h-4 w-4" />
                    ) : (
                      <AlertCircle className="h-4 w-4" />
                    )}
                    <span className="text-sm font-medium">{aiConfigSaveStatus.message}</span>
                  </div>
                )}
              </CardHeader>
            </Card>

            {isLoadingAiConfig ? (
              <Card>
                <CardContent className="flex items-center justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardHeader>
                  <CardTitle>Provider Settings</CardTitle>
                  <CardDescription>Choose between cloud-based or local AI deployment</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Deployment Type Selection */}
                  <div className="space-y-3">
                    <Label>Deployment Type</Label>
                    <div className="grid grid-cols-2 gap-4">
                      <button
                        type="button"
                        onClick={() => setAiConfig((prev) => ({ ...prev, deployment_type: 'cloud' }))}
                        className={cn(
                          'p-4 rounded-lg border-2 text-left transition-all',
                          aiConfig.deployment_type === 'cloud'
                            ? 'border-orange-500 bg-orange-50 dark:bg-orange-950/20'
                            : 'border-border hover:border-orange-300'
                        )}
                      >
                        <div className="flex items-center gap-3">
                          <div className={cn(
                            'h-5 w-5 rounded-full border-2 flex items-center justify-center',
                            aiConfig.deployment_type === 'cloud'
                              ? 'border-orange-500 bg-orange-500'
                              : 'border-muted-foreground'
                          )}>
                            {aiConfig.deployment_type === 'cloud' && (
                              <div className="h-2 w-2 rounded-full bg-white" />
                            )}
                          </div>
                          <div>
                            <p className="font-semibold">Cloud</p>
                            <p className="text-sm text-muted-foreground">Use cloud-based AI providers</p>
                          </div>
                        </div>
                      </button>

                      <button
                        type="button"
                        onClick={() => setAiConfig((prev) => ({ ...prev, deployment_type: 'local' }))}
                        className={cn(
                          'p-4 rounded-lg border-2 text-left transition-all',
                          aiConfig.deployment_type === 'local'
                            ? 'border-orange-500 bg-orange-50 dark:bg-orange-950/20'
                            : 'border-border hover:border-orange-300'
                        )}
                      >
                        <div className="flex items-center gap-3">
                          <div className={cn(
                            'h-5 w-5 rounded-full border-2 flex items-center justify-center',
                            aiConfig.deployment_type === 'local'
                              ? 'border-orange-500 bg-orange-500'
                              : 'border-muted-foreground'
                          )}>
                            {aiConfig.deployment_type === 'local' && (
                              <div className="h-2 w-2 rounded-full bg-white" />
                            )}
                          </div>
                          <div>
                            <p className="font-semibold">Local</p>
                            <p className="text-sm text-muted-foreground">Self-hosted AI models</p>
                          </div>
                        </div>
                      </button>
                    </div>
                  </div>

                  {/* Cloud Provider Selection */}
                  {aiConfig.deployment_type === 'cloud' && (
                    <div className="space-y-2">
                      <Label htmlFor="cloud-provider">Cloud Provider</Label>
                      <Select
                        value={aiConfig.cloud_provider || 'openai'}
                        onValueChange={(value: 'deepseek' | 'openai' | 'zai') =>
                          setAiConfig((prev) => ({ ...prev, cloud_provider: value }))
                        }
                      >
                        <SelectTrigger id="cloud-provider">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="openai">OpenAI</SelectItem>
                          <SelectItem value="deepseek">DeepSeek</SelectItem>
                          <SelectItem value="zai">Zai</SelectItem>
                        </SelectContent>
                      </Select>
                      <p className="text-xs text-muted-foreground">
                        Select your preferred cloud AI provider
                      </p>
                    </div>
                  )}

                  {/* Local Provider (Ollama) */}
                  {aiConfig.deployment_type === 'local' && (
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="ollama-url">Ollama URL</Label>
                        <div className="flex gap-2">
                          <Input
                            id="ollama-url"
                            placeholder="http://localhost:11434"
                            value={aiConfig.ollama_url || ''}
                            onChange={(e) => setAiConfig((prev) => ({ ...prev, ollama_url: e.target.value }))}
                          />
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => aiConfig.ollama_url && fetchOllamaModels(aiConfig.ollama_url)}
                            disabled={!aiConfig.ollama_url || isLoadingOllamaModels}
                          >
                            {isLoadingOllamaModels ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              'Fetch Models'
                            )}
                          </Button>
                        </div>
                        {ollamaUrlError && (
                          <p className="text-xs text-red-500">{ollamaUrlError}</p>
                        )}
                        <p className="text-xs text-muted-foreground">
                          Enter your Ollama instance URL to fetch available models
                        </p>
                      </div>

                      {/* Ollama Model Selection */}
                      {ollamaModels.length > 0 && (
                        <div className="space-y-2">
                          <Label htmlFor="ollama-model">Ollama Model</Label>
                          <Select
                            value={aiConfig.ollama_model || ollamaModels[0]}
                            onValueChange={(value) => setAiConfig((prev) => ({ ...prev, ollama_model: value }))}
                          >
                            <SelectTrigger id="ollama-model">
                              <SelectValue placeholder="Select a model" />
                            </SelectTrigger>
                            <SelectContent>
                              {ollamaModels.map((model) => (
                                <SelectItem key={model} value={model}>
                                  {model}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <p className="text-xs text-muted-foreground">
                            Found {ollamaModels.length} model{ollamaModels.length !== 1 ? 's' : ''} available
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Coupons Tab */}
          <TabsContent value="coupons" className="space-y-6">
            {/* Statistics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card className="bg-gradient-to-br from-orange-50 to-beige-50 dark:from-orange-950/20 dark:to-beige-950/20 border-orange-200 dark:border-orange-800">
                <CardHeader className="pb-2">
                  <CardDescription>Total Coupons</CardDescription>
                  <CardTitle className="text-3xl">{couponStats.total}</CardTitle>
                </CardHeader>
              </Card>
              <Card className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950/20 dark:to-green-900/20 border-green-200 dark:border-green-800">
                <CardHeader className="pb-2">
                  <CardDescription>Active Coupons</CardDescription>
                  <CardTitle className="text-3xl text-green-700 dark:text-green-400">{couponStats.active}</CardTitle>
                </CardHeader>
              </Card>
              <Card className="bg-gradient-to-br from-red-50 to-red-100 dark:from-red-950/20 dark:to-red-900/20 border-red-200 dark:border-red-800">
                <CardHeader className="pb-2">
                  <CardDescription>Expired Coupons</CardDescription>
                  <CardTitle className="text-3xl text-red-700 dark:text-red-400">{couponStats.expired}</CardTitle>
                </CardHeader>
              </Card>
              <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950/20 dark:to-blue-900/20 border-blue-200 dark:border-blue-800">
                <CardHeader className="pb-2">
                  <CardDescription>Total Uses</CardDescription>
                  <CardTitle className="text-3xl text-blue-700 dark:text-blue-400">{couponStats.totalUsed}</CardTitle>
                </CardHeader>
              </Card>
            </div>

            {/* Coupons Table */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Discount Coupons</CardTitle>
                    <CardDescription>Create and manage discount coupons</CardDescription>
                  </div>
                  <Button onClick={openNewCouponModal}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Coupon
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {couponActionStatus.type !== 'idle' && (
                  <div className={cn(
                    'mb-4 p-3 rounded-lg flex items-center gap-2',
                    couponActionStatus.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  )}>
                    {couponActionStatus.type === 'success' ? (
                      <Check className="h-4 w-4" />
                    ) : (
                      <AlertCircle className="h-4 w-4" />
                    )}
                    <span className="text-sm font-medium">{couponActionStatus.message}</span>
                  </div>
                )}
                <AdminDataTable
                  columns={getCouponColumns(openEditCouponModal, (coupon) => setDeleteCouponDialog({ open: true, coupon }))}
                  data={coupons}
                  isLoading={isLoadingCoupons}
                  searchable={true}
                  searchPlaceholder="Search by code..."
                  selectable={false}
                  pagination={true}
                  pageSize={10}
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

        {/* Coupon Edit/Create Modal */}
        <Dialog open={isCouponModalOpen} onOpenChange={(open) => !isSaving && setIsCouponModalOpen(open)}>
          <DialogContent className="max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingCoupon ? 'Edit Coupon' : 'Add New Coupon'}</DialogTitle>
              <DialogDescription>
                {editingCoupon ? 'Update coupon details' : 'Create a new discount coupon'}
              </DialogDescription>
            </DialogHeader>

            {couponActionStatus.type !== 'idle' && (
              <div className={cn(
                'p-3 rounded-lg flex items-center gap-2',
                couponActionStatus.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
              )}>
                {couponActionStatus.type === 'success' ? (
                  <Check className="h-4 w-4" />
                ) : (
                  <AlertCircle className="h-4 w-4" />
                )}
                <span className="text-sm font-medium">{couponActionStatus.message}</span>
              </div>
            )}

            <div className="grid gap-4 py-4">
              {/* Code */}
              <div className="grid gap-2">
                <Label htmlFor="coupon-code">Coupon Code *</Label>
                <Input
                  id="coupon-code"
                  placeholder="SUMMER20"
                  value={couponFormData.code}
                  onChange={(e) => setCouponFormData({ ...couponFormData, code: e.target.value.toUpperCase() })}
                  disabled={isSaving}
                />
                <p className="text-xs text-muted-foreground">Unique code for the coupon (will be auto-capitalized)</p>
              </div>

              {/* Description */}
              <div className="grid gap-2">
                <Label htmlFor="coupon-description">Description</Label>
                <Textarea
                  id="coupon-description"
                  placeholder="Summer sale discount"
                  value={couponFormData.description}
                  onChange={(e) => setCouponFormData({ ...couponFormData, description: e.target.value })}
                  disabled={isSaving}
                  rows={2}
                />
              </div>

              {/* Discount Type and Value */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="coupon-type">Discount Type *</Label>
                  <Select
                    value={couponFormData.discount_type}
                    onValueChange={(value: 'percentage' | 'fixed') => setCouponFormData({ ...couponFormData, discount_type: value })}
                    disabled={isSaving}
                  >
                    <SelectTrigger id="coupon-type">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="percentage">Percentage (%)</SelectItem>
                      <SelectItem value="fixed">Fixed Amount ($)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="coupon-value">
                    Discount Value * {couponFormData.discount_type === 'percentage' ? '(%)' : '($)'}
                  </Label>
                  <Input
                    id="coupon-value"
                    type="number"
                    placeholder={couponFormData.discount_type === 'percentage' ? '20' : '10'}
                    value={couponFormData.discount_value}
                    onChange={(e) => setCouponFormData({ ...couponFormData, discount_value: e.target.value })}
                    disabled={isSaving}
                    min={0}
                    step={couponFormData.discount_type === 'percentage' ? 1 : 0.01}
                  />
                </div>
              </div>

              {/* Min Purchase and Max Discount */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="coupon-min">Minimum Purchase Amount ($)</Label>
                  <Input
                    id="coupon-min"
                    type="number"
                    placeholder="0"
                    value={couponFormData.min_purchase_amount}
                    onChange={(e) => setCouponFormData({ ...couponFormData, min_purchase_amount: e.target.value })}
                    disabled={isSaving}
                    min={0}
                    step={0.01}
                  />
                  <p className="text-xs text-muted-foreground">Minimum order value required</p>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="coupon-max">Maximum Discount Amount ($)</Label>
                  <Input
                    id="coupon-max"
                    type="number"
                    placeholder="Optional"
                    value={couponFormData.max_discount_amount}
                    onChange={(e) => setCouponFormData({ ...couponFormData, max_discount_amount: e.target.value })}
                    disabled={isSaving}
                    min={0}
                    step={0.01}
                  />
                  <p className="text-xs text-muted-foreground">Leave empty for no limit</p>
                </div>
              </div>

              {/* Usage Limit */}
              <div className="grid gap-2">
                <Label htmlFor="coupon-limit">Usage Limit</Label>
                <Input
                  id="coupon-limit"
                  type="number"
                  placeholder="Leave empty for unlimited"
                  value={couponFormData.usage_limit}
                  onChange={(e) => setCouponFormData({ ...couponFormData, usage_limit: e.target.value })}
                  disabled={isSaving}
                  min={1}
                />
                <p className="text-xs text-muted-foreground">Maximum number of times this coupon can be used</p>
              </div>

              {/* Valid From and Valid Until */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="coupon-start">Valid From *</Label>
                  <Input
                    id="coupon-start"
                    type="date"
                    value={couponFormData.valid_from}
                    onChange={(e) => setCouponFormData({ ...couponFormData, valid_from: e.target.value })}
                    disabled={isSaving}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="coupon-end">Valid Until *</Label>
                  <Input
                    id="coupon-end"
                    type="date"
                    value={couponFormData.valid_until}
                    onChange={(e) => setCouponFormData({ ...couponFormData, valid_until: e.target.value })}
                    disabled={isSaving}
                    min={couponFormData.valid_from}
                  />
                </div>
              </div>

              {/* Options */}
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <Label htmlFor="coupon-active">Active Status</Label>
                    <p className="text-xs text-muted-foreground">Enable or disable this coupon</p>
                  </div>
                  <Switch
                    id="coupon-active"
                    checked={couponFormData.is_active}
                    onCheckedChange={(checked) => setCouponFormData({ ...couponFormData, is_active: checked })}
                    disabled={isSaving}
                  />
                </div>
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <Label htmlFor="coupon-shipping">Free Shipping</Label>
                    <p className="text-xs text-muted-foreground">Coupon also provides free shipping</p>
                  </div>
                  <Switch
                    id="coupon-shipping"
                    checked={couponFormData.free_shipping}
                    onCheckedChange={(checked) => setCouponFormData({ ...couponFormData, free_shipping: checked })}
                    disabled={isSaving}
                  />
                </div>
              </div>

              {/* Coupon Usage Info (for editing) */}
              {editingCoupon && (
                <div className="bg-muted/50 p-3 rounded-lg space-y-2">
                  <p className="text-sm font-medium">Coupon Statistics</p>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <span className="text-muted-foreground">Times Used:</span>{' '}
                      <span className="font-medium">{editingCoupon.used_count}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Created:</span>{' '}
                      <span className="font-medium">{format(new Date(editingCoupon.created_at), 'MMM d, yyyy')}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setIsCouponModalOpen(false)} disabled={isSaving}>
                Cancel
              </Button>
              <Button onClick={saveCoupon} disabled={isSaving || !couponFormData.code || !couponFormData.discount_value || !couponFormData.valid_from || !couponFormData.valid_until}>
                {isSaving ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    {editingCoupon ? 'Update Coupon' : 'Create Coupon'}
                  </>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Delete Coupon Confirmation Dialog */}
        <AlertDialog open={deleteCouponDialog.open} onOpenChange={(open) => !isSaving && setDeleteCouponDialog({ open, coupon: deleteCouponDialog.coupon })}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Coupon?</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete the coupon "{deleteCouponDialog.coupon?.code}"? This action cannot be undone.
                {(deleteCouponDialog.coupon?.used_count ?? 0) > 0 && (
                  <span className="block mt-2 text-amber-600 font-medium">
                    Warning: This coupon has been used {deleteCouponDialog.coupon?.used_count ?? 0} time(s).
                  </span>
                )}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel disabled={isSaving}>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={(e) => {
                  e.preventDefault();
                  deleteCoupon();
                }}
                disabled={isSaving}
                className="bg-red-600 hover:bg-red-700"
              >
                {isSaving ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Deleting...
                  </>
                ) : (
                  'Delete Coupon'
                )}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </PageBody>
  );
}

export default AdminSettingsPage;
