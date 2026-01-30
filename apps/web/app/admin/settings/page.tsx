'use client';

import { useState, useMemo } from 'react';
import {
  BookOpen,
  BookMarked,
  Plus,
  Pencil,
  Trash2,
  Search,
  RefreshCw,
  Star,
  UserCog,
  Sparkles,
  Shuffle,
  SlidersHorizontal,
  Tags,
  Settings as SettingsIcon,
  LayoutDashboard,
  Calendar,
  TrendingUp,
  Save,
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
import { Checkbox } from '@kit/ui/checkbox';
import { AdminDataTable, FilterConfig } from '../_components/admin-data-table';

// Types
interface Book {
  id: string;
  title: string;
  author: string;
  isbn: string;
  price: number;
  stock: number;
  rating: number;
  status: 'active' | 'inactive' | 'out_of_stock';
}

interface Author {
  id: string;
  name: string;
  bookCount: number;
  nationality: string;
  status: 'active' | 'inactive';
}

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

// Mock Data
const mockBooks: Book[] = [
  { id: 'b1', title: 'The Midnight Library', author: 'Matt Haig', isbn: '978-0525559474', price: 16.99, stock: 45, rating: 4.5, status: 'active' },
  { id: 'b2', title: 'Atomic Habits', author: 'James Clear', isbn: '978-0735211292', price: 14.50, stock: 32, rating: 4.8, status: 'active' },
  { id: 'b3', title: 'The Silent Patient', author: 'Alex Michaelides', isbn: '978-1250301697', price: 12.99, stock: 0, rating: 4.3, status: 'out_of_stock' },
];

const mockAuthors: Author[] = [
  { id: 'a1', name: 'Matt Haig', bookCount: 12, nationality: 'British', status: 'active' },
  { id: 'a2', name: 'James Clear', bookCount: 3, nationality: 'American', status: 'active' },
  { id: 'a3', name: 'Alex Michaelides', bookCount: 2, nationality: 'Cypriot', status: 'active' },
];

const mockCoupons: Coupon[] = [
  { id: 'c1', code: 'SUMMER20', discountType: 'percentage', discountValue: 20, usageLimit: 100, usedCount: 45, validFrom: new Date('2024-01-01'), validUntil: new Date('2024-12-31'), isActive: true },
  { id: 'c2', code: 'WELCOME10', discountType: 'fixed', discountValue: 10, usageLimit: 500, usedCount: 123, validFrom: new Date('2024-01-01'), validUntil: new Date('2024-06-30'), isActive: true },
];

export default function AdminSettingsPage() {
  const [activeTab, setActiveTab] = useState('books');
  const [searchParams] = useState(new URLSearchParams());
  const initialTab = searchParams.get('tab') || 'books';
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);
  const [selectedAuthor, setSelectedAuthor] = useState<Author | null>(null);
  const [isBookModalOpen, setIsBookModalOpen] = useState(false);
  const [isAuthorModalOpen, setIsAuthorModalOpen] = useState(false);
  const [isCouponModalOpen, setIsCouponModalOpen] = useState(false);

  // Book Table Columns
  const bookColumns = [
    {
      accessorKey: 'title',
      header: 'Title',
      cell: ({ row }: any) => <span className="font-medium">{row.getValue('title')}</span>,
    },
    {
      accessorKey: 'author',
      header: 'Author',
      cell: ({ row }: any) => <span>{row.getValue('author')}</span>,
    },
    {
      accessorKey: 'isbn',
      header: 'ISBN',
      cell: ({ row }: any) => <span className="text-sm text-muted-foreground">{row.getValue('isbn')}</span>,
    },
    {
      accessorKey: 'price',
      header: 'Price',
      cell: ({ row }: any) => <span className="font-medium">${row.getValue('price').toFixed(2)}</span>,
    },
    {
      accessorKey: 'stock',
      header: 'Stock',
      cell: ({ row }: any) => (
        <span className={cn(row.getValue('stock') === 0 ? 'text-red-500' : '')}>
          {row.getValue('stock')}
        </span>
      ),
    },
    {
      accessorKey: 'rating',
      header: 'Rating',
      cell: ({ row }: any) => (
        <div className="flex items-center gap-1">
          <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
          <span>{row.getValue('rating')}</span>
        </div>
      ),
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }: any) => {
        const status = row.getValue('status');
        const variants: Record<string, string> = {
          active: 'bg-green-100 text-green-800',
          inactive: 'bg-gray-100 text-gray-800',
          out_of_stock: 'bg-red-100 text-red-800',
        };
        return <Badge className={cn('capitalize', variants[status])}>{status.replace('_', ' ')}</Badge>;
      },
    },
  ];

  // Author Table Columns
  const authorColumns = [
    {
      accessorKey: 'name',
      header: 'Name',
      cell: ({ row }: any) => <span className="font-medium">{row.getValue('name')}</span>,
    },
    {
      accessorKey: 'nationality',
      header: 'Nationality',
      cell: ({ row }: any) => <span>{row.getValue('nationality')}</span>,
    },
    {
      accessorKey: 'bookCount',
      header: 'Books',
      cell: ({ row }: any) => <span className="font-medium">{row.getValue('bookCount')}</span>,
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }: any) => {
        const status = row.getValue('status');
        const variants: Record<string, string> = {
          active: 'bg-green-100 text-green-800',
          inactive: 'bg-gray-100 text-gray-800',
        };
        return <Badge className={cn(variants[status])}>{status}</Badge>;
      },
    },
  ];

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
          <TabsList className="grid w-full grid-cols-4 lg:grid-cols-8 h-auto">
            <TabsTrigger value="books" className="gap-2">
              <BookOpen className="h-4 w-4" />
              <span className="hidden sm:inline">Books</span>
            </TabsTrigger>
            <TabsTrigger value="authors" className="gap-2">
              <BookMarked className="h-4 w-4" />
              <span className="hidden sm:inline">Authors</span>
            </TabsTrigger>
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

          {/* Books Tab */}
          <TabsContent value="books" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Manage Books</CardTitle>
                    <CardDescription>Add, edit, or remove books from your catalog</CardDescription>
                  </div>
                  <Button onClick={() => setIsBookModalOpen(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Book
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <AdminDataTable
                  columns={bookColumns}
                  data={mockBooks}
                  searchable={true}
                  searchPlaceholder="Search by title, author, or ISBN..."
                  selectable={true}
                  pagination={true}
                  pageSize={10}
                  onRowClick={(book) => {
                    setSelectedBook(book as Book);
                    setIsBookModalOpen(true);
                  }}
                />
              </CardContent>
            </Card>
          </TabsContent>

          {/* Authors Tab */}
          <TabsContent value="authors" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Manage Authors</CardTitle>
                    <CardDescription>Add, edit, or remove authors</CardDescription>
                  </div>
                  <Button onClick={() => setIsAuthorModalOpen(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Author
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <AdminDataTable
                  columns={authorColumns}
                  data={mockAuthors}
                  searchable={true}
                  searchPlaceholder="Search authors..."
                  selectable={true}
                  pagination={true}
                  pageSize={10}
                  onRowClick={(author) => {
                    setSelectedAuthor(author as Author);
                    setIsAuthorModalOpen(true);
                  }}
                />
              </CardContent>
            </Card>
          </TabsContent>

          {/* Homepage Tab */}
          <TabsContent value="homepage" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Homepage Settings</CardTitle>
                <CardDescription>Configure homepage layout and featured content</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="hero-banner">Hero Banner</Label>
                    <p className="text-sm text-muted-foreground">Show promotional banner on homepage</p>
                  </div>
                  <Switch id="hero-banner" defaultChecked />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="featured-books-count">Featured Books Count</Label>
                  <Input id="featured-books-count" type="number" defaultValue="8" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="new-releases-count">New Releases Count</Label>
                  <Input id="new-releases-count" type="number" defaultValue="12" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="banner-text">Banner Text</Label>
                  <Textarea id="banner-text" placeholder="Summer Sale - Up to 50% off!" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="banner-link">Banner Link</Label>
                  <Input id="banner-link" placeholder="/books?sale=true" />
                </div>
                <Button>Save Changes</Button>
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
                      {mockBooks.map((book) => (
                        <SelectItem key={book.id} value={book.id}>{book.title}</SelectItem>
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
                      {mockAuthors.map((author) => (
                        <SelectItem key={author.id} value={author.id}>{author.name}</SelectItem>
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

        {/* Book Edit Modal */}
        <Dialog open={isBookModalOpen} onOpenChange={setIsBookModalOpen}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{selectedBook ? 'Edit Book' : 'Add New Book'}</DialogTitle>
              <DialogDescription>
                {selectedBook ? 'Update book information' : 'Add a new book to your catalog'}
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="book-title">Title</Label>
                <Input id="book-title" defaultValue={selectedBook?.title} />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="book-author">Author</Label>
                <Input id="book-author" defaultValue={selectedBook?.author} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="book-isbn">ISBN</Label>
                  <Input id="book-isbn" defaultValue={selectedBook?.isbn} />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="book-price">Price</Label>
                  <Input id="book-price" type="number" step="0.01" defaultValue={selectedBook?.price} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="book-stock">Stock</Label>
                  <Input id="book-stock" type="number" defaultValue={selectedBook?.stock} />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="book-status">Status</Label>
                  <Select defaultValue={selectedBook?.status || 'active'}>
                    <SelectTrigger id="book-status">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                      <SelectItem value="out_of_stock">Out of Stock</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="book-description">Description</Label>
                <Textarea id="book-description" placeholder="Book description..." />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsBookModalOpen(false)}>Cancel</Button>
              <Button>
                <Save className="h-4 w-4 mr-2" />
                Save Book
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Author Edit Modal */}
        <Dialog open={isAuthorModalOpen} onOpenChange={setIsAuthorModalOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{selectedAuthor ? 'Edit Author' : 'Add New Author'}</DialogTitle>
              <DialogDescription>
                {selectedAuthor ? 'Update author information' : 'Add a new author to your catalog'}
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="author-name">Name</Label>
                <Input id="author-name" defaultValue={selectedAuthor?.name} />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="author-nationality">Nationality</Label>
                <Input id="author-nationality" defaultValue={selectedAuthor?.nationality} />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="author-bio">Bio</Label>
                <Textarea id="author-bio" placeholder="Author biography..." />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAuthorModalOpen(false)}>Cancel</Button>
              <Button>
                <Save className="h-4 w-4 mr-2" />
                Save Author
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

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
