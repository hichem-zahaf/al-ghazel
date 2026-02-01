'use client';

import { useState, useEffect, useMemo, useCallback, memo } from 'react';
import {
  BookOpen,
  Edit,
  Trash2,
  Plus,
  Search,
  Filter,
  X,
  Star,
  Sparkles,
  TrendingUp,
  Award,
  Loader2,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  Check,
  Square,
  SquareCheck,
  UserPlus,
} from 'lucide-react';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import { PageBody } from '@kit/ui/page';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@kit/ui/card';
import { Button } from '@kit/ui/button';
import { Badge } from '@kit/ui/badge';
import { Input } from '@kit/ui/input';
import { Textarea } from '@kit/ui/textarea';
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
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@kit/ui/form';
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
import { cn } from '@kit/ui/utils';
import { Checkbox } from '@kit/ui/checkbox';

// Constants
const ITEMS_PER_PAGE = 20;

// Types
type Book = {
  id: string;
  title: string;
  subtitle: string | null;
  description: string | null;
  author_id: string;
  author_name?: string;
  isbn: string | null;
  cover_image_url: string | null;
  publisher: string | null;
  published_date: string | null;
  pages: number | null;
  language: string | null;
  format: string | null;
  price: number;
  original_price: number | null;
  discount_percentage: number | null;
  stock_quantity: number | null;
  rating: number | null;
  rating_count: number | null;
  status: string | null;
  is_featured: boolean | null;
  is_bestseller: boolean | null;
  is_new_release: boolean | null;
  created_at: string | null;
  categories?: string[];
};

type Author = {
  id: string;
  name: string;
};

type Category = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  book_count: number;
};

// Form schema
const bookFormSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  subtitle: z.string().optional(),
  description: z.string().optional(),
  author_id: z.string().min(1, 'Author is required'),
  categories: z.array(z.string()).optional(),
  isbn: z.string().optional(),
  cover_image_url: z.string().url().or(z.literal('')).optional(),
  publisher: z.string().optional(),
  published_date: z.string().optional(),
  pages: z.union([z.number().int().positive(), z.literal(''), z.null()]).optional(),
  language: z.string().optional(),
  format: z.string().optional(),
  price: z.number().positive('Price must be positive'),
  original_price: z.union([z.number().positive(), z.literal(''), z.null()]).optional(),
  discount_percentage: z.union([z.number().int().min(0).max(100), z.literal(''), z.null()]).optional(),
  stock_quantity: z.union([z.number().int().min(0), z.literal(''), z.null()]).optional(),
  status: z.string().optional(),
  is_featured: z.boolean().optional(),
  is_bestseller: z.boolean().optional(),
  is_new_release: z.boolean().optional(),
});

type BookFormValues = z.infer<typeof bookFormSchema>;

// Memoized components for performance
const StatusBadge = memo(({ status }: { status: string | null }) => {
  const variants: Record<string, string> = {
    active: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
    inactive: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300',
    draft: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
    out_of_stock: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
  };

  return (
    <Badge className={cn('capitalize', variants[status || 'active'] || variants.active)}>
      {status || 'active'}
    </Badge>
  );
});
StatusBadge.displayName = 'StatusBadge';

const BookBadges = memo(({ book }: { book: Book }) => (
  <div className="flex flex-wrap gap-1">
    {book.is_featured && (
      <Badge className="bg-[#FA8112] text-white">
        <Sparkles className="h-3 w-3 mr-1" />
        Featured
      </Badge>
    )}
    {book.is_bestseller && (
      <Badge className="bg-purple-500 text-white">
        <TrendingUp className="h-3 w-3 mr-1" />
        Bestseller
      </Badge>
    )}
    {book.is_new_release && (
      <Badge className="bg-blue-500 text-white">
        <Award className="h-3 w-3 mr-1" />
        New
      </Badge>
    )}
  </div>
));
BookBadges.displayName = 'BookBadges';

