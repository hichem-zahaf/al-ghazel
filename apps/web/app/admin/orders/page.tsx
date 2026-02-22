'use client';

import { useState, useMemo, useEffect } from 'react';
import {
  Package,
  TrendingUp,
  TrendingDown,
  ShoppingBag,
  Truck,
  CheckCircle2,
  Clock,
  XCircle,
  Eye,
  Pencil,
  Trash2,
  Download,
  RefreshCw,
  Filter,
  Calendar,
  Search,
  Loader2,
} from 'lucide-react';
import { format } from 'date-fns';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { getSupabaseBrowserClient } from '@kit/supabase/browser-client';

import { PageBody } from '@kit/ui/page';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@kit/ui/card';
import { Button } from '@kit/ui/button';
import { Badge } from '@kit/ui/badge';
import { Input } from '@kit/ui/input';
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
import { Label } from '@kit/ui/label';
import { Textarea } from '@kit/ui/textarea';
import { AdminDataTable, FilterConfig, ViewMode } from '../_components/admin-data-table';

// Types
type OrderStatus = 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'refunded';
type DeliveryStatus = 'preparing' | 'in_transit' | 'out_for_delivery' | 'delivered' | 'failed' | 'returned';
type PaymentStatus = 'pending' | 'completed' | 'failed' | 'refunded';

interface Order {
  id: string;
  orderNumber: string;
  account: {
    id: string;
    name: string;
    email: string;
  };
  status: OrderStatus;
  deliveryStatus: DeliveryStatus;
  paymentStatus: PaymentStatus;
  subtotal: number;
  taxAmount: number;
  shippingAmount: number;
  discountAmount: number;
  total: number;
  items: {
    id: string;
    book: {
      id: string;
      title: string;
      author: string;
      coverImage: string;
    };
    quantity: number;
    unitPrice: number;
    totalPrice: number;
  }[];
  shippingAddress: {
    name: string;
    email: string;
    phone: string;
    addressLine1: string;
    addressLine2: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  };
  estimatedDeliveryDate?: Date;
  actualDeliveryDate?: Date;
  trackingNumber?: string;
  carrier?: string;
  couponCode?: string;
  customerNotes?: string;
  adminNotes?: string;
  createdAt: Date;
  updatedAt: Date;
}

