'use client';

import { useState, useMemo, useEffect, type ComponentType } from 'react';
import { format, isWithinInterval } from 'date-fns';
import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query';
import { getSupabaseBrowserClient } from '@kit/supabase/browser-client';
import type { ColumnDef } from '@tanstack/react-table';

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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@kit/ui/dialog';
import { Label } from '@kit/ui/label';
import { Textarea } from '@kit/ui/textarea';
import { Checkbox } from '@kit/ui/checkbox';
import { toast } from 'sonner';

import {
  Package,
  TrendingUp,
  ShoppingBag,
  Truck,
  CheckCircle2,
  Check,
  Clock,
  XCircle,
  Eye,
  Pencil,
  Trash2,
  Download,
  RefreshCw,
  Search,
  Loader2,
  ChevronDown,
  ChevronUp,
  ChevronsUpDown,
  MoreHorizontal,
} from 'lucide-react';

import { AdminDataTable, type FilterConfig, type ExportFormat } from '../_components/admin-data-table';
import {
  fetchOrdersAction,
  updateOrderAction,
  deleteOrdersAction,
  type Order,
  type OrderStatus,
  type PaymentStatus,
} from './_actions';
import { Popover, PopoverContent, PopoverTrigger } from '@kit/ui/popover';

// Fetch orders hook with real-time updates
function useOrders() {
  const queryClient = useQueryClient();

  useEffect(() => {
    const supabase = getSupabaseBrowserClient();

    const channel = supabase
      .channel('admin-orders-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'orders',
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ['admin-orders'] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);

  return useQuery({
    queryKey: ['admin-orders'],
    queryFn: async () => {
      const result = await fetchOrdersAction();
      return result as Order[];
    },
    staleTime: 0,
    gcTime: 0,
    refetchOnWindowFocus: true,
    refetchOnMount: true,
    refetchOnReconnect: true,
  });
}

// Update order mutation
function useUpdateOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ orderId, updates }: { orderId: string; updates: Partial<Order> }) => {
      return await updateOrderAction({
        orderId,
        updates: {
          status: updates.status,
          paymentStatus: updates.paymentStatus,
          trackingNumber: updates.trackingNumber,
          carrier: updates.carrier,
          adminNotes: updates.adminNotes,
        },
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-orders'] });
      toast.success('Order updated successfully');
    },
    onError: () => {
      toast.error('Failed to update order');
    },
  });
}

// Delete order mutation
function useDeleteOrders() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (orderIds: string[]) => {
      return await deleteOrdersAction(orderIds);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-orders'] });
      toast.success('Orders deleted successfully');
    },
    onError: () => {
      toast.error('Failed to delete orders');
    },
  });
}

