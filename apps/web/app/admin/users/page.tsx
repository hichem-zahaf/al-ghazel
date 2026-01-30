'use client';

import { useState, useMemo } from 'react';
import {
  Users,
  TrendingUp,
  Mail,
  Shield,
  Key,
  Eye,
  Pencil,
  Trash2,
  Download,
  RefreshCw,
  User,
  Calendar,
  ShoppingBag,
  Clock,
  CheckCircle2,
  XCircle,
} from 'lucide-react';
import { format } from 'date-fns';

import { PageBody } from '@kit/ui/page';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@kit/ui/card';
import { Button } from '@kit/ui/button';
import { Badge } from '@kit/ui/badge';
import { Input } from '@kit/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@kit/ui/avatar';
import { cn } from '@kit/ui/utils';
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
import { Label } from '@kit/ui/label';
import { AdminDataTable, FilterConfig, ViewMode } from '../_components/admin-data-table';

// Types
type UserStatus = 'active' | 'inactive' | 'suspended' | 'banned';
type UserRole = 'customer' | 'admin' | 'super-admin';

interface User {
  id: string;
  name: string;
  email: string;
  pictureUrl?: string;
  role: UserRole;
  status: UserStatus;
  createdAt: Date;
  lastLoginAt?: Date;
  emailVerified: boolean;
  phone?: string;
  metadata: {
    totalOrders: number;
    totalSpent: number;
    avgOrderValue: number;
    lastOrderDate?: Date;
    sessionCount: number;
    avgSessionDuration: number; // seconds
    wishlistCount: number;
    reviewCount: number;
  };
}

interface UserOrder {
  id: string;
  orderNumber: string;
  total: number;
  status: string;
  createdAt: Date;
}

interface UserTrend {
  period: string;
  orders: number;
  spent: number;
}

// Mock Data
const mockUsers: User[] = [
  {
    id: 'u1',
    name: 'John Doe',
    email: 'john@example.com',
    pictureUrl: '',
    role: 'customer',
    status: 'active',
    createdAt: new Date('2024-01-15'),
    lastLoginAt: new Date('2024-01-30'),
    emailVerified: true,
    phone: '+1234567890',
    metadata: {
      totalOrders: 12,
      totalSpent: 456.78,
      avgOrderValue: 38.07,
      lastOrderDate: new Date('2024-01-28'),
      sessionCount: 45,
      avgSessionDuration: 324,
      wishlistCount: 8,
      reviewCount: 5,
    },
  },
  {
    id: 'u2',
    name: 'Jane Smith',
    email: 'jane@example.com',
    pictureUrl: '',
    role: 'customer',
    status: 'active',
    createdAt: new Date('2024-01-10'),
    lastLoginAt: new Date('2024-01-29'),
    emailVerified: true,
    phone: '+1234567891',
    metadata: {
      totalOrders: 8,
      totalSpent: 234.56,
      avgOrderValue: 29.32,
      lastOrderDate: new Date('2024-01-25'),
      sessionCount: 32,
      avgSessionDuration: 287,
      wishlistCount: 5,
      reviewCount: 2,
    },
  },
  {
    id: 'u3',
    name: 'Bob Johnson',
    email: 'bob@example.com',
    pictureUrl: '',
    role: 'customer',
    status: 'inactive',
    createdAt: new Date('2023-12-01'),
    lastLoginAt: new Date('2024-01-15'),
    emailVerified: true,
    metadata: {
      totalOrders: 3,
      totalSpent: 89.97,
      avgOrderValue: 29.99,
      lastOrderDate: new Date('2024-01-10'),
      sessionCount: 12,
      avgSessionDuration: 145,
      wishlistCount: 2,
      reviewCount: 0,
    },
  },
  // Add more mock users as needed...
];

const mockUserOrders: UserOrder[] = [
  { id: 'o1', orderNumber: 'ORD-001', total: 45.99, status: 'delivered', createdAt: new Date('2024-01-28') },
  { id: 'o2', orderNumber: 'ORD-002', total: 67.50, status: 'shipped', createdAt: new Date('2024-01-25') },
  { id: 'o3', orderNumber: 'ORD-003', total: 23.99, status: 'processing', createdAt: new Date('2024-01-20') },
];

const mockUserTrends: UserTrend[] = [
  { period: 'Jan', orders: 12, spent: 456.78 },
  { period: 'Dec', orders: 8, spent: 234.56 },
  { period: 'Nov', orders: 5, spent: 145.00 },
  { period: 'Oct', orders: 3, spent: 89.97 },
];