// Fetch orders hook with real-time updates
function useOrders() {
  const queryClient = useQueryClient();

  useEffect(() => {
    // Create Supabase client for realtime
    const supabase = getSupabaseBrowserClient();

    // Subscribe to orders table changes
    const channel = supabase
      .channel('admin-orders-changes')
      .on(
        'postgres_changes',
        {
          event: '*', // Listen to all events (INSERT, UPDATE, DELETE)
          schema: 'public',
          table: 'orders',
        },
        () => {
          // Refetch orders when any change occurs
          queryClient.invalidateQueries({ queryKey: ['admin-orders'] });
        }
      )
      .subscribe();

    // Cleanup on unmount
    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);

  return useQuery({
    queryKey: ['admin-orders'],
    queryFn: async () => {
      const response = await fetch('/api/admin/orders');
      if (!response.ok) {
        throw new Error('Failed to fetch orders');
      }
      const result = await response.json();
      return result.data as Order[];
    },
    // No cache for admin dashboard - always fetch fresh data
    staleTime: 0,
    gcTime: 0,
    refetchOnWindowFocus: true,
    refetchOnMount: true,
    refetchOnReconnect: true,
  });
}

// Status Badge Components
function getOrderStatusBadge(status: OrderStatus) {
  const variants: Record<OrderStatus, { color: string; icon: any }> = {
    pending: { color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200', icon: Clock },
    processing: { color: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200', icon: Package },
    shipped: { color: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200', icon: Truck },
    delivered: { color: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200', icon: CheckCircle2 },
    cancelled: { color: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200', icon: XCircle },
    refunded: { color: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200', icon: TrendingDown },
  };

  const { color, icon: Icon } = variants[status];

  return (
    <Badge className={cn('gap-1.5', color)}>
      <Icon className="h-3 w-3" />
      <span className="capitalize">{status}</span>
    </Badge>
  );
}

function getPaymentStatusBadge(status: PaymentStatus) {
  const variants: Record<PaymentStatus, string> = {
    pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
    completed: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
    failed: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
    refunded: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200',
  };

  return <Badge className={cn('capitalize', variants[status])}>{status}</Badge>;
}

// Order Card Component (for card view)
function OrderCard({ order, onClick }: { order: Order; onClick: () => void }) {
  return (
    <Card className="hover:shadow-md transition-all cursor-pointer" onClick={onClick}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg">{order.orderNumber}</CardTitle>
            <CardDescription>{format(order.createdAt, 'MMM d, yyyy')}</CardDescription>
          </div>
          {getOrderStatusBadge(order.status)}
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Customer</span>
            <span className="text-sm font-medium">{order.account.name}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Items</span>
            <span className="text-sm">{order.items.length} items</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Total</span>
            <span className="text-lg font-bold">${order.total.toFixed(2)}</span>
          </div>
          <div className="flex items-center gap-2 pt-2">
            {getPaymentStatusBadge(order.paymentStatus)}
            <Badge variant="outline" className="capitalize">
              {order.deliveryStatus.replace('_', ' ')}
            </Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Order Detail Modal Component
function OrderDetailModal({
  order,
  open,
  onClose,
}: {
  order: Order | null;
  open: boolean;
  onClose: () => void;
}) {
  if (!order) return null;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>{order.orderNumber}</span>
            <div className="flex gap-2">
              {getOrderStatusBadge(order.status)}
              {getPaymentStatusBadge(order.paymentStatus)}
            </div>
          </DialogTitle>
          <DialogDescription>
            Placed on {format(order.createdAt, 'MMMM d, yyyy \'at\' h:mm a')}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Customer Information */}
          <div>
            <h3 className="font-semibold mb-3">Customer Information</h3>
            <div className="grid grid-cols-2 gap-4 p-4 bg-muted/50 rounded-lg">
              <div>
                <p className="text-sm text-muted-foreground">Name</p>
                <p className="font-medium">{order.account.name}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Email</p>
                <p className="font-medium">{order.account.email}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Phone</p>
                <p className="font-medium">{order.shippingAddress.phone}</p>
              </div>
            </div>
          </div>

          {/* Shipping Address */}
          <div>
            <h3 className="font-semibold mb-3">Shipping Address</h3>
            <div className="p-4 bg-muted/50 rounded-lg">
              <p className="font-medium">{order.shippingAddress.name}</p>
              <p className="text-sm mt-1">
                {order.shippingAddress.addressLine1}
                {order.shippingAddress.addressLine2 && `, ${order.shippingAddress.addressLine2}`}
              </p>
              <p className="text-sm">
                {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.postalCode}
              </p>
              <p className="text-sm">{order.shippingAddress.country}</p>
            </div>
          </div>

          {/* Order Items */}
          <div>
            <h3 className="font-semibold mb-3">Order Items</h3>
            <div className="space-y-3">
              {order.items.map((item) => (
                <div key={item.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="h-16 w-12 bg-beige rounded flex-shrink-0" />
                    <div>
                      <p className="font-medium">{item.book.title}</p>
                      <p className="text-sm text-muted-foreground">{item.book.author}</p>
                      <p className="text-sm text-muted-foreground">Qty: {item.quantity}</p>
                    </div>
                  </div>
                  <p className="font-medium">${item.totalPrice.toFixed(2)}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Order Summary */}
          <div>
            <h3 className="font-semibold mb-3">Order Summary</h3>
            <div className="space-y-2 p-4 bg-muted/50 rounded-lg">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Subtotal</span>
                <span>${order.subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Tax</span>
                <span>${order.taxAmount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Shipping</span>
                <span>${order.shippingAmount.toFixed(2)}</span>
              </div>
              {order.discountAmount > 0 && (
                <div className="flex justify-between text-green-600">
                  <span>Discount</span>
                  <span>-${order.discountAmount.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between text-lg font-bold pt-2 border-t">
                <span>Total</span>
                <span>${order.total.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Tracking Information */}
          {(order.trackingNumber || order.estimatedDeliveryDate) && (
            <div>
              <h3 className="font-semibold mb-3">Tracking Information</h3>
              <div className="grid grid-cols-2 gap-4 p-4 bg-muted/50 rounded-lg">
                {order.trackingNumber && (
                  <div>
                    <p className="text-sm text-muted-foreground">Tracking Number</p>
                    <p className="font-medium">{order.trackingNumber}</p>
                  </div>
                )}
                {order.carrier && (
                  <div>
                    <p className="text-sm text-muted-foreground">Carrier</p>
                    <p className="font-medium">{order.carrier}</p>
                  </div>
                )}
                {order.estimatedDeliveryDate && (
                  <div>
                    <p className="text-sm text-muted-foreground">Estimated Delivery</p>
                    <p className="font-medium">{format(order.estimatedDeliveryDate, 'MMM d, yyyy')}</p>
                  </div>
                )}
                {order.actualDeliveryDate && (
                  <div>
                    <p className="text-sm text-muted-foreground">Actual Delivery</p>
                    <p className="font-medium">{format(order.actualDeliveryDate, 'MMM d, yyyy')}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Notes */}
          {order.customerNotes && (
            <div>
              <h3 className="font-semibold mb-3">Customer Notes</h3>
              <p className="text-sm p-3 bg-muted/50 rounded-lg">{order.customerNotes}</p>
            </div>
          )}

          {/* Admin Notes */}
          <div>
            <Label htmlFor="admin-notes">Admin Notes</Label>
            <Textarea
              id="admin-notes"
              placeholder="Add internal notes about this order..."
              defaultValue={order.adminNotes}
              className="mt-2"
            />
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
          <Button variant="outline">
            <Eye className="h-4 w-4 mr-2" />
            View
          </Button>
          <Button variant="outline">
            <Pencil className="h-4 w-4 mr-2" />
            Edit
          </Button>
          <Button variant="destructive">
            <Trash2 className="h-4 w-4 mr-2" />
            Delete
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default function AdminOrdersPage() {
  const [viewMode, setViewMode] = useState<ViewMode>('table');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [paymentStatusFilter, setPaymentStatusFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Fetch orders from API
  const { data: orders = [], isLoading, error, refetch } = useOrders();

  // Table columns definition
  const columns = [
    {
      accessorKey: 'orderNumber',
      header: 'Order',
      cell: ({ row }: any) => (
        <span className="font-medium">{row.getValue('orderNumber')}</span>
      ),
    },
    {
      accessorKey: 'account',
      header: 'Customer',
      cell: ({ row }: any) => (
        <div>
          <p className="font-medium">{row.original.account.name}</p>
          <p className="text-sm text-muted-foreground">{row.original.account.email}</p>
        </div>
      ),
    },
    {
      accessorKey: 'items',
      header: 'Items',
      cell: ({ row }: any) => (
        <span className="text-sm">{row.original.items.length} items</span>
      ),
    },
    {
      accessorKey: 'total',
      header: 'Total',
      cell: ({ row }: any) => (
        <span className="font-medium">${row.getValue('total').toFixed(2)}</span>
      ),
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }: any) => getOrderStatusBadge(row.getValue('status')),
    },
    {
      accessorKey: 'paymentStatus',
      header: 'Payment',
      cell: ({ row }: any) => getPaymentStatusBadge(row.getValue('paymentStatus')),
    },
    {
      accessorKey: 'createdAt',
      header: 'Date',
      cell: ({ row }: any) => (
        <span className="text-sm">{format(row.getValue('createdAt'), 'MMM d, yyyy')}</span>
      ),
    },
  ];

  // Filter data
  const filteredData = useMemo(() => {
    return orders.filter((order) => {
      const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
      const matchesPaymentStatus = paymentStatusFilter === 'all' || order.paymentStatus === paymentStatusFilter;
      const matchesSearch =
        searchQuery === '' ||
        order.orderNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        order.account.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        order.account.email.toLowerCase().includes(searchQuery.toLowerCase());

      return matchesStatus && matchesPaymentStatus && matchesSearch;
    });
  }, [orders, statusFilter, paymentStatusFilter, searchQuery]);

  const handleRowClick = (order: Order) => {
    setSelectedOrder(order);
    setIsModalOpen(true);
  };

  const handleExport = (selectedRows: Order[]) => {
    console.log('Exporting:', selectedRows);
    // Implement export functionality
  };

  const handleRefresh = () => {
    refetch();
  };

  return (
    <PageBody>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold">Orders</h1>
          <p className="text-muted-foreground mt-1">
            Manage and track all customer orders
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Orders</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              ) : (
                <div className="text-2xl font-bold">{orders.length}</div>
              )}
              <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                <TrendingUp className="h-3 w-3 text-green-500" />
                All time orders
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Pending</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              ) : (
                <div className="text-2xl font-bold">{orders.filter(o => o.status === 'pending').length}</div>
              )}
              <p className="text-xs text-muted-foreground mt-1">Needs attention</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Processing</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              ) : (
                <div className="text-2xl font-bold">{orders.filter(o => o.status === 'processing').length}</div>
              )}
              <p className="text-xs text-muted-foreground mt-1">Being prepared</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Revenue</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              ) : (
                <div className="text-2xl font-bold">
                  ${orders.reduce((sum, o) => sum + o.total, 0).toFixed(2)}
                </div>
              )}
              <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                <TrendingUp className="h-3 w-3 text-green-500" />
                All time revenue
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Data Table */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>All Orders</CardTitle>
                <CardDescription>View and manage all orders in the system</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-16">
                <div className="flex flex-col items-center gap-3">
                  <Loader2 className="h-8 w-8 animate-spin text-orange" />
                  <p className="text-sm text-muted-foreground">Loading orders...</p>
                </div>
              </div>
            ) : error ? (
              <div className="flex flex-col items-center justify-center py-16">
                <XCircle className="h-12 w-12 text-destructive mb-3" />
                <p className="text-lg font-semibold mb-2">Failed to load orders</p>
                <p className="text-sm text-muted-foreground mb-4">There was an error fetching the orders data</p>
                <Button variant="outline" onClick={handleRefresh} className="gap-2">
                  <RefreshCw className="h-4 w-4" />
                  Try Again
                </Button>
              </div>
            ) : orders.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16">
                <ShoppingBag className="h-12 w-12 text-muted-foreground mb-3" />
                <p className="text-lg font-semibold mb-2">No orders found</p>
                <p className="text-sm text-muted-foreground">Orders will appear here once customers make purchases</p>
              </div>
            ) : (
              <AdminDataTable
                columns={columns}
                data={filteredData}
                searchable={true}
                searchPlaceholder="Search by order number, customer name, or email..."
                filterable={true}
                filters={[
                  {
                    key: 'status',
                    label: 'Status',
                    type: 'select',
                    options: [
                      { value: 'all', label: 'All Statuses' },
                      { value: 'pending', label: 'Pending' },
                      { value: 'processing', label: 'Processing' },
                      { value: 'shipped', label: 'Shipped' },
                      { value: 'delivered', label: 'Delivered' },
                      { value: 'cancelled', label: 'Cancelled' },
                    ],
                  },
                  {
                    key: 'paymentStatus',
                    label: 'Payment',
                    type: 'select',
                    options: [
                      { value: 'all', label: 'All Payments' },
                      { value: 'pending', label: 'Pending' },
                      { value: 'completed', label: 'Completed' },
                      { value: 'failed', label: 'Failed' },
                      { value: 'refunded', label: 'Refunded' },
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
                renderCard={(order) => (
                  <OrderCard order={order as Order} onClick={() => handleRowClick(order as Order)} />
                )}
                emptyMessage="No orders found"
              />
            )}
          </CardContent>
        </Card>

        {/* Order Detail Modal */}
        <OrderDetailModal order={selectedOrder} open={isModalOpen} onClose={() => setIsModalOpen(false)} />
      </div>
    </PageBody>
  );
}
