'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import {
  Package,
  TrendingDown,
  TrendingUp,
  BookOpen,
  ShoppingBag,
  Truck,
  CheckCircle2,
  Clock,
  XCircle,
  ChevronRight,
  ChevronLeft,
  ChevronsLeft,
  ChevronsRight,
  Heart,
  Star,
} from 'lucide-react';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@kit/ui/card';
import { Badge } from '@kit/ui/badge';
import { Button } from '@kit/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@kit/ui/table';
import { cn } from '@kit/ui/utils';
import { BookCard } from '../../(marketing)/_components/bookstore/book-card';
import type { Book } from '../../../types/bookstore';

// Types
type OrderStatus = 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
type DeliveryStatus = 'preparing' | 'in_transit' | 'out_for_delivery' | 'delivered' | 'failed';

interface Order {
  id: string;
  orderNumber: string;
  date: Date;
  total: number;
  status: OrderStatus;
  deliveryStatus: DeliveryStatus;
  items: {
    book: Book;
    quantity: number;
  }[];
  estimatedDelivery?: Date;
}

// Mock Data
const mockBooks: Book[] = [
  {
    id: '1',
    title: 'The Midnight Library',
    author: { id: 'a1', name: 'Matt Haig', avatar: '', bio: '' },
    coverImage: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=400&h=600&fit=crop',
    price: 16.99,
    originalPrice: 24.99,
    discountPercentage: 32,
    description: 'A dazzling novel about all the choices that go into a life well lived.',
    categories: [
      { id: 'c1', name: 'Fiction', slug: 'fiction', bookCount: 1200 },
      { id: 'c2', name: 'Fantasy', slug: 'fantasy', bookCount: 800 },
    ],
    rating: 4.5,
    publishedDate: new Date('2020-08-25'),
    isbn: '978-0525559474',
    pages: 304,
  },
  {
    id: '2',
    title: 'Atomic Habits',
    author: { id: 'a2', name: 'James Clear', avatar: '', bio: '' },
    coverImage: 'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?w=400&h=600&fit=crop',
    price: 14.50,
    originalPrice: 18.99,
    discountPercentage: 24,
    description: 'An Easy & Proven Way to Build Good Habits & Break Bad Ones.',
    categories: [
      { id: 'c3', name: 'Self-Help', slug: 'self-help', bookCount: 500 },
      { id: 'c4', name: 'Psychology', slug: 'psychology', bookCount: 350 },
    ],
    rating: 4.8,
    publishedDate: new Date('2018-10-16'),
    isbn: '978-0735211292',
    pages: 320,
  },
  {
    id: '3',
    title: 'The Silent Patient',
    author: { id: 'a3', name: 'Alex Michaelides', avatar: '', bio: '' },
    coverImage: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=400&h=600&fit=crop',
    price: 12.99,
    description: 'The instant New York Times bestseller.',
    categories: [
      { id: 'c5', name: 'Thriller', slug: 'thriller', bookCount: 450 },
      { id: 'c1', name: 'Fiction', slug: 'fiction', bookCount: 1200 },
    ],
    rating: 4.3,
    publishedDate: new Date('2019-02-05'),
    isbn: '978-1250301697',
    pages: 336,
  },
  {
    id: '4',
    title: 'Where the Crawdads Sing',
    author: { id: 'a4', name: 'Delia Owens', avatar: '', bio: '' },
    coverImage: 'https://images.unsplash.com/photo-1495630806767-7886d27fb74b?w=400&h=600&fit=crop',
    price: 15.99,
    originalPrice: 19.99,
    discountPercentage: 20,
    description: 'A painfully beautiful first novel that is at once a murder mystery and a coming-of-age narrative.',
    categories: [
      { id: 'c1', name: 'Fiction', slug: 'fiction', bookCount: 1200 },
      { id: 'c6', name: 'Mystery', slug: 'mystery', bookCount: 300 },
    ],
    rating: 4.7,
    publishedDate: new Date('2018-08-14'),
    isbn: '978-0735219090',
    pages: 384,
  },
];

