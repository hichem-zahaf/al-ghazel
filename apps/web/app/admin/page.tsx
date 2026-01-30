'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import {
  ShoppingBag,
  TrendingUp,
  TrendingDown,
  Users,
  BookOpen,
  DollarSign,
  Clock,
  Star,
  ArrowUpRight,
  BookMarked,
  Sparkles,
  Shuffle,
  SlidersHorizontal,
  Tags,
  UserCog,
  ChevronRight,
  LayoutDashboard,
} from 'lucide-react';
import { format } from 'date-fns';

import { PageBody } from '@kit/ui/page';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@kit/ui/card';
import { Button } from '@kit/ui/button';
import { Badge } from '@kit/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@kit/ui/select';
import { cn } from '@kit/ui/utils';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

// Types
type DateRange = '7d' | '30d' | '90d' | '1y' | 'all';

// Mock Data (replace with actual data fetching)
const mockStats = {
  totalOrders: 1234,
  totalRevenue: 45678.90,
  totalUsers: 892,
  totalBooks: 456,
  avgOrderValue: 37.02,
  conversionRate: 3.2,
  avgSessionDuration: 245, // seconds
  mostSoldBook: {
    id: '1',
    title: 'The Midnight Library',
    author: 'Matt Haig',
    sold: 156,
  },
};

const revenueData = [
  { month: 'Jan', revenue: 4000, orders: 120 },
  { month: 'Feb', revenue: 5000, orders: 150 },
  { month: 'Mar', revenue: 4500, orders: 130 },
  { month: 'Apr', revenue: 6000, orders: 180 },
  { month: 'May', revenue: 5500, orders: 165 },
  { month: 'Jun', revenue: 7000, orders: 210 },
];

const ordersByStatus = [
  { name: 'Completed', value: 456, color: '#22c55e' },
  { name: 'Pending', value: 234, color: '#f59e0b' },
  { name: 'Processing', value: 189, color: '#3b82f6' },
  { name: 'Shipped', value: 312, color: '#8b5cf6' },
  { name: 'Cancelled', value: 43, color: '#ef4444' },
];

const topSellingBooks = [
  { id: '1', title: 'The Midnight Library', author: 'Matt Haig', sales: 156, revenue: 2654.40 },
  { id: '2', title: 'Atomic Habits', author: 'James Clear', sales: 142, revenue: 2059.00 },
  { id: '3', title: 'Where the Crawdads Sing', author: 'Delia Owens', sales: 128, revenue: 2046.72 },
  { id: '4', title: 'The Silent Patient', author: 'Alex Michaelides', sales: 115, revenue: 1493.85 },
  { id: '5', title: 'Educated', author: 'Tara Westover', sales: 98, revenue: 1568.02 },
];

const recentOrders = [
  { id: 'ORD-001', customer: 'John Doe', total: 45.99, status: 'pending', date: new Date('2024-01-30') },
  { id: 'ORD-002', customer: 'Jane Smith', total: 67.50, status: 'processing', date: new Date('2024-01-30') },
  { id: 'ORD-003', customer: 'Bob Johnson', total: 23.99, status: 'shipped', date: new Date('2024-01-29') },
  { id: 'ORD-004', customer: 'Alice Williams', total: 89.99, status: 'delivered', date: new Date('2024-01-29') },
  { id: 'ORD-005', customer: 'Charlie Brown', total: 34.50, status: 'pending', date: new Date('2024-01-28') },
];

const managementCards = [
  {
    title: 'Books',
    description: 'Manage book catalog, inventory, and pricing',
    href: '/admin/settings?tab=books',
    icon: BookOpen,
    color: 'bg-orange text-white',
    stats: `${mockStats.totalBooks} books`,
  },
  {
    title: 'Authors',
    description: 'Manage author profiles and information',
    href: '/admin/settings?tab=authors',
    icon: BookMarked,
    color: 'bg-blue-500 text-white',
    stats: '89 authors',
  },
  {
    title: 'Homepage',
    description: 'Configure homepage layout and featured content',
    href: '/admin/settings?tab=homepage',
    icon: LayoutDashboard,
    color: 'bg-purple-500 text-white',
    stats: 'Active',
  },
  {
    title: 'Recommendations',
    description: 'Manage AI-powered recommendation algorithms',
    href: '/admin/settings?tab=recommendations',
    icon: Sparkles,
    color: 'bg-pink-500 text-white',
    stats: 'AI Enabled',
  },
  {
    title: 'Book of the Day',
    description: 'Schedule and manage featured books',
    href: '/admin/settings?tab=book-of-the-day',
    icon: Star,
    color: 'bg-yellow-500 text-white',
    stats: 'Scheduled',
  },
  {
    title: 'Author of the Day',
    description: 'Schedule and manage featured authors',
    href: '/admin/settings?tab=author-of-the-day',
    icon: UserCog,
    color: 'bg-green-500 text-white',
    stats: 'Scheduled',
  },
  {
    title: 'Book Roulette',
    description: 'Configure book roulette settings',
    href: '/admin/settings?tab=roulette',
    icon: Shuffle,
    color: 'bg-red-500 text-white',
    stats: '10 daily',
  },
  {
    title: 'User Algorithms',
    description: 'Manage personalization algorithms',
    href: '/admin/settings?tab=algorithms',
    icon: SlidersHorizontal,
    color: 'bg-indigo-500 text-white',
    stats: 'Active',
  },
  {
    title: 'AI Settings',
    description: 'Configure AI client and prompts',
    href: '/admin/settings?tab=ai',
    icon: Sparkles,
    color: 'bg-cyan-500 text-white',
    stats: 'OpenAI',
  },
];