// Optimized Book Row Component
const BookRow = memo(({
  book,
  selected,
  onToggleSelect,
  onEdit,
  onDelete
}: {
  book: Book;
  selected: boolean;
  onToggleSelect: (id: string) => void;
  onEdit: (book: Book) => void;
  onDelete: (id: string) => void;
}) => (
  <TableRow className="hover:bg-muted/50">
    <TableCell className="w-[50px]">
      <Checkbox
        checked={selected}
        onCheckedChange={() => onToggleSelect(book.id)}
      />
    </TableCell>
    <TableCell className="w-[300px]">
      <div className="flex items-start gap-3">
        {book.cover_image_url && (
          <img
            src={book.cover_image_url}
            alt={book.title}
            className="h-12 w-9 object-cover rounded flex-shrink-0"
            loading="lazy"
          />
        )}
        <div className="min-w-0">
          <p className="font-medium truncate">{book.title}</p>
          {book.subtitle && (
            <p className="text-sm text-muted-foreground truncate">{book.subtitle}</p>
          )}
        </div>
      </div>
    </TableCell>
    <TableCell>
      <span className="text-sm">{book.author_name || '-'}</span>
    </TableCell>
    <TableCell>
      <span className="text-sm font-mono">{book.isbn || '-'}</span>
    </TableCell>
    <TableCell>
      <div className="flex flex-col">
        <span className="font-medium">${book.price.toFixed(2)}</span>
        {book.original_price && book.original_price > book.price && (
          <span className="text-sm text-muted-foreground line-through">
            ${book.original_price.toFixed(2)}
          </span>
        )}
      </div>
    </TableCell>
    <TableCell>
      <Badge
        variant={book.stock_quantity && book.stock_quantity > 10 ? 'default' : 'destructive'}
        className={book.stock_quantity && book.stock_quantity > 10
          ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
          : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
        }
      >
        {book.stock_quantity ?? 0}
      </Badge>
    </TableCell>
    <TableCell>
      {book.rating ? (
        <div className="flex items-center gap-1">
          <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
          <span className="text-sm font-medium">{book.rating.toFixed(1)}</span>
          {book.rating_count && (
            <span className="text-xs text-muted-foreground">({book.rating_count})</span>
          )}
        </div>
      ) : (
        <span className="text-sm text-muted-foreground">-</span>
      )}
    </TableCell>
    <TableCell>
      <StatusBadge status={book.status} />
    </TableCell>
    <TableCell>
      <BookBadges book={book} />
    </TableCell>
    <TableCell className="text-right">
      <div className="flex items-center justify-end gap-2">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => onEdit(book)}
        >
          <Edit className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => onDelete(book.id)}
          className="hover:bg-red-100 hover:text-red-600 dark:hover:bg-red-900/30"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </TableCell>
  </TableRow>
));
BookRow.displayName = 'BookRow';