// Status Badge Components
function getOrderStatusBadge(status: OrderStatus) {
  const variants: Record<OrderStatus, { color: string; icon: ComponentType<{ className?: string }> }> = {
    pending: { color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200', icon: Clock },
    processing: { color: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200', icon: Package },
    shipped: { color: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200', icon: Truck },
    delivered: { color: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200', icon: CheckCircle2 },
    cancelled: { color: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200', icon: XCircle },
    refunded: { color: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200', icon: Trash2 },
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

// Status Cell Component with Popover for quick status change
function StatusCell({
  order,
  onStatusChange,
}: {
  order: Order;
  onStatusChange: (orderId: string, newStatus: OrderStatus, newPaymentStatus?: PaymentStatus) => void;
}) {
  const [open, setOpen] = useState(false);
  const [isPending, setIsPending] = useState(false);

  // Determine payment status based on order status
  const getPaymentStatusForOrderStatus = (orderStatus: OrderStatus): PaymentStatus | undefined => {
    switch (orderStatus) {
      case 'delivered':
        return 'completed';
      case 'refunded':
        return 'refunded';
      case 'cancelled':
        return 'failed';
      default:
        return undefined; // Keep existing payment status
    }
  };

  const handleStatusSelect = (newStatus: OrderStatus) => {
    setIsPending(true);
    const newPaymentStatus = getPaymentStatusForOrderStatus(newStatus);
    onStatusChange(order.id, newStatus, newPaymentStatus);
    setOpen(false);
    // Reset pending state after a short delay
    setTimeout(() => setIsPending(false), 500);
  };

  const statuses: OrderStatus[] = ['pending', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded'];

  // Show indicator if payment status will change
  const getStatusDescription = (status: OrderStatus) => {
    const paymentStatus = getPaymentStatusForOrderStatus(status);
    if (!paymentStatus || paymentStatus === order.paymentStatus) return null;
    return `→ Payment: ${paymentStatus}`;
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          className={cn(
            'cursor-pointer hover:opacity-80 transition-opacity',
            isPending && 'opacity-50 pointer-events-none'
          )}
          disabled={isPending}
        >
          {getOrderStatusBadge(order.status)}
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-[240px] p-2" align="start">
        <p className="text-sm font-medium mb-2 text-muted-foreground">Change Status</p>
        <div className="space-y-1">
          {statuses.map((status) => {
            const statusDescription = getStatusDescription(status);
            return (
              <button
                key={status}
                onClick={() => handleStatusSelect(status)}
                className={cn(
                  'w-full flex flex-col items-start gap-1 px-3 py-2 rounded-md text-sm transition-colors',
                  'hover:bg-muted',
                  order.status === status && 'bg-accent'
                )}
              >
                <div className="flex items-center gap-2">
                  {getOrderStatusBadge(status as OrderStatus)}
                </div>
                {statusDescription && (
                  <span className="text-xs text-muted-foreground ml-6">
                    {statusDescription}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </PopoverContent>
    </Popover>
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
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// Confirm Order Dialog
function ConfirmOrderDialog({
  open,
  onClose,
  onConfirm,
  orders,
}: {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  orders: Order[];
}) {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Confirm Order{orders.length > 1 ? 's' : ''}</DialogTitle>
          <DialogDescription>
            Are you sure you want to confirm {orders.length > 1 ? `${orders.length} orders` : 'this order'}?
            The status will be changed to Processing.
          </DialogDescription>
        </DialogHeader>

        {orders.length > 0 && (
          <div className="max-h-60 overflow-y-auto space-y-2">
            {orders.map((order) => (
              <div key={order.id} className="flex items-center justify-between p-2 bg-muted/50 rounded">
                <span className="font-medium">{order.orderNumber}</span>
                <span className="text-sm text-muted-foreground">{order.account.name}</span>
              </div>
            ))}
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={onConfirm}>
            Confirm
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// Edit Order Dialog
function EditOrderDialog({
  order,
  open,
  onClose,
  onSave,
}: {
  order: Order | null;
  open: boolean;
  onClose: () => void;
  onSave: (updates: Partial<Order>) => void;
}) {
  const [status, setStatus] = useState<OrderStatus>('pending');
  const [trackingNumber, setTrackingNumber] = useState('');
  const [carrier, setCarrier] = useState('');
  const [adminNotes, setAdminNotes] = useState('');

  useEffect(() => {
    if (order) {
      setStatus(order.status);
      setTrackingNumber(order.trackingNumber || '');
      setCarrier(order.carrier || '');
      setAdminNotes(order.adminNotes || '');
    }
  }, [order]);

  const handleSave = () => {
    onSave({ status, trackingNumber, carrier, adminNotes });
    onClose();
  };

  if (!order) return null;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Edit Order {order.orderNumber}</DialogTitle>
          <DialogDescription>Update order details and tracking information</DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="status">Order Status</Label>
            <Select value={status} onValueChange={(v) => setStatus(v as OrderStatus)}>
              <SelectTrigger id="status">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="processing">Processing</SelectItem>
                <SelectItem value="shipped">Shipped</SelectItem>
                <SelectItem value="delivered">Delivered</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
                <SelectItem value="refunded">Refunded</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="tracking">Tracking Number</Label>
            <Input
              id="tracking"
              value={trackingNumber}
              onChange={(e) => setTrackingNumber(e.target.value)}
              placeholder="Enter tracking number"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="carrier">Carrier</Label>
            <Input
              id="carrier"
              value={carrier}
              onChange={(e) => setCarrier(e.target.value)}
              placeholder="e.g., FedEx, UPS, DHL"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Admin Notes</Label>
            <Textarea
              id="notes"
              value={adminNotes}
              onChange={(e) => setAdminNotes(e.target.value)}
              placeholder="Add internal notes about this order..."
              rows={3}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSave}>
            Save Changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// Delete Confirmation Dialog
function DeleteConfirmDialog({
  open,
  onClose,
  onConfirm,
  count,
}: {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  count: number;
}) {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete Order{count > 1 ? 's' : ''}</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete {count > 1 ? `${count} orders` : 'this order'}? This action cannot be undone.
          </DialogDescription>
        </DialogHeader>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="destructive" onClick={onConfirm}>
            Delete
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// Status Change Dialog
function StatusChangeDialog({
  open,
  onClose,
  onConfirm,
  orders,
}: {
  open: boolean;
  onClose: () => void;
  onConfirm: (status: OrderStatus) => void;
  orders: Order[];
}) {
  const [selectedStatus, setSelectedStatus] = useState<OrderStatus>('processing');

  const statuses: OrderStatus[] = ['pending', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded'];

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Change Status</DialogTitle>
          <DialogDescription>
            Select new status for {orders.length > 1 ? `${orders.length} orders` : 'this order'}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-2 py-4">
          {statuses.map((status) => (
            <button
              key={status}
              onClick={() => setSelectedStatus(status)}
              className={cn(
                'w-full flex items-center justify-between p-3 rounded-lg border-2 transition-all',
                selectedStatus === status
                  ? 'border-primary bg-primary/5'
                  : 'border-border hover:bg-muted'
              )}
            >
              <span className="capitalize">{status}</span>
              {selectedStatus === status && (
                <Check className="h-4 w-4 text-primary" />
              )}
            </button>
          ))}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={() => onConfirm(selectedStatus)}>
            Change Status
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default function AdminOrdersPage() {
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isStatusDialogOpen, setIsStatusDialogOpen] = useState(false);
  const [selectedRows, setSelectedRows] = useState<Order[]>([]);

  const { data: orders = [], isLoading, error, refetch } = useOrders();
  const updateOrder = useUpdateOrder();
  const deleteOrders = useDeleteOrders();

  // Filter configurations
  const filterConfigs: FilterConfig[] = [
    {
      key: 'status',
      label: 'Status',
      type: 'select',
      options: [
        { value: 'pending', label: 'Pending' },
        { value: 'processing', label: 'Processing' },
        { value: 'shipped', label: 'Shipped' },
        { value: 'delivered', label: 'Delivered' },
        { value: 'cancelled', label: 'Cancelled' },
        { value: 'refunded', label: 'Refunded' },
      ],
    },
    {
      key: 'paymentStatus',
      label: 'Payment',
      type: 'select',
      options: [
        { value: 'pending', label: 'Pending' },
        { value: 'completed', label: 'Completed' },
        { value: 'failed', label: 'Failed' },
        { value: 'refunded', label: 'Refunded' },
      ],
    },
  ];

  // Helper component for sortable header
  const SortableHeader = ({ column, children }: { column: any; children: React.ReactNode }) => {
    const isSorted = column.getIsSorted();
    return (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(isSorted === 'asc')}
        className="h-auto p-0 font-semibold"
      >
        {children}
        {isSorted === 'asc' ? (
          <ChevronUp className="ml-2 h-4 w-4" />
        ) : isSorted === 'desc' ? (
          <ChevronDown className="ml-2 h-4 w-4" />
        ) : (
          <ChevronsUpDown className="ml-2 h-4 w-4 opacity-50" />
        )}
      </Button>
    );
  };

  // Table columns definition
  const columns = useMemo<ColumnDef<Order>[]>(() => [
    {
      accessorKey: 'orderNumber',
      header: ({ column }) => <SortableHeader column={column}>Order</SortableHeader>,
      cell: ({ row }) => (
        <span className="font-medium">{row.getValue('orderNumber')}</span>
      ),
    },
    {
      accessorKey: 'customer',
      header: ({ column }) => <SortableHeader column={column}>Customer</SortableHeader>,
      cell: ({ row }) => {
        const order = row.original;
        return (
          <div>
            <p className="font-medium">{order.account.name}</p>
            <p className="text-sm text-muted-foreground">{order.shippingAddress.phone}</p>
          </div>
        );
      },
    },
    {
      accessorKey: 'items',
      header: 'Items',
      cell: ({ row }) => {
        const order = row.original;
        return (
          <div className="max-w-xs">
            {order.items.slice(0, 2).map((item, idx) => (
              <p key={idx} className="text-sm truncate">
                {item.quantity}x {item.book.title}
              </p>
            ))}
            {order.items.length > 2 && (
              <p className="text-sm text-muted-foreground">+{order.items.length - 2} more</p>
            )}
          </div>
        );
      },
    },
    {
      accessorKey: 'shippingAddress',
      header: 'Delivery Address',
      cell: ({ row }) => {
        const address = row.original.shippingAddress;
        return (
          <p className="text-sm max-w-xs truncate">
            {address.city}, {address.state}
          </p>
        );
      },
    },
    {
      accessorKey: 'trackingNumber',
      header: 'Tracking',
      cell: ({ row }) => {
        const tracking = row.original.trackingNumber;
        return tracking ? (
          <span className="text-sm font-mono">{tracking}</span>
        ) : (
          <span className="text-sm text-muted-foreground">-</span>
        );
      },
    },
    {
      accessorKey: 'total',
      header: ({ column }) => <SortableHeader column={column}>Total</SortableHeader>,
      cell: ({ row }) => {
        const total = row.getValue('total') as number;
        return <span className="font-medium">${total.toFixed(2)}</span>;
      },
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => (
        <StatusCell
          order={row.original}
          onStatusChange={(orderId, newStatus, newPaymentStatus) => {
            const updates: Partial<Order> = { status: newStatus };
            if (newPaymentStatus) {
              updates.paymentStatus = newPaymentStatus;
            }
            updateOrder.mutate({ orderId, updates });
          }}
        />
      ),
    },
    {
      accessorKey: 'paymentStatus',
      header: 'Payment',
      cell: ({ row }) => getPaymentStatusBadge(row.getValue('paymentStatus')),
    },
    {
      accessorKey: 'createdAt',
      header: ({ column }) => <SortableHeader column={column}>Date</SortableHeader>,
      cell: ({ row }) => (
        <span className="text-sm">{format(row.getValue('createdAt'), 'MMM d, h:mm a')}</span>
      ),
    },
    {
      id: 'actions',
      header: 'Actions',
      cell: ({ row }) => {
        const order = row.original;

        return (
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0"
              onClick={() => { setSelectedOrder(order); setIsViewModalOpen(true); }}
              title="View"
            >
              <Eye className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0"
              onClick={() => { setSelectedOrder(order); setIsEditModalOpen(true); }}
              title="Edit"
            >
              <Pencil className="h-4 w-4" />
            </Button>
            {order.status === 'pending' && (
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0 text-green-600 hover:text-green-700"
                onClick={() => { setSelectedOrder(order); setIsConfirmDialogOpen(true); }}
                title="Confirm Order"
              >
                <Check className="h-4 w-4" />
              </Button>
            )}
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0 text-destructive hover:text-destructive"
              onClick={() => { setSelectedOrder(order); setIsDeleteDialogOpen(true); }}
              title="Delete"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        );
      },
    },
  ], []);

  // Handle actions
  const handleConfirmOrder = () => {
    const ordersToUpdate = selectedRows.length > 0 ? selectedRows : (selectedOrder ? [selectedOrder] : []);
    ordersToUpdate.forEach((order) => {
      updateOrder.mutate({ orderId: order.id, updates: { status: 'processing' as OrderStatus } });
    });
    setIsConfirmDialogOpen(false);
    setSelectedRows([]);
  };

  const handleDeleteOrders = () => {
    const ordersToDelete = selectedRows.length > 0 ? selectedRows : (selectedOrder ? [selectedOrder] : []);
    if (ordersToDelete.length > 0) {
      deleteOrders.mutate(ordersToDelete.map(o => o.id));
    }
    setIsDeleteDialogOpen(false);
    setSelectedRows([]);
  };

  const handleStatusChange = (newStatus: OrderStatus) => {
    selectedRows.forEach((order) => {
      updateOrder.mutate({ orderId: order.id, updates: { status: newStatus } });
    });
    setIsStatusDialogOpen(false);
    setSelectedRows([]);
  };

  const handleEditSave = (updates: Partial<Order>) => {
    if (selectedOrder) {
      updateOrder.mutate({ orderId: selectedOrder.id, updates });
    }
  };

  // Export data to CSV
  const exportToCSV = (dataToExport: Order[]) => {
    // Sort by date descending
    const sortedData = [...dataToExport].sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

    // Create CSV headers
    const headers = [
      'Order Number',
      'Customer Name',
      'Customer Email',
      'Phone',
      'Status',
      'Payment Status',
      'Items Count',
      'Subtotal',
      'Tax',
      'Shipping',
      'Discount',
      'Total',
      'City',
      'State',
      'Country',
      'Tracking Number',
      'Carrier',
      'Created Date',
    ];

    // Create CSV rows
    const rows = sortedData.map((order) => [
      order.orderNumber,
      order.account.name,
      order.account.email,
      order.shippingAddress.phone,
      order.status,
      order.paymentStatus,
      order.items.length.toString(),
      order.subtotal.toFixed(2),
      order.taxAmount.toFixed(2),
      order.shippingAmount.toFixed(2),
      order.discountAmount.toFixed(2),
      order.total.toFixed(2),
      order.shippingAddress.city,
      order.shippingAddress.state,
      order.shippingAddress.country,
      order.trackingNumber || '',
      order.carrier || '',
      format(order.createdAt, 'yyyy-MM-dd HH:mm'),
    ]);

    // Combine headers and rows
    const csvContent = [
      headers.join(','),
      ...rows.map((row) => row.map((cell) => `"${cell}"`).join(',')),
    ].join('\n');

    // Create blob and download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    const datePrefix = format(new Date(), 'yyyy-MM-dd');
    link.setAttribute('href', url);
    link.setAttribute('download', `${datePrefix}_orders.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Export data to Excel (as CSV with .xlsx extension for simplicity)
  const exportToExcel = (dataToExport: Order[]) => {
    // For simplicity, we'll use CSV format with .xlsx extension
    // In a real app, you'd use a library like xlsx
    exportToCSV(dataToExport);
    toast.info('Excel export uses CSV format. For true Excel format, install the xlsx library.');
  };

  // Export data to PDF (simplified - opens print dialog)
  const exportToPDF = (dataToExport: Order[]) => {
    // Sort by date descending
    const sortedData = [...dataToExport].sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

    // Create a simple HTML table for printing
    const printContent = `
      <html>
        <head>
          <title>Orders Export</title>
          <style>
            body { font-family: Arial, sans-serif; }
            h1 { color: #333; }
            table { border-collapse: collapse; width: 100%; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            th { background-color: #f2f2f2; }
            tr:nth-child(even) { background-color: #f9f9f9; }
          </style>
        </head>
        <body>
          <h1>Orders Report - ${format(new Date(), 'MMMM d, yyyy')}</h1>
          <p>Total Orders: ${sortedData.length}</p>
          <table>
            <thead>
              <tr>
                <th>Order #</th>
                <th>Customer</th>
                <th>Status</th>
                <th>Total</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              ${sortedData.map((order) => `
                <tr>
                  <td>${order.orderNumber}</td>
                  <td>${order.account.name}</td>
                  <td>${order.status}</td>
                  <td>$${order.total.toFixed(2)}</td>
                  <td>${format(order.createdAt, 'MMM d, yyyy')}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </body>
      </html>
    `;

    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(printContent);
      printWindow.document.close();
      printWindow.print();
    }
  };

  const handleExport = (format: ExportFormat, selectedRowsData: Order[]) => {
    // If no rows selected, export all data
    const dataToExport = selectedRowsData.length > 0 ? selectedRowsData : orders;

    if (dataToExport.length === 0) {
      toast.error('No data to export');
      return;
    }

    try {
      switch (format) {
        case 'csv':
          exportToCSV(dataToExport);
          toast.success(`Exported ${dataToExport.length} orders to CSV`);
          break;
        case 'excel':
          exportToExcel(dataToExport);
          toast.success(`Exported ${dataToExport.length} orders to Excel`);
          break;
        case 'pdf':
          exportToPDF(dataToExport);
          toast.success(`Preparing PDF for ${dataToExport.length} orders`);
          break;
      }
    } catch (error) {
      console.error('Export error:', error);
      toast.error('Failed to export data');
    }
  };

  const handleDelete = (selectedRowsData: Order[]) => {
    setSelectedRows(selectedRowsData);
    // Set selectedOrder for single delete, null for bulk delete
    setSelectedOrder(selectedRowsData.length === 1 ? selectedRowsData[0] ?? null : null);
    setIsDeleteDialogOpen(true);
  };

  // Bulk actions renderer (keep only status change and confirm actions)
  const renderBulkActions = (rows: Order[]) => (
    <>
      <Button size="sm" onClick={() => setIsStatusDialogOpen(true)}>
        Change Status
      </Button>
      <Button size="sm" onClick={() => setIsConfirmDialogOpen(true)}>
        <Check className="h-4 w-4 mr-2" />
        Confirm ({rows.length})
      </Button>
    </>
  );

  // Calculate stats
  const stats = useMemo(() => ({
    total: orders.length,
    pending: orders.filter(o => o.status === 'pending').length,
    processing: orders.filter(o => o.status === 'processing').length,
    revenue: orders.reduce((sum, o) => sum + o.total, 0),
  }), [orders]);

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
                <div className="text-2xl font-bold">{stats.total}</div>
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
                <div className="text-2xl font-bold">{stats.pending}</div>
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
                <div className="text-2xl font-bold">{stats.processing}</div>
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
                <div className="text-2xl font-bold">${stats.revenue.toFixed(2)}</div>
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
                <Button variant="outline" onClick={() => refetch()} className="gap-2">
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
                data={orders}
                isLoading={isLoading}
                searchable
                searchPlaceholder="Search by order number, customer, phone..."
                filterable
                filters={filterConfigs}
                selectable
                pagination
                pageSize={10}
                pageSizeOptions={[10, 25, 50]}
                onExport={handleExport}
                onDelete={handleDelete}
                onRefresh={() => refetch()}
                bulkActions={renderBulkActions}
                emptyMessage="No orders found matching your filters"
                showFooter
              />
            )}
          </CardContent>
        </Card>
      </div>

      {/* Modals */}
      <OrderDetailModal order={selectedOrder} open={isViewModalOpen} onClose={() => setIsViewModalOpen(false)} />
      <EditOrderDialog order={selectedOrder} open={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} onSave={handleEditSave} />
      <ConfirmOrderDialog
        open={isConfirmDialogOpen}
        onClose={() => setIsConfirmDialogOpen(false)}
        onConfirm={handleConfirmOrder}
        orders={selectedRows.length > 0 ? selectedRows : (selectedOrder ? [selectedOrder] : [])}
      />
      <DeleteConfirmDialog
        open={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        onConfirm={handleDeleteOrders}
        count={selectedRows.length > 0 ? selectedRows.length : 1}
      />
      <StatusChangeDialog
        open={isStatusDialogOpen}
        onClose={() => setIsStatusDialogOpen(false)}
        onConfirm={handleStatusChange}
        orders={selectedRows}
      />
    </PageBody>
  );
}