// Status Badge Component
function getStatusBadge(status: string) {
  const variants: Record<string, string> = {
    pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
    processing: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
    shipped: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
    delivered: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
    cancelled: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
  };

  return (
    <Badge className={cn('capitalize', variants[status] || variants.pending)}>
      {status}
    </Badge>
  );
}

// Stat Card Component
function StatCard({
  title,
  value,
  change,
  trend,
  icon: Icon,
}: {
  title: string;
  value: string | number;
  change?: string;
  trend?: 'up' | 'down' | 'neutral';
  icon: any;
}) {
  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {change && (
          <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
            {trend === 'up' && <TrendingUp className="h-3 w-3 text-green-500" />}
            {trend === 'down' && <TrendingDown className="h-3 w-3 text-red-500" />}
            {change}
          </p>
        )}
      </CardContent>
    </Card>
  );
}

// Date Range Selector Component
function DateRangeSelector({ value, onChange }: { value: DateRange; onChange: (value: DateRange) => void }) {
  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger className="w-[180px]">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="7d">Last 7 days</SelectItem>
        <SelectItem value="30d">Last 30 days</SelectItem>
        <SelectItem value="90d">Last 90 days</SelectItem>
        <SelectItem value="1y">Last year</SelectItem>
        <SelectItem value="all">All time</SelectItem>
      </SelectContent>
    </Select>
  );
}

export default function AdminDashboardPage() {
  const [dateRange, setDateRange] = useState<DateRange>('30d');

  return (
    <PageBody>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Admin Dashboard</h1>
            <p className="text-muted-foreground mt-1">
              Overview of your bookstore performance and metrics
            </p>
          </div>
          <DateRangeSelector value={dateRange} onChange={setDateRange} />
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
          <StatCard
            title="Total Revenue"
            value={`$${mockStats.totalRevenue.toLocaleString()}`}
            change="+12.5% from last period"
            trend="up"
            icon={DollarSign}
          />
          <StatCard
            title="Total Orders"
            value={mockStats.totalOrders}
            change="+8.2% from last period"
            trend="up"
            icon={ShoppingBag}
          />
          <StatCard
            title="Active Users"
            value={mockStats.totalUsers}
            change="+5.3% from last period"
            trend="up"
            icon={Users}
          />
          <StatCard
            title="Avg. Session Duration"
            value={`${Math.floor(mockStats.avgSessionDuration / 60)}:${(mockStats.avgSessionDuration % 60).toString().padStart(2, '0')}`}
            change="+2.1% from last period"
            trend="up"
            icon={Clock}
          />
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* Revenue & Orders Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Revenue & Orders Trend</CardTitle>
              <CardDescription>Monthly revenue and order volume</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={revenueData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis yAxisId="left" />
                  <YAxis yAxisId="right" orientation="right" />
                  <Tooltip />
                  <Legend />
                  <Bar yAxisId="right" dataKey="orders" fill="#FA8112" name="Orders" />
                  <Line yAxisId="left" type="monotone" dataKey="revenue" stroke="#222222" name="Revenue ($)" />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Orders by Status Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Orders by Status</CardTitle>
              <CardDescription>Distribution of order statuses</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={ordersByStatus}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {ordersByStatus.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Top Selling Books */}
        <Card>
          <CardHeader>
            <CardTitle>Top Selling Books</CardTitle>
            <CardDescription>Best performing books this period</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {topSellingBooks.map((book, idx) => (
                <div key={book.id} className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-orange text-white font-bold text-sm">
                      {idx + 1}
                    </div>
                    <div>
                      <p className="font-medium">{book.title}</p>
                      <p className="text-sm text-muted-foreground">{book.author}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">${book.revenue.toFixed(2)}</p>
                    <p className="text-sm text-muted-foreground">{book.sales} sold</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recent Orders Section */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Recent Orders</CardTitle>
                <CardDescription>Latest customer orders</CardDescription>
              </div>
              <Link href="/admin/orders">
                <Button variant="outline" size="sm" className="gap-1">
                  View All
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentOrders.map((order) => (
                <div key={order.id} className="flex items-center justify-between py-2 border-b last:border-0">
                  <div className="flex items-center gap-4">
                    <div>
                      <p className="font-medium">{order.id}</p>
                      <p className="text-sm text-muted-foreground">{order.customer}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <p className="font-medium">${order.total.toFixed(2)}</p>
                    {getStatusBadge(order.status)}
                    <p className="text-sm text-muted-foreground">{format(order.date, 'MMM d, yyyy')}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recent Users Section */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Recent Users</CardTitle>
                <CardDescription>Newest registered users</CardDescription>
              </div>
              <Link href="/admin/users">
                <Button variant="outline" size="sm" className="gap-1">
                  View All
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentOrders.slice(0, 5).map((order, idx) => (
                <div key={idx} className="flex items-center justify-between py-2 border-b last:border-0">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-orange/10 flex items-center justify-center">
                      <UserCog className="h-5 w-5 text-orange" />
                    </div>
                    <div>
                      <p className="font-medium">{order.customer}</p>
                      <p className="text-sm text-muted-foreground">user{idx + 1}@example.com</p>
                    </div>
                  </div>
                  <Badge variant="outline">Active</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Management Cards */}
        <div>
          <h2 className="text-xl font-semibold mb-4">Management</h2>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {managementCards.map((card) => (
              <Link key={card.title} href={card.href}>
                <Card className="hover:shadow-md transition-all hover:scale-[1.02] cursor-pointer h-full">
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <div className={cn('p-3 rounded-lg', card.color)}>
                        <card.icon className="h-5 w-5" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <h3 className="font-semibold">{card.title}</h3>
                          <ArrowUpRight className="h-4 w-4 text-muted-foreground" />
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">{card.description}</p>
                        <Badge variant="outline" className="mt-2">
                          {card.stats}
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </PageBody>
  );
}