export default function AdminBooksPage() {
  // Data state
  const [allBooks, setAllBooks] = useState<Book[]>([]);
  const [authors, setAuthors] = useState<Author[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  // Filter state
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterAuthor, setFilterAuthor] = useState<string>('all');
  const [filterFeatured, setFilterFeatured] = useState<string>('all');
  const [filterBestseller, setFilterBestseller] = useState<string>('all');

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);

  // Selection state
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [isAllSelected, setIsAllSelected] = useState(false);

  // Dialog state
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isNewAuthorDialogOpen, setIsNewAuthorDialogOpen] = useState(false);
  const [editingBook, setEditingBook] = useState<Book | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deletingBookId, setDeletingBookId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [newAuthorName, setNewAuthorName] = useState('');
  const [isAddingAuthor, setIsAddingAuthor] = useState(false);
  const [categoriesExpanded, setCategoriesExpanded] = useState(false);

  // Form setup with memoized default values
  const defaultFormValues = useMemo<BookFormValues>(() => ({
    title: '',
    subtitle: '',
    description: '',
    author_id: '',
    categories: [],
    isbn: '',
    cover_image_url: '',
    publisher: '',
    published_date: '',
    pages: '',
    language: 'English',
    format: 'Hardcover',
    price: 0,
    original_price: '',
    discount_percentage: '',
    stock_quantity: '',
    status: 'active',
    is_featured: false,
    is_bestseller: false,
    is_new_release: false,
  }), []);

  const form = useForm<BookFormValues>({
    resolver: zodResolver(bookFormSchema),
    defaultValues: defaultFormValues,
    mode: 'onSubmit', // Only validate on submit for better performance
  });

  // Fetch all books once
  const fetchBooks = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/books');
      const result = await response.json();
      if (result.data) {
        setAllBooks(result.data.map((book: any) => ({
          ...book,
          author_name: book.authors?.name,
        })));
      }
    } catch (error) {
      console.error('Error fetching books:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch authors once
  const fetchAuthors = useCallback(async () => {
    try {
      const response = await fetch('/api/authors');
      const result = await response.json();
      if (result.data) {
        setAuthors(result.data);
      }
    } catch (error) {
      console.error('Error fetching authors:', error);
    }
  }, []);

  // Fetch categories once
  const fetchCategories = useCallback(async () => {
    try {
      const response = await fetch('/api/categories');
      const result = await response.json();
      if (result.data) {
        setCategories(result.data);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  }, []);

  // Initial data fetch
  useEffect(() => {
    fetchBooks();
    fetchAuthors();
    fetchCategories();
  }, [fetchBooks, fetchAuthors, fetchCategories]);

  // Client-side filtering with memoization
  const filteredBooks = useMemo(() => {
    return allBooks.filter((book) => {
      // Search filter
      const searchLower = searchTerm.toLowerCase();
      const matchesSearch = !searchTerm ||
        book.title.toLowerCase().includes(searchLower) ||
        (book.subtitle && book.subtitle.toLowerCase().includes(searchLower)) ||
        (book.isbn && book.isbn.toLowerCase().includes(searchLower));

      // Status filter
      const matchesStatus = filterStatus === 'all' || book.status === filterStatus;

      // Author filter
      const matchesAuthor = filterAuthor === 'all' || book.author_id === filterAuthor;

      // Featured filter
      const matchesFeatured = filterFeatured === 'all' ||
        (filterFeatured === 'true' ? book.is_featured : !book.is_featured);

      // Bestseller filter
      const matchesBestseller = filterBestseller === 'all' ||
        (filterBestseller === 'true' ? book.is_bestseller : !book.is_bestseller);

      return matchesSearch && matchesStatus && matchesAuthor && matchesFeatured && matchesBestseller;
    });
  }, [allBooks, searchTerm, filterStatus, filterAuthor, filterFeatured, filterBestseller]);

  // Reset pagination when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, filterStatus, filterAuthor, filterFeatured, filterBestseller]);

  // Pagination
  const totalPages = Math.ceil(filteredBooks.length / ITEMS_PER_PAGE);
  const paginatedBooks = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    const end = start + ITEMS_PER_PAGE;
    return filteredBooks.slice(start, end);
  }, [filteredBooks, currentPage]);

  // Reset form
  const resetForm = useCallback(() => {
    form.reset(defaultFormValues);
  }, [form, defaultFormValues]);

  // Open add dialog
  const openAddDialog = useCallback(() => {
    resetForm();
    setIsAddDialogOpen(true);
  }, [resetForm]);

  // Open edit dialog
  const openEditDialog = useCallback((book: Book) => {
    setEditingBook(book);
    form.reset({
      title: book.title,
      subtitle: book.subtitle || '',
      description: book.description || '',
      author_id: book.author_id,
      categories: book.categories || [],
      isbn: book.isbn || '',
      cover_image_url: book.cover_image_url || '',
      publisher: book.publisher || '',
      published_date: book.published_date || '',
      pages: book.pages || '',
      language: book.language || 'English',
      format: book.format || 'Hardcover',
      price: book.price,
      original_price: book.original_price || '',
      discount_percentage: book.discount_percentage || '',
      stock_quantity: book.stock_quantity || '',
      status: book.status || 'active',
      is_featured: book.is_featured || false,
      is_bestseller: book.is_bestseller || false,
      is_new_release: book.is_new_release || false,
    });
    setIsEditDialogOpen(true);
  }, [form]);

  // Submit form (create or update)
  const onSubmit = useCallback(async (values: BookFormValues) => {
    setSubmitting(true);
    try {
      const payload = {
        title: values.title,
        subtitle: values.subtitle || null,
        description: values.description || null,
        author_id: values.author_id,
        categories: values.categories || [],
        isbn: values.isbn || null,
        cover_image_url: values.cover_image_url || null,
        publisher: values.publisher || null,
        published_date: values.published_date || null,
        pages: values.pages ? Number(values.pages) : null,
        language: values.language,
        format: values.format,
        price: Number(values.price),
        original_price: values.original_price ? Number(values.original_price) : null,
        discount_percentage: values.discount_percentage ? Number(values.discount_percentage) : null,
        stock_quantity: values.stock_quantity ? Number(values.stock_quantity) : null,
        status: values.status,
        is_featured: values.is_featured,
        is_bestseller: values.is_bestseller,
        is_new_release: values.is_new_release,
      };

      const url = editingBook ? `/api/books/${editingBook.id}` : '/api/books';
      const method = editingBook ? 'PATCH' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        setIsAddDialogOpen(false);
        setIsEditDialogOpen(false);
        setEditingBook(null);
        resetForm();
        fetchBooks(); // Refresh data
      } else {
        const error = await response.json();
        console.error('Error saving book:', error);
      }
    } catch (error) {
      console.error('Error saving book:', error);
    } finally {
      setSubmitting(false);
    }
  }, [editingBook, resetForm, fetchBooks]);

  // Delete book
  const deleteBook = useCallback(async () => {
    if (!deletingBookId) return;

    setSubmitting(true);
    try {
      const response = await fetch(`/api/books/${deletingBookId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setDeleteDialogOpen(false);
        setDeletingBookId(null);
        fetchBooks(); // Refresh data
      }
    } catch (error) {
      console.error('Error deleting book:', error);
    } finally {
      setSubmitting(false);
    }
  }, [deletingBookId, fetchBooks]);

  // Bulk delete selected books
  const bulkDelete = useCallback(async () => {
    if (selectedIds.size === 0) return;

    setSubmitting(true);
    try {
      await Promise.all(
        Array.from(selectedIds).map(id =>
          fetch(`/api/books/${id}`, { method: 'DELETE' })
        )
      );
      setSelectedIds(new Set());
      setIsAllSelected(false);
      fetchBooks(); // Refresh data
    } catch (error) {
      console.error('Error deleting books:', error);
    } finally {
      setSubmitting(false);
    }
  }, [selectedIds, fetchBooks]);

  // Confirm delete
  const confirmDelete = useCallback((bookId: string) => {
    setDeletingBookId(bookId);
    setDeleteDialogOpen(true);
  }, []);

  // Clear filters
  const clearFilters = useCallback(() => {
    setSearchTerm('');
    setFilterStatus('all');
    setFilterAuthor('all');
    setFilterFeatured('all');
    setFilterBestseller('all');
  }, []);

  // Create new author
  const createNewAuthor = useCallback(async () => {
    if (!newAuthorName.trim()) return;

    setIsAddingAuthor(true);
    try {
      const response = await fetch('/api/authors', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newAuthorName.trim() }),
      });

      if (response.ok) {
        const result = await response.json();
        const newAuthor = result.data;
        // Add to authors list
        setAuthors(prev => [...prev, newAuthor]);
        // Select the new author
        form.setValue('author_id', newAuthor.id);
        // Close dialog and reset
        setIsNewAuthorDialogOpen(false);
        setNewAuthorName('');
      } else {
        console.error('Error creating author');
      }
    } catch (error) {
      console.error('Error creating author:', error);
    } finally {
      setIsAddingAuthor(false);
    }
  }, [newAuthorName, form]);

  // Selection handlers
  const toggleSelect = useCallback((id: string) => {
    setSelectedIds(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  }, []);

  const toggleSelectAll = useCallback(() => {
    if (isAllSelected) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(paginatedBooks.map(b => b.id)));
    }
    setIsAllSelected(!isAllSelected);
  }, [isAllSelected, paginatedBooks]);

  // Update isAllSelected when page changes
  useEffect(() => {
    const allSelected = paginatedBooks.length > 0 &&
      paginatedBooks.every(b => selectedIds.has(b.id));
    setIsAllSelected(allSelected);
  }, [paginatedBooks, selectedIds]);

  return (
    <PageBody>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold">Books Management</h1>
            <p className="text-muted-foreground mt-1">
              {filteredBooks.length} books total
            </p>
          </div>
          <div className="flex gap-2">
            {selectedIds.size > 0 && (
              <Button
                variant="destructive"
                onClick={bulkDelete}
                disabled={submitting}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete {selectedIds.size}
              </Button>
            )}
            <Button
              onClick={openAddDialog}
              className="bg-[#FA8112] text-white hover:bg-[#e6730f]"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Book
            </Button>
          </div>
        </div>

        {/* Filters */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg flex items-center gap-2">
                <Filter className="h-4 w-4" />
                Filters
              </CardTitle>
              {(searchTerm || filterStatus !== 'all' || filterAuthor !== 'all' ||
                filterFeatured !== 'all' || filterBestseller !== 'all') && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearFilters}
                  className="text-muted-foreground"
                >
                  <X className="h-4 w-4 mr-1" />
                  Clear
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
              {/* Search */}
              <div className="xl:col-span-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search by title, subtitle, ISBN..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-9"
                  />
                </div>
              </div>

              {/* Status Filter */}
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger>
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="out_of_stock">Out of Stock</SelectItem>
                </SelectContent>
              </Select>

              {/* Author Filter */}
              <Select value={filterAuthor} onValueChange={setFilterAuthor}>
                <SelectTrigger>
                  <SelectValue placeholder="Author" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Authors</SelectItem>
                  {authors.map((author) => (
                    <SelectItem key={author.id} value={author.id}>
                      {author.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Featured Filter */}
              <Select value={filterFeatured} onValueChange={setFilterFeatured}>
                <SelectTrigger>
                  <SelectValue placeholder="Featured" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="true">Featured Only</SelectItem>
                  <SelectItem value="false">Not Featured</SelectItem>
                </SelectContent>
              </Select>

              {/* Bestseller Filter */}
              <Select value={filterBestseller} onValueChange={setFilterBestseller}>
                <SelectTrigger>
                  <SelectValue placeholder="Bestseller" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="true">Bestsellers Only</SelectItem>
                  <SelectItem value="false">Not Bestsellers</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Books Table */}
        <Card>
          <CardHeader>
            <CardTitle>
              Showing {paginatedBooks.length} of {filteredBooks.length} books
              {filteredBooks.length > ITEMS_PER_PAGE && ` (Page ${currentPage} of ${totalPages})`}
            </CardTitle>
            <CardDescription>
              Use filters and search to find specific books
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-[#FA8112]" />
              </div>
            ) : filteredBooks.length === 0 ? (
              <div className="text-center py-12">
                <BookOpen className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium">No books found</h3>
                <p className="text-muted-foreground mt-1">
                  Try adjusting your filters or add a new book
                </p>
              </div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="hover:bg-muted/50">
                        <TableHead className="w-[50px]">
                          <Checkbox
                            checked={isAllSelected}
                            onCheckedChange={toggleSelectAll}
                          />
                        </TableHead>
                        <TableHead className="w-[300px]">Title</TableHead>
                        <TableHead>Author</TableHead>
                        <TableHead>ISBN</TableHead>
                        <TableHead>Price</TableHead>
                        <TableHead>Stock</TableHead>
                        <TableHead>Rating</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Badges</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {paginatedBooks.map((book) => (
                        <BookRow
                          key={book.id}
                          book={book}
                          selected={selectedIds.has(book.id)}
                          onToggleSelect={toggleSelect}
                          onEdit={openEditDialog}
                          onDelete={confirmDelete}
                        />
                      ))}
                    </TableBody>
                  </Table>
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-between mt-4 pt-4 border-t">
                    <p className="text-sm text-muted-foreground">
                      Showing {(currentPage - 1) * ITEMS_PER_PAGE + 1} to{' '}
                      {Math.min(currentPage * ITEMS_PER_PAGE, filteredBooks.length)} of{' '}
                      {filteredBooks.length} books
                    </p>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                        disabled={currentPage === 1}
                      >
                        <ChevronLeft className="h-4 w-4" />
                      </Button>
                      {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                        let pageNum;
                        if (totalPages <= 5) {
                          pageNum = i + 1;
                        } else if (currentPage <= 3) {
                          pageNum = i + 1;
                        } else if (currentPage >= totalPages - 2) {
                          pageNum = totalPages - 4 + i;
                        } else {
                          pageNum = currentPage - 2 + i;
                        }
                        return (
                          <Button
                            key={pageNum}
                            variant={currentPage === pageNum ? 'default' : 'outline'}
                            size="icon"
                            onClick={() => setCurrentPage(pageNum)}
                            className={currentPage === pageNum ? 'bg-[#FA8112] text-white hover:bg-[#e6730f]' : 'data-[state=active]:bg-[#FA8112]'}
                          >
                            {pageNum}
                          </Button>
                        );
                      })}
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                        disabled={currentPage === totalPages}
                      >
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Add/Edit Book Dialog */}
      <Dialog open={isAddDialogOpen || isEditDialogOpen} onOpenChange={(open) => {
        if (!open) {
          setIsAddDialogOpen(false);
          setIsEditDialogOpen(false);
          setEditingBook(null);
        }
      }}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingBook ? 'Edit Book' : 'Add New Book'}</DialogTitle>
            <DialogDescription>
              {editingBook ? 'Update the book details' : 'Fill in the details to add a new book to your catalog'}
            </DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Title */}
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem className="md:col-span-2">
                      <FormLabel>Title *</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter book title" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Subtitle */}
                <FormField
                  control={form.control}
                  name="subtitle"
                  render={({ field }) => (
                    <FormItem className="md:col-span-2">
                      <FormLabel>Subtitle</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter subtitle (optional)" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Author */}
                <FormField
                  control={form.control}
                  name="author_id"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Author *</FormLabel>
                      <div className="flex gap-2">
                        <Select
                          onValueChange={(value) => {
                            if (value === '__new__') {
                              setIsNewAuthorDialogOpen(true);
                            } else {
                              field.onChange(value);
                            }
                          }}
                          value={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select author" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {authors.map((author) => (
                              <SelectItem key={author.id} value={author.id}>
                                {author.name}
                              </SelectItem>
                            ))}
                            <SelectItem value="__new__" className="text-[#FA8112]">
                              <div className="flex items-center gap-2">
                                <Plus className="h-4 w-4" />
                                Add new author
                              </div>
                            </SelectItem>
                          </SelectContent>
                        </Select>
                        <Button
                          type="button"
                          variant="outline"
                          size="icon"
                          className="h-9 w-9 shrink-0"
                          onClick={() => setIsNewAuthorDialogOpen(true)}
                          title="Add new author"
                        >
                          <UserPlus className="h-4 w-4" />
                        </Button>
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Categories */}
                <FormField
                  control={form.control}
                  name="categories"
                  render={({ field }) => {
                    const selectedCategories = categories.filter(c => field.value?.includes(c.id));
                    return (
                      <FormItem className="md:col-span-2">
                        <div className="flex items-center justify-between">
                          <FormLabel>Categories</FormLabel>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => setCategoriesExpanded(!categoriesExpanded)}
                            className="h-7 text-xs"
                          >
                            {categoriesExpanded ? (
                              <>Collapse <ChevronUp className="h-3 w-3 ml-1" /></>
                            ) : (
                              <>Expand <ChevronDown className="h-3 w-3 ml-1" /></>
                            )}
                          </Button>
                        </div>

                        {/* Selected categories as pills (always visible) */}
                        {selectedCategories.length > 0 && (
                          <div className="flex flex-wrap gap-2 mt-2">
                            {selectedCategories.map((category) => (
                              <Badge
                                key={category.id}
                                className="bg-[#FA8112] text-white hover:bg-[#e6730f] cursor-pointer"
                                onClick={() => {
                                  field.onChange(field.value?.filter((id: string) => id !== category.id) || []);
                                }}
                              >
                                {category.name}
                                <X className="h-3 w-3 ml-1" />
                              </Badge>
                            ))}
                          </div>
                        )}

                        {/* Full category grid (when expanded) */}
                        {categoriesExpanded && (
                          <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mt-3 p-3 rounded-lg border bg-gray-50 dark:bg-gray-900 dark:border-gray-700">
                            {categories.map((category) => {
                              const isSelected = field.value?.includes(category.id);
                              return (
                                <label
                                  key={category.id}
                                  className={cn(
                                    'flex items-center gap-2 p-2 rounded-md border cursor-pointer transition-colors',
                                    isSelected
                                      ? 'bg-[#FAF3E1] dark:bg-[#FA8112]/20 border-[#FA8112] dark:border-[#FA8112]/50'
                                      : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                                  )}
                                >
                                  <Checkbox
                                    checked={isSelected}
                                    onCheckedChange={(checked) => {
                                      const currentValues = field.value || [];
                                      if (checked) {
                                        field.onChange([...currentValues, category.id]);
                                      } else {
                                        field.onChange(currentValues.filter((id: string) => id !== category.id));
                                      }
                                    }}
                                  />
                                  <span className="text-sm">{category.name}</span>
                                </label>
                              );
                            })}
                          </div>
                        )}

                        <FormDescription className="text-xs mt-1">
                          {selectedCategories.length === 0
                            ? 'Select one or more categories for this book'
                            : `${selectedCategories.length} categor${selectedCategories.length === 1 ? 'y' : 'ies'} selected`}
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    );
                  }}
                />

                {/* ISBN */}
                <FormField
                  control={form.control}
                  name="isbn"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>ISBN</FormLabel>
                      <FormControl>
                        <Input placeholder="978-0-123456-78-9" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Cover Image URL */}
                <FormField
                  control={form.control}
                  name="cover_image_url"
                  render={({ field }) => (
                    <FormItem className="md:col-span-2">
                      <FormLabel>Cover Image URL</FormLabel>
                      <FormControl>
                        <Input placeholder="https://example.com/cover.jpg" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Publisher */}
                <FormField
                  control={form.control}
                  name="publisher"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Publisher</FormLabel>
                      <FormControl>
                        <Input placeholder="Publisher name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Published Date */}
                <FormField
                  control={form.control}
                  name="published_date"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Published Date</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Pages */}
                <FormField
                  control={form.control}
                  name="pages"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Pages</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="300"
                          value={field.value ?? ''}
                          onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : '')}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Language */}
                <FormField
                  control={form.control}
                  name="language"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Language</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="English">English</SelectItem>
                          <SelectItem value="Spanish">Spanish</SelectItem>
                          <SelectItem value="French">French</SelectItem>
                          <SelectItem value="German">German</SelectItem>
                          <SelectItem value="Arabic">Arabic</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Format */}
                <FormField
                  control={form.control}
                  name="format"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Format</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="Hardcover">Hardcover</SelectItem>
                          <SelectItem value="Paperback">Paperback</SelectItem>
                          <SelectItem value="E-book">E-book</SelectItem>
                          <SelectItem value="Audiobook">Audiobook</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Price */}
                <FormField
                  control={form.control}
                  name="price"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Price *</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.01"
                          placeholder="19.99"
                          {...field}
                          onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Original Price */}
                <FormField
                  control={form.control}
                  name="original_price"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Original Price</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.01"
                          placeholder="24.99"
                          value={field.value ?? ''}
                          onChange={(e) => field.onChange(e.target.value ? parseFloat(e.target.value) : '')}
                        />
                      </FormControl>
                      <FormDescription>For showing discount</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Discount Percentage */}
                <FormField
                  control={form.control}
                  name="discount_percentage"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Discount %</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="20"
                          value={field.value ?? ''}
                          onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : '')}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Stock Quantity */}
                <FormField
                  control={form.control}
                  name="stock_quantity"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Stock Quantity</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="50"
                          value={field.value ?? ''}
                          onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : '')}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Status */}
                <FormField
                  control={form.control}
                  name="status"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Status</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="active">Active</SelectItem>
                          <SelectItem value="inactive">Inactive</SelectItem>
                          <SelectItem value="draft">Draft</SelectItem>
                          <SelectItem value="out_of_stock">Out of Stock</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Badges */}
                <div className="md:col-span-2 space-y-4">
                  <FormLabel>Badges</FormLabel>
                  <div className="flex flex-wrap gap-4">
                    <FormField
                      control={form.control}
                      name="is_featured"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                          <div className="space-y-0.5">
                            <FormLabel className="text-base">Featured</FormLabel>
                            <FormDescription>Show on homepage</FormDescription>
                          </div>
                          <FormControl>
                            <input
                              type="checkbox"
                              checked={field.value}
                              onChange={field.onChange}
                              className="h-4 w-4"
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="is_bestseller"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                          <div className="space-y-0.5">
                            <FormLabel className="text-base">Bestseller</FormLabel>
                            <FormDescription>Mark as bestseller</FormDescription>
                          </div>
                          <FormControl>
                            <input
                              type="checkbox"
                              checked={field.value}
                              onChange={field.onChange}
                              className="h-4 w-4"
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="is_new_release"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                          <div className="space-y-0.5">
                            <FormLabel className="text-base">New Release</FormLabel>
                            <FormDescription>Mark as new</FormDescription>
                          </div>
                          <FormControl>
                            <input
                              type="checkbox"
                              checked={field.value}
                              onChange={field.onChange}
                              className="h-4 w-4"
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                {/* Description */}
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem className="md:col-span-2">
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Enter book description..."
                          rows={4}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setIsAddDialogOpen(false);
                    setIsEditDialogOpen(false);
                    setEditingBook(null);
                  }}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={submitting}
                  className="bg-[#FA8112] text-white hover:bg-[#e6730f]"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    editingBook ? 'Save Changes' : 'Add Book'
                  )}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Book</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this book? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={deleteBook}
              disabled={submitting}
              className="bg-red-600 hover:bg-red-700"
            >
              {submitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Deleting...
                </>
              ) : (
                'Delete'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* New Author Dialog */}
      <Dialog open={isNewAuthorDialogOpen} onOpenChange={setIsNewAuthorDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Add New Author</DialogTitle>
            <DialogDescription>
              Enter the name of the new author
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label htmlFor="author-name" className="text-sm font-medium">
                Author Name *
              </label>
              <Input
                id="author-name"
                placeholder="Enter author name"
                value={newAuthorName}
                onChange={(e) => setNewAuthorName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && newAuthorName.trim()) {
                    e.preventDefault();
                    createNewAuthor();
                  }
                }}
                autoFocus
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setIsNewAuthorDialogOpen(false);
                setNewAuthorName('');
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={createNewAuthor}
              disabled={!newAuthorName.trim() || isAddingAuthor}
              className="bg-[#FA8112] text-white hover:bg-[#e6730f]"
            >
              {isAddingAuthor ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Adding...
                </>
              ) : (
                'Add Author'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </PageBody>
  );
}
