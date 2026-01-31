'use client';

import { useState, useEffect, useMemo, useCallback, memo } from 'react';
import {
  BookMarked,
  Edit,
  Trash2,
  Plus,
  Search,
  X,
  Loader2,
  User,
  UserPlus,
  ChevronLeft,
  ChevronRight,
  Globe,
  Calendar,
  Mail,
} from 'lucide-react';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { format } from 'date-fns';

import { PageBody } from '@kit/ui/page';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@kit/ui/card';
import { Button } from '@kit/ui/button';
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
type Author = {
  id: string;
  name: string;
  bio?: string | null;
  avatar_url?: string | null;
  birth_date?: string | null;
  nationality?: string | null;
  website_url?: string | null;
  book_count?: number | null;
  is_featured?: boolean | null;
  social_links?: Record<string, string> | null;
  created_at?: string | null;
};

// Form schema
const authorFormSchema = z.object({
  name: z.string().min(1, 'Author name is required'),
  bio: z.string().optional(),
  avatar_url: z.string().url().or(z.literal('')).optional(),
  birth_date: z.string().optional(),
  nationality: z.string().optional(),
  website_url: z.string().url().or(z.literal('')).optional(),
  is_featured: z.boolean().optional(),
});

type AuthorFormValues = z.infer<typeof authorFormSchema>;