const mockOrders: Order[] = [
  {
    id: 'o1',
    orderNumber: 'ORD-2024-001',
    date: new Date('2024-01-28'),
    total: 45.97,
    status: 'shipped',
    deliveryStatus: 'in_transit',
    items: [
      { book: mockBooks[0]!, quantity: 1 },
      { book: mockBooks[1]!, quantity: 2 },
    ],
    estimatedDelivery: new Date('2024-01-30'),
  },
  {
    id: 'o2',
    orderNumber: 'ORD-2024-002',
    date: new Date('2024-01-27'),
    total: 12.99,
    status: 'processing',
    deliveryStatus: 'preparing',
    items: [{ book: mockBooks[2]!, quantity: 1 }],
    estimatedDelivery: new Date('2024-02-02'),
  },
  {
    id: 'o3',
    orderNumber: 'ORD-2024-003',
    date: new Date('2024-01-26'),
    total: 31.98,
    status: 'delivered',
    deliveryStatus: 'delivered',
    items: [{ book: mockBooks[3]!, quantity: 2 }],
    estimatedDelivery: new Date('2024-01-28'),
  },
  {
    id: 'o4',
    orderNumber: 'ORD-2024-004',
    date: new Date('2024-01-25'),
    total: 24.99,
    status: 'shipped',
    deliveryStatus: 'out_for_delivery',
    items: [{ book: mockBooks[0]!, quantity: 1 }],
    estimatedDelivery: new Date('2024-01-29'),
  },
  {
    id: 'o5',
    orderNumber: 'ORD-2024-005',
    date: new Date('2024-01-24'),
    total: 18.50,
    status: 'pending',
    deliveryStatus: 'preparing',
    items: [{ book: mockBooks[1]!, quantity: 1 }],
    estimatedDelivery: new Date('2024-02-01'),
  },
  {
    id: 'o6',
    orderNumber: 'ORD-2024-006',
    date: new Date('2024-01-23'),
    total: 52.97,
    status: 'delivered',
    deliveryStatus: 'delivered',
    items: [
      { book: mockBooks[2]!, quantity: 1 },
      { book: mockBooks[3]!, quantity: 1 },
    ],
    estimatedDelivery: new Date('2024-01-26'),
  },
  {
    id: 'o7',
    orderNumber: 'ORD-2024-007',
    date: new Date('2024-01-22'),
    total: 16.99,
    status: 'cancelled',
    deliveryStatus: 'failed',
    items: [{ book: mockBooks[0]!, quantity: 1 }],
  },
  {
    id: 'o8',
    orderNumber: 'ORD-2024-008',
    date: new Date('2024-01-21'),
    total: 29.98,
    status: 'processing',
    deliveryStatus: 'preparing',
    items: [{ book: mockBooks[1]!, quantity: 2 }],
    estimatedDelivery: new Date('2024-01-30'),
  },
];