// Status Badge Component
function getUserStatusBadge(status: UserStatus) {
  const variants: Record<UserStatus, string> = {
    active: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
    inactive: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200',
    suspended: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
    banned: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
  };

  return <Badge className={cn('capitalize', variants[status])}>{status}</Badge>;
}

function getRoleBadge(role: UserRole) {
  const variants: Record<UserRole, { color: string; label: string }> = {
    customer: { color: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200', label: 'Customer' },
    admin: { color: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200', label: 'Admin' },
    'super-admin': { color: 'bg-orange text-white', label: 'Super Admin' },
  };

  const { color, label } = variants[role];
  return <Badge className={color}>{label}</Badge>;
}

// User Card Component (for card view)
function UserCard({ user, onClick }: { user: User; onClick: () => void }) {
  const initials = user.name.split(' ').map(n => n[0]).join('').toUpperCase();

  return (
    <Card className="hover:shadow-md transition-all cursor-pointer" onClick={onClick}>
      <CardHeader>
        <div className="flex items-center gap-4">
          <Avatar className="h-12 w-12">
            <AvatarImage src={user.pictureUrl} />
            <AvatarFallback className="bg-orange text-white">{initials}</AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <CardTitle className="text-lg truncate">{user.name}</CardTitle>
            <CardDescription className="truncate">{user.email}</CardDescription>
          </div>
          {getUserStatusBadge(user.status)}
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Orders</span>
            <span className="font-medium">{user.metadata.totalOrders}</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Total Spent</span>
            <span className="font-medium">${user.metadata.totalSpent.toFixed(2)}</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Last Login</span>
            <span className="font-medium">
              {user.lastLoginAt ? format(user.lastLoginAt, 'MMM d') : 'Never'}
            </span>
          </div>
          <div className="flex items-center gap-2 pt-2">
            {getRoleBadge(user.role)}
            {user.emailVerified ? (
              <Badge variant="outline" className="gap-1">
                <CheckCircle2 className="h-3 w-3" />
                Verified
              </Badge>
            ) : (
              <Badge variant="outline" className="gap-1">
                <XCircle className="h-3 w-3" />
                Unverified
              </Badge>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// User Detail Modal Component
function UserDetailModal({
  user,
  open,
  onClose,
}: {
  user: User | null;
  open: boolean;
  onClose: () => void;
}) {
  if (!user) return null;

  const initials = user.name.split(' ').map(n => n[0]).join('').toUpperCase();

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>User Details</DialogTitle>
          <DialogDescription>View and manage user account information</DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="orders">Orders</TabsTrigger>
            <TabsTrigger value="trends">Trends</TabsTrigger>
            <TabsTrigger value="actions">Actions</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* User Profile */}
            <div className="flex items-start gap-6 p-6 bg-muted/50 rounded-lg">
              <Avatar className="h-20 w-20">
                <AvatarImage src={user.pictureUrl} />
                <AvatarFallback className="bg-orange text-white text-2xl">{initials}</AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="text-2xl font-bold">{user.name}</h3>
                  {getUserStatusBadge(user.status)}
                  {getRoleBadge(user.role)}
                </div>
                <p className="text-muted-foreground">{user.email}</p>
                <div className="flex items-center gap-4 mt-3 text-sm">
                  {user.phone && (
                    <span>📞 {user.phone}</span>
                  )}
                  <span>📅 Joined {format(user.createdAt, 'MMMM d, yyyy')}</span>
                  {user.lastLoginAt && (
                    <span>🔑 Last login {format(user.lastLoginAt, 'MMMM d, yyyy')}</span>
                  )}
                </div>
              </div>
            </div>

            {/* Account Statistics */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Total Orders</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{user.metadata.totalOrders}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Total Spent</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">${user.metadata.totalSpent.toFixed(2)}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Avg Order Value</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">${user.metadata.avgOrderValue.toFixed(2)}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Sessions</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{user.metadata.sessionCount}</div>
                  <p className="text-xs text-muted-foreground">
                    Avg: {Math.floor(user.metadata.avgSessionDuration / 60)}:{(user.metadata.avgSessionDuration % 60).toString().padStart(2, '0')}
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Additional Info */}
            <div className="grid grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Engagement</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Wishlist Items</span>
                    <span className="font-medium">{user.metadata.wishlistCount}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Reviews Written</span>
                    <span className="font-medium">{user.metadata.reviewCount}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Email Verified</span>
                    <Badge variant={user.emailVerified ? 'default' : 'secondary'}>
                      {user.emailVerified ? 'Yes' : 'No'}
                    </Badge>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Last Activity</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Last Order</span>
                    <span className="font-medium">
                      {user.metadata.lastOrderDate
                        ? format(user.metadata.lastOrderDate, 'MMM d, yyyy')
                        : 'Never'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Last Login</span>
                    <span className="font-medium">
                      {user.lastLoginAt ? format(user.lastLoginAt, 'MMM d, yyyy') : 'Never'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Account Age</span>
                    <span className="font-medium">
                      {Math.floor((Date.now() - user.createdAt.getTime()) / (1000 * 60 * 60 * 24))} days
                    </span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="orders" className="space-y-4">
            <div className="space-y-3">
              {mockUserOrders.map((order) => (
                <Card key={order.id}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="h-10 w-10 rounded-full bg-orange/10 flex items-center justify-center">
                          <ShoppingBag className="h-5 w-5 text-orange" />
                        </div>
                        <div>
                          <p className="font-medium">{order.orderNumber}</p>
                          <p className="text-sm text-muted-foreground">{format(order.createdAt, 'MMM d, yyyy')}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">${order.total.toFixed(2)}</p>
                        <Badge variant="outline" className="capitalize">{order.status}</Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="trends" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Order History</CardTitle>
                <CardDescription>Monthly orders and spending</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {mockUserTrends.map((trend) => (
                    <div key={trend.period} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                      <span className="font-medium">{trend.period}</span>
                      <div className="flex items-center gap-6">
                        <span className="text-sm text-muted-foreground">{trend.orders} orders</span>
                        <span className="font-medium">${trend.spent.toFixed(2)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="actions" className="space-y-6">
            {/* Change Password */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Key className="h-5 w-5" />
                  Change Password
                </CardTitle>
                <CardDescription>Manually set a new password for this user</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="new-password">New Password</Label>
                  <Input id="new-password" type="password" placeholder="Enter new password" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirm-password">Confirm Password</Label>
                  <Input id="confirm-password" type="password" placeholder="Confirm new password" />
                </div>
                <Button>Update Password</Button>
              </CardContent>
            </Card>

            {/* Trigger Password Reset */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Mail className="h-5 w-5" />
                  Send Password Reset Email
                </CardTitle>
                <CardDescription>Send a password reset link to the user's email</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  This will send an email to <strong>{user.email}</strong> with a link to reset their password.
                </p>
                <Button variant="outline">Send Reset Email</Button>
              </CardContent>
            </Card>

            {/* Change Role */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  Change Role
                </CardTitle>
                <CardDescription>Update user's role and permissions</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Select defaultValue={user.role}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="customer">Customer</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                    <SelectItem value="super-admin">Super Admin</SelectItem>
                  </SelectContent>
                </Select>
                <Button>Update Role</Button>
              </CardContent>
            </Card>

            {/* Change Status */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Change Account Status
                </CardTitle>
                <CardDescription>Activate, suspend, or ban this user account</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Select defaultValue={user.status}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                    <SelectItem value="suspended">Suspended</SelectItem>
                    <SelectItem value="banned">Banned</SelectItem>
                  </SelectContent>
                </Select>
                <Button>Update Status</Button>
              </CardContent>
            </Card>

            {/* Danger Zone */}
            <Card className="border-destructive">
              <CardHeader>
                <CardTitle className="text-destructive">Danger Zone</CardTitle>
                <CardDescription>Irreversible actions for this user account</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button variant="destructive" className="w-full">
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete User Account
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
          <Button variant="outline">
            <Eye className="h-4 w-4 mr-2" />
            View Full Profile
          </Button>
          <Button variant="outline">
            <Pencil className="h-4 w-4 mr-2" />
            Edit User
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default function AdminUsersPage() {
  const [viewMode, setViewMode] = useState<ViewMode>('table');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Table columns definition
  const columns = [
    {
      accessorKey: 'name',
      header: 'User',
      cell: ({ row }: any) => {
        const user = row.original;
        const initials = user.name.split(' ').map((n: string) => n[0]).join('').toUpperCase();
        return (
          <div className="flex items-center gap-3">
            <Avatar className="h-8 w-8">
              <AvatarImage src={user.pictureUrl} />
              <AvatarFallback className="bg-orange text-white text-xs">{initials}</AvatarFallback>
            </Avatar>
            <div>
              <p className="font-medium">{user.name}</p>
              <p className="text-sm text-muted-foreground">{user.email}</p>
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: 'role',
      header: 'Role',
      cell: ({ row }: any) => getRoleBadge(row.getValue('role')),
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }: any) => getUserStatusBadge(row.getValue('status')),
    },
    {
      accessorKey: 'metadata.totalOrders',
      header: 'Orders',
      cell: ({ row }: any) => (
        <span className="font-medium">{row.original.metadata.totalOrders}</span>
      ),
    },
    {
      accessorKey: 'metadata.totalSpent',
      header: 'Total Spent',
      cell: ({ row }: any) => (
        <span className="font-medium">${row.getValue('metadata.totalSpent').toFixed(2)}</span>
      ),
    },
    {
      accessorKey: 'lastLoginAt',
      header: 'Last Login',
      cell: ({ row }: any) => {
        const lastLogin = row.getValue('lastLoginAt');
        return lastLogin ? (
          <span className="text-sm">{format(lastLogin, 'MMM d, yyyy')}</span>
        ) : (
          <span className="text-sm text-muted-foreground">Never</span>
        );
      },
    },
    {
      accessorKey: 'createdAt',
      header: 'Joined',
      cell: ({ row }: any) => (
        <span className="text-sm">{format(row.getValue('createdAt'), 'MMM d, yyyy')}</span>
      ),
    },
  ];

  // Filter data
  const filteredData = useMemo(() => {
    return mockUsers.filter((user) => {
      const matchesStatus = statusFilter === 'all' || user.status === statusFilter;
      const matchesRole = roleFilter === 'all' || user.role === roleFilter;
      const matchesSearch =
        searchQuery === '' ||
        user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.email.toLowerCase().includes(searchQuery.toLowerCase());

      return matchesStatus && matchesRole && matchesSearch;
    });
  }, [statusFilter, roleFilter, searchQuery]);

  const handleRowClick = (user: User) => {
    setSelectedUser(user);
    setIsModalOpen(true);
  };

  const handleExport = (selectedRows: User[]) => {
    console.log('Exporting:', selectedRows);
    // Implement export functionality
  };

  const handleRefresh = () => {
    console.log('Refreshing data...');
    // Implement refresh functionality
  };

  return (
    <PageBody>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold">Users</h1>
          <p className="text-muted-foreground mt-1">
            Manage user accounts and permissions
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Users</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{mockUsers.length}</div>
              <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                <TrendingUp className="h-3 w-3 text-green-500" />
                +15.3% from last month
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Active Now</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{mockUsers.filter(u => u.status === 'active').length}</div>
              <p className="text-xs text-muted-foreground mt-1">Currently online</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">New This Week</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {mockUsers.filter(u => Date.now() - u.createdAt.getTime() < 7 * 24 * 60 * 60 * 1000).length}
              </div>
              <p className="text-xs text-muted-foreground mt-1">New registrations</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Verified</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{mockUsers.filter(u => u.emailVerified).length}</div>
              <p className="text-xs text-muted-foreground mt-1">Email verified</p>
            </CardContent>
          </Card>
        </div>

        {/* Data Table */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>All Users</CardTitle>
                <CardDescription>View and manage all user accounts</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <AdminDataTable
              columns={columns}
              data={filteredData}
              searchable={true}
              searchPlaceholder="Search by name or email..."
              filterable={true}
              filters={[
                {
                  key: 'status',
                  label: 'Status',
                  type: 'select',
                  options: [
                    { value: 'all', label: 'All Statuses' },
                    { value: 'active', label: 'Active' },
                    { value: 'inactive', label: 'Inactive' },
                    { value: 'suspended', label: 'Suspended' },
                    { value: 'banned', label: 'Banned' },
                  ],
                },
                {
                  key: 'role',
                  label: 'Role',
                  type: 'select',
                  options: [
                    { value: 'all', label: 'All Roles' },
                    { value: 'customer', label: 'Customer' },
                    { value: 'admin', label: 'Admin' },
                    { value: 'super-admin', label: 'Super Admin' },
                  ],
                },
              ]}
              selectable={true}
              pagination={true}
              pageSize={10}
              viewModeToggleable={true}
              defaultViewMode={viewMode}
              onRowClick={handleRowClick}
              onExport={handleExport}
              onRefresh={handleRefresh}
              renderCard={(user) => (
                <UserCard user={user as User} onClick={() => handleRowClick(user as User)} />
              )}
              emptyMessage="No users found"
            />
          </CardContent>
        </Card>

        {/* User Detail Modal */}
        <UserDetailModal user={selectedUser} open={isModalOpen} onClose={() => setIsModalOpen(false)} />
      </div>
    </PageBody>
  );
}