// Memoized Author Row Component
const AuthorRow = memo(({
  author,
  selected,
  onToggleSelect,
  onEdit,
  onDelete
}: {
  author: Author;
  selected: boolean;
  onToggleSelect: (id: string) => void;
  onEdit: (author: Author) => void;
  onDelete: (id: string) => void;
}) => (
  <TableRow className="hover:bg-[rgb(250, 243, 225)]/30">
    <TableCell className="w-[50px]">
      <Checkbox
        checked={selected}
        onCheckedChange={() => onToggleSelect(author.id)}
      />
    </TableCell>
    <TableCell>
      <div className="flex items-center gap-3">
        {author.avatar_url ? (
          <img
            src={author.avatar_url}
            alt={author.name}
            className="h-12 w-12 rounded-full object-cover flex-shrink-0"
            loading="lazy"
          />
        ) : (
          <div className="h-12 w-12 rounded-full bg-[#FA8112]/10 flex items-center justify-center flex-shrink-0">
            <User className="h-6 w-6 text-[#FA8112]" />
          </div>
        )}
        <div>
          <div className="flex items-center gap-2">
            <p className="font-medium text-[#222222]">{author.name}</p>
            {author.is_featured && (
              <span className="bg-purple-100 text-purple-800 text-xs px-2 py-0.5 rounded-full">Featured</span>
            )}
          </div>
          {author.bio && (
            <p className="text-sm text-muted-foreground line-clamp-2 max-w-md mt-1">{author.bio}</p>
          )}
          {(author.nationality || author.birth_date) && (
            <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
              {author.nationality && (
                <span>{author.nationality}</span>
              )}
              {author.birth_date && (
                <>
                  {author.nationality && <span>•</span>}
                  <span className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    {format(new Date(author.birth_date), 'MMM yyyy')}
                  </span>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </TableCell>
    <TableCell>
      <span className="text-sm">
        {author.book_count ?? 0}
      </span>
    </TableCell>
    <TableCell>
      {author.website_url ? (
        <a
          href={author.website_url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-[#FA8112] hover:underline flex items-center gap-1"
        >
          <Globe className="h-4 w-4" />
          <span className="truncate max-w-[150px]">{author.website_url.replace(/^https?:\/\//, '')}</span>
        </a>
      ) : (
        <span className="text-sm text-muted-foreground">-</span>
      )}
    </TableCell>
    <TableCell className="text-right">
      <div className="flex items-center justify-end gap-2">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => onEdit(author)}
          className="hover:bg-[#F5E7C6] hover:text-[#222222]"
        >
          <Edit className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => onDelete(author.id)}
          className="hover:bg-red-100 hover:text-red-600"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </TableCell>
  </TableRow>
));
AuthorRow.displayName = 'AuthorRow';

export default function AdminAuthorsPage() {
  // Data state
  const [allAuthors, setAllAuthors] = useState<Author[]>([]);
  const [loading, setLoading] = useState(true);

  // Filter state
  const [searchTerm, setSearchTerm] = useState('');
  const [filterFeatured, setFilterFeatured] = useState<string>('all');

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);

  // Selection state
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [isAllSelected, setIsAllSelected] = useState(false);

  // Dialog state
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingAuthor, setEditingAuthor] = useState<Author | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deletingAuthorId, setDeletingAuthorId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Form setup with memoized default values
  const defaultFormValues = useMemo<AuthorFormValues>(() => ({
    name: '',
    bio: '',
    avatar_url: '',
    birth_date: '',
    nationality: '',
    website_url: '',
    is_featured: false,
  }), []);

  const form = useForm<AuthorFormValues>({
    resolver: zodResolver(authorFormSchema),
    defaultValues: defaultFormValues,
    mode: 'onSubmit',
  });

  // Fetch all authors once
  const fetchAuthors = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/authors');
      const result = await response.json();
      if (result.data) {
        setAllAuthors(result.data);
      }
    } catch (error) {
      console.error('Error fetching authors:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  // Initial data fetch
  useEffect(() => {
    fetchAuthors();
  }, [fetchAuthors]);

  // Client-side filtering with memoization
  const filteredAuthors = useMemo(() => {
    return allAuthors.filter((author) => {
      // Search filter
      const searchLower = searchTerm.toLowerCase();
      const matchesSearch = !searchTerm ||
        author.name.toLowerCase().includes(searchLower) ||
        (author.bio && author.bio.toLowerCase().includes(searchLower)) ||
        (author.nationality && author.nationality.toLowerCase().includes(searchLower));

      // Featured filter
      const matchesFeatured = filterFeatured === 'all' ||
        (filterFeatured === 'true' ? author.is_featured : !author.is_featured);

      return matchesSearch && matchesFeatured;
    });
  }, [allAuthors, searchTerm, filterFeatured]);

  // Reset pagination when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, filterFeatured]);

  // Pagination
  const totalPages = Math.ceil(filteredAuthors.length / ITEMS_PER_PAGE);
  const paginatedAuthors = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    const end = start + ITEMS_PER_PAGE;
    return filteredAuthors.slice(start, end);
  }, [filteredAuthors, currentPage]);

  // Reset form
  const resetForm = useCallback(() => {
    form.reset(defaultFormValues);
  }, [form, defaultFormValues]);

  // Open add dialog
  const openAddDialog = useCallback(() => {
    resetForm();
    setEditingAuthor(null);
    setIsDialogOpen(true);
  }, [resetForm]);

  // Open edit dialog
  const openEditDialog = useCallback((author: Author) => {
    setEditingAuthor(author);
    form.reset({
      name: author.name,
      bio: author.bio || '',
      avatar_url: author.avatar_url || '',
      birth_date: author.birth_date || '',
      nationality: author.nationality || '',
      website_url: author.website_url || '',
      is_featured: author.is_featured || false,
    });
    setIsDialogOpen(true);
  }, [form]);

  // Submit form (create or update)
  const onSubmit = useCallback(async (values: AuthorFormValues) => {
    setSubmitting(true);
    try {
      const payload = {
        name: values.name,
        bio: values.bio || null,
        avatar_url: values.avatar_url || null,
        birth_date: values.birth_date || null,
        nationality: values.nationality || null,
        website_url: values.website_url || null,
        is_featured: values.is_featured || false,
      };

      const url = editingAuthor ? `/api/authors/${editingAuthor.id}` : '/api/authors';
      const method = editingAuthor ? 'PATCH' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        setIsDialogOpen(false);
        setEditingAuthor(null);
        resetForm();
        fetchAuthors(); // Refresh data
      } else {
        const error = await response.json();
        console.error('Error saving author:', error);
      }
    } catch (error) {
      console.error('Error saving author:', error);
    } finally {
      setSubmitting(false);
    }
  }, [editingAuthor, resetForm, fetchAuthors]);

  // Delete author
  const deleteAuthor = useCallback(async () => {
    if (!deletingAuthorId) return;

    setSubmitting(true);
    try {
      const response = await fetch(`/api/authors/${deletingAuthorId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setDeleteDialogOpen(false);
        setDeletingAuthorId(null);
        fetchAuthors(); // Refresh data
      } else {
        const error = await response.json();
        if (error.error?.includes('foreign key constraint') || error.error?.includes('violates foreign key')) {
          alert('Cannot delete author with existing books. Please delete or reassign the books first.');
        } else {
          alert('Failed to delete author: ' + (error.error || 'Unknown error'));
        }
      }
    } catch (error) {
      console.error('Error deleting author:', error);
      alert('Failed to delete author. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }, [deletingAuthorId, fetchAuthors]);

  // Bulk delete selected authors
  const bulkDelete = useCallback(async () => {
    if (selectedIds.size === 0) return;

    setSubmitting(true);
    try {
      const results = await Promise.allSettled(
        Array.from(selectedIds).map(id =>
          fetch(`/api/authors/${id}`, { method: 'DELETE' })
        )
      );

      const succeeded = results.filter(r => r.status === 'fulfilled' && r.value.ok).length;
      const failed = results.length - succeeded;

      if (failed > 0) {
        alert(`Deleted ${succeeded} authors. ${failed} authors could not be deleted (likely due to existing books).`);
      }

      setSelectedIds(new Set());
      setIsAllSelected(false);
      fetchAuthors(); // Refresh data
    } catch (error) {
      console.error('Error deleting authors:', error);
      alert('Failed to delete some authors. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }, [selectedIds, fetchAuthors]);

  // Confirm delete
  const confirmDelete = useCallback((authorId: string) => {
    setDeletingAuthorId(authorId);
    setDeleteDialogOpen(true);
  }, []);

  // Clear filters
  const clearFilters = useCallback(() => {
    setSearchTerm('');
    setFilterFeatured('all');
  }, []);

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
      setSelectedIds(new Set(paginatedAuthors.map(a => a.id)));
    }
    setIsAllSelected(!isAllSelected);
  }, [isAllSelected, paginatedAuthors]);

  // Update isAllSelected when page changes
  useEffect(() => {
    const allSelected = paginatedAuthors.length > 0 &&
      paginatedAuthors.every(a => selectedIds.has(a.id));
    setIsAllSelected(allSelected);
  }, [paginatedAuthors, selectedIds]);

  return (
    <PageBody>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-[#222222]">Authors Management</h1>
            <p className="text-muted-foreground mt-1">
              {filteredAuthors.length} authors total
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
              <UserPlus className="h-4 w-4 mr-2" />
              Add Author
            </Button>
          </div>
        </div>

        {/* Filters */}
        <Card className="border-gray-200">
          <CardContent className="pt-6">
            <div className="flex flex-col sm:flex-row gap-4">
              {/* Search */}
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by name, bio, nationality..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9"
                />
                {searchTerm && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7"
                    onClick={() => setSearchTerm('')}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>

              {/* Featured Filter */}
              <Select value={filterFeatured} onValueChange={setFilterFeatured}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filter" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Authors</SelectItem>
                  <SelectItem value="true">Featured Only</SelectItem>
                  <SelectItem value="false">Not Featured</SelectItem>
                </SelectContent>
              </Select>

              {(searchTerm || filterFeatured !== 'all') && (
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
          </CardContent>
        </Card>

        {/* Authors Table */}
        <Card className="border-gray-200">
          <CardHeader>
            <CardTitle>
              Showing {paginatedAuthors.length} of {filteredAuthors.length} authors
              {filteredAuthors.length > ITEMS_PER_PAGE && ` (Page ${currentPage} of ${totalPages})`}
            </CardTitle>
            <CardDescription>
              Manage author profiles and information
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-[#FA8112]" />
              </div>
            ) : filteredAuthors.length === 0 ? (
              <div className="text-center py-12">
                <BookMarked className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium text-[#222222]">No authors found</h3>
                <p className="text-muted-foreground mt-1">
                  Try adjusting your filters or add your first author
                </p>
              </div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="hover:bg-[rgb(250, 243, 225)]/50">
                        <TableHead className="w-[50px]">
                          <Checkbox
                            checked={isAllSelected}
                            onCheckedChange={toggleSelectAll}
                          />
                        </TableHead>
                        <TableHead className="w-[400px]">Author</TableHead>
                        <TableHead className="w-[80px]">Books</TableHead>
                        <TableHead className="w-[200px]">Website</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {paginatedAuthors.map((author) => (
                        <AuthorRow
                          key={author.id}
                          author={author}
                          selected={selectedIds.has(author.id)}
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
                      {Math.min(currentPage * ITEMS_PER_PAGE, filteredAuthors.length)} of{' '}
                      {filteredAuthors.length} authors
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
                            className={currentPage === pageNum ? 'bg-[#FA8112] text-white hover:bg-[#e6730f]' : ''}
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

      {/* Add/Edit Author Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={(open) => {
        if (!open) {
          setIsDialogOpen(false);
          setEditingAuthor(null);
        }
      }}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingAuthor ? 'Edit Author' : 'Add New Author'}</DialogTitle>
            <DialogDescription>
              {editingAuthor ? 'Update the author information' : 'Enter the author details (only name is required)'}
            </DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {/* Name */}
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name *</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Enter author name"
                        {...field}
                        autoFocus
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Avatar URL */}
              <FormField
                control={form.control}
                name="avatar_url"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Avatar URL</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="https://example.com/avatar.jpg"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>URL to the author's profile image</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Bio */}
              <FormField
                control={form.control}
                name="bio"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Bio</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Brief biography of the author..."
                        rows={3}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Nationality */}
                <FormField
                  control={form.control}
                  name="nationality"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nationality</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="e.g., American, British"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Birth Date */}
                <FormField
                  control={form.control}
                  name="birth_date"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Birth Date</FormLabel>
                      <FormControl>
                        <Input
                          type="date"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Website URL */}
                <FormField
                  control={form.control}
                  name="website_url"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Website URL</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="https://authorwebsite.com"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Featured */}
              <FormField
                control={form.control}
                name="is_featured"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border border-gray-200 p-3">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">Featured Author</FormLabel>
                      <FormDescription>Show on homepage as featured</FormDescription>
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

              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setIsDialogOpen(false);
                    setEditingAuthor(null);
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
                    editingAuthor ? 'Save Changes' : 'Add Author'
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
            <AlertDialogTitle>Delete Author</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this author? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={deleteAuthor}
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
    </PageBody>
  );
}