// Status Components
function getStatusBadge(status: OrderStatus) {
  const variants = {
    pending: { color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200', icon: Clock },
    processing: { color: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200', icon: Package },
    shipped: { color: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200', icon: Truck },
    delivered: { color: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200', icon: CheckCircle2 },
    cancelled: { color: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200', icon: XCircle },
  };

  const { color, icon: Icon } = variants[status];

  return (
    <Badge className={cn('gap-1.5', color)}>
      <Icon className="h-3 w-3" />
      <span className="capitalize">{status}</span>
    </Badge>
  );
}

function getDeliveryStatusBadge(status: DeliveryStatus) {
  const config = {
    preparing: { label: 'Preparing', color: 'text-blue-600', progress: 25 },
    in_transit: { label: 'In Transit', color: 'text-purple-600', progress: 50 },
    out_for_delivery: { label: 'Out for Delivery', color: 'text-orange-600', progress: 75 },
    delivered: { label: 'Delivered', color: 'text-green-600', progress: 100 },
    failed: { label: 'Delivery Failed', color: 'text-red-600', progress: 0 },
  };

  const { label, color, progress } = config[status];

  return (
    <div className="flex items-center gap-2">
      <span className={cn('text-sm font-medium', color)}>{label}</span>
      {progress > 0 && progress < 100 && (
        <div className="h-1.5 w-16 bg-gray-200 rounded-full overflow-hidden">
          <div className="h-full bg-current rounded-full transition-all" style={{ width: `${progress}%` }} />
        </div>
      )}
    </div>
  );
}

// Greeting Component
function Greeting() {
  const [greeting, setGreeting] = useState('');

  useMemo(() => {
    const hour = new Date().getHours();
    if (hour < 12) setGreeting('Good morning');
    else if (hour < 18) setGreeting('Good afternoon');
    else setGreeting('Good evening');
  }, []);

  return (
    <div className="mb-6">
      <h1 className="text-3xl font-bold text-black dark:text-beige-light">
        {greeting}! Welcome back to Al-Ghazel
      </h1>
      <p className="text-muted-foreground mt-1">
        Here is what is happening with your orders and account today.
      </p>
    </div>
  );
}

// Stats Cards Component
function StatsCards() {
  const stats = [
    {
      title: 'Total Spent',
      value: '$127.94',
      change: '+12.5%',
      trend: 'up' as const,
      icon: ShoppingBag,
      color: 'text-orange',
    },
    {
      title: 'Total Saved',
      value: '$34.50',
      change: '+8.2%',
      trend: 'up' as const,
      icon: TrendingDown,
      color: 'text-green-500',
    },
    {
      title: 'Active Orders',
      value: '3',
      change: '2 pending',
      trend: 'neutral' as const,
      icon: Package,
      color: 'text-blue-500',
    },
    {
      title: 'Books Read',
      value: '12',
      change: '+3 this month',
      trend: 'up' as const,
      icon: BookOpen,
      color: 'text-purple-500',
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
      {stats.map((stat) => (
        <Card key={stat.title} className="hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {stat.title}
            </CardTitle>
            <stat.icon className={cn('h-4 w-4', stat.color)} />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stat.value}</div>
            <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
              {stat.trend === 'up' && <TrendingUp className="h-3 w-3 text-green-500" />}
              {stat.trend === 'neutral' && <Clock className="h-3 w-3 text-blue-500" />}
              {stat.change}
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

// Orders Table Component
function OrdersTable() {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const totalPages = Math.ceil(mockOrders.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentOrders = mockOrders.slice(startIndex, endIndex);

  const getPageNumbers = () => {
    const pages = [];
    const maxVisible = 5;

    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      if (currentPage <= 3) {
        for (let i = 1; i <= 4; i++) pages.push(i);
        pages.push('...');
        pages.push(totalPages);
      } else if (currentPage >= totalPages - 2) {
        pages.push(1);
        pages.push('...');
        for (let i = totalPages - 3; i <= totalPages; i++) pages.push(i);
      } else {
        pages.push(1);
        pages.push('...');
        for (let i = currentPage - 1; i <= currentPage + 1; i++) pages.push(i);
        pages.push('...');
        pages.push(totalPages);
      }
    }

    return pages;
  };

  return (
    <Card className="mb-6">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Recent Orders</CardTitle>
            <CardDescription>Track your order status and delivery</CardDescription>
          </div>
          <div className="text-sm text-muted-foreground">
            {mockOrders.length} total orders
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Order</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Items</TableHead>
              <TableHead>Total</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Delivery</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {currentOrders.map((order) => (
              <TableRow key={order.id}>
                <TableCell className="font-medium">{order.orderNumber}</TableCell>
                <TableCell>{order.date.toLocaleDateString()}</TableCell>
                <TableCell>
                  <div className="flex flex-col gap-1">
                    {order.items.slice(0, 2).map((item, idx) => (
                      <span key={idx} className="text-sm text-muted-foreground">
                        {item.quantity}x {item.book.title}
                      </span>
                    ))}
                    {order.items.length > 2 && (
                      <span className="text-xs text-muted-foreground">
                        +{order.items.length - 2} more
                      </span>
                    )}
                  </div>
                </TableCell>
                <TableCell className="font-medium">${order.total.toFixed(2)}</TableCell>
                <TableCell>{getStatusBadge(order.status)}</TableCell>
                <TableCell>{getDeliveryStatusBadge(order.deliveryStatus)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between mt-4 pt-4 border-t">
            <div className="text-sm text-muted-foreground">
              Showing {startIndex + 1} to {Math.min(endIndex, mockOrders.length)} of {mockOrders.length} orders
            </div>
            <div className="flex items-center gap-1">
              <Button
                variant="outline"
                size="sm"
                className="h-8 w-8 p-0"
                onClick={() => setCurrentPage(1)}
                disabled={currentPage === 1}
              >
                <ChevronsLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="h-8 w-8 p-0"
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>

              {getPageNumbers().map((page, idx) => (
                page === '...' ? (
                  <span key={`ellipsis-${idx}`} className="px-2 text-muted-foreground">
                    ...
                  </span>
                ) : (
                  <Button
                    key={page}
                    variant={currentPage === page ? 'default' : 'outline'}
                    size="sm"
                    className="h-8 w-8 p-0"
                    onClick={() => setCurrentPage(page as number)}
                  >
                    {page}
                  </Button>
                )
              ))}

              <Button
                variant="outline"
                size="sm"
                className="h-8 w-8 p-0"
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="h-8 w-8 p-0"
                onClick={() => setCurrentPage(totalPages)}
                disabled={currentPage === totalPages}
              >
                <ChevronsRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// Featured Books Component
function FeaturedBooks() {
  return (
    <Card className="mb-6">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Recommended for You</CardTitle>
            <CardDescription>Based on your reading history</CardDescription>
          </div>
          <Link href="/books">
            <Button variant="outline" size="sm" className="gap-1">
              Browse All
              <ChevronRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
          {mockBooks.map((book) => (
            <BookCard
              key={book.id}
              book={book}
              variant="compact"
              className="flex-shrink-0"
            />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

// Quick Actions Component
function QuickActions() {
  const actions = [
    {
      title: 'Continue Shopping',
      description: 'Explore our collection',
      href: '/books',
      icon: BookOpen,
      color: 'bg-orange text-white',
    },
    {
      title: 'View Wishlist',
      description: '12 books saved',
      href: '/home/wishlist',
      icon: Heart,
      color: 'bg-pink-500 text-white',
    },
    {
      title: 'Track Orders',
      description: '3 active orders',
      href: '/home/orders',
      icon: Truck,
      color: 'bg-blue-500 text-white',
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
      {actions.map((action) => (
        <Link key={action.title} href={action.href}>
          <Card className="hover:shadow-md transition-all hover:scale-[1.02] cursor-pointer h-full">
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <div className={cn('p-3 rounded-lg', action.color)}>
                  <action.icon className="h-5 w-5" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold mb-1">{action.title}</h3>
                  <p className="text-sm text-muted-foreground">{action.description}</p>
                </div>
                <ChevronRight className="h-5 w-5 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>
        </Link>
      ))}
    </div>
  );
}

// Main Dashboard Component
export function BookstoreDashboard() {
  return (
    <div className="animate-in fade-in flex flex-col space-y-6 pb-36 duration-500">
      <Greeting />
      <StatsCards />
      <OrdersTable />
      <FeaturedBooks />
      <QuickActions />
    </div>
  );
}
