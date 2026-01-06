'use client';

import { useState, useEffect } from 'react';
import Button from '@/components/ui/button/Button';
import {
  Package,
  Loader2,
  Eye,
  Edit3,
  Search,
  Filter,
  ChevronDown,
  Calendar,
  User,
  IndianRupee,
  Clock,
  CheckCircle,
  Truck,
  XCircle,
} from 'lucide-react';

interface OrderItem {
  productId: string;
  name: string;
  quantity: number;
  price: number;
}

interface Customer {
  name: string;
  email: string;
  phone?: string;
}

interface ShippingAddress {
  line1: string;
  line2?: string;
  city: string;
  state: string;
  pincode: string;
}

interface Order {
  id: string;
  userId: string;
  customer: Customer;
  items: OrderItem[];
  subtotal: number;
  tax: number;
  total: number;
  currency: string;
  status: string;
  razorpayOrderId: string;
  razorpayPaymentId?: string;
  paidAt?: string;
  shippingAddress?: ShippingAddress;
  notes?: Record<string, string>;
  createdAt: string;
  updatedAt: string;
}

interface OrdersResponse {
  orders: Order[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

const ORDER_STATUS_OPTIONS = [
  { value: '', label: 'All Orders', icon: Package },
  { value: 'paid', label: 'Paid', icon: CheckCircle },
  { value: 'placed', label: 'Placed', icon: Clock },
  { value: 'processing your order', label: 'Processing', icon: Clock },
  { value: 'out for delivery', label: 'Out for Delivery', icon: Truck },
  { value: 'delivered', label: 'Delivered', icon: CheckCircle },
  { value: 'cancelled', label: 'Cancelled', icon: XCircle },
];

const getStatusColor = (status: string) => {
  switch (status) {
    case 'paid':
    case 'placed':
      return 'bg-blue-100 text-blue-800';
    case 'processing your order':
      return 'bg-yellow-100 text-yellow-800';
    case 'out for delivery':
      return 'bg-purple-100 text-purple-800';
    case 'delivered':
      return 'bg-green-100 text-green-800';
    case 'cancelled':
      return 'bg-red-100 text-red-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

export default function OrdersManager() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [updateLoading, setUpdateLoading] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalOrders, setTotalOrders] = useState(0);
  const [selectedStatus, setSelectedStatus] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  const fetchOrders = async (page: number = 1, status: string = '') => {
    try {
      setLoading(true);
      const url = new URL('/api/admin/orders', window.location.origin);
      url.searchParams.set('page', page.toString());
      url.searchParams.set('limit', '20');
      if (status) {
        url.searchParams.set('status', status);
      }

      const response = await fetch(url.toString());
      if (!response.ok) {
        throw new Error('Failed to fetch orders');
      }

      const data: OrdersResponse = await response.json();
      setOrders(data.orders);
      setCurrentPage(data.pagination.page);
      setTotalPages(data.pagination.totalPages);
      setTotalOrders(data.pagination.total);
      setError(null);
    } catch (err) {
      console.error('Error fetching orders:', err);
      setError('Failed to load orders. Please try again later.');
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders(currentPage, selectedStatus);
  }, [currentPage, selectedStatus]);

  const handleStatusFilter = (status: string) => {
    setSelectedStatus(status);
    setCurrentPage(1);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo(0, 0);
  };

  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    try {
      setUpdateLoading(orderId);
      const response = await fetch(`/api/admin/orders/${orderId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update order status');
      }

      // Update the local state
      setOrders((prevOrders) =>
        prevOrders.map((order) =>
          order.id === orderId
            ? {
                ...order,
                status: newStatus,
                updatedAt: new Date().toISOString(),
              }
            : order
        )
      );

      // Update selected order if it's the one being updated
      if (selectedOrder && selectedOrder.id === orderId) {
        setSelectedOrder((prev) =>
          prev
            ? {
                ...prev,
                status: newStatus,
                updatedAt: new Date().toISOString(),
              }
            : null
        );
      }

      alert('Order status updated successfully!');
    } catch (error) {
      console.error('Error updating order status:', error);
      alert('Failed to update order status. Please try again.');
    } finally {
      setUpdateLoading(null);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
    }).format(price);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Orders Management
          </h1>
          <p className="text-gray-600">
            Manage customer orders and track deliveries
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Package className="h-6 w-6 text-gray-500" />
          <span className="text-sm text-gray-500">
            {totalOrders} total order{totalOrders !== 1 ? 's' : ''}
          </span>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-4 flex-wrap">
        {ORDER_STATUS_OPTIONS.map((option) => {
          const IconComponent = option.icon;
          return (
            <button
              key={option.value}
              onClick={() => handleStatusFilter(option.value)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg border text-sm font-medium transition-colors ${
                selectedStatus === option.value
                  ? 'bg-blue-50 border-blue-200 text-blue-700'
                  : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'
              }`}
            >
              <IconComponent size={16} />
              {option.label}
            </button>
          );
        })}
      </div>

      {/* Loading State */}
      {loading && (
        <div className="flex justify-center items-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          <span className="ml-2 text-gray-600">Loading orders...</span>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="text-center py-12">
          <div className="text-red-600 mb-4">
            <Package className="h-12 w-12 mx-auto mb-2" />
            <p className="text-lg font-medium">Oops! Something went wrong</p>
            <p className="text-sm">{error}</p>
          </div>
          <Button
            variant="primary"
            onClick={() => fetchOrders(currentPage, selectedStatus)}
          >
            Try Again
          </Button>
        </div>
      )}

      {/* Orders Table */}
      {!loading && !error && (
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Order Details
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Customer
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Items
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Total
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {orders.map((order) => (
                  <tr key={order.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          #{order.id.slice(-8)}
                        </div>
                        <div className="text-sm text-gray-500">
                          {order.razorpayOrderId}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {order.customer.name || 'Unknown'}
                        </div>
                        <div className="text-sm text-gray-500">
                          {order.customer.email}
                        </div>
                        {order.customer.phone && (
                          <div className="text-sm text-gray-500">
                            {order.customer.phone}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">
                        {order.items.map((item, index) => (
                          <div key={index} className="mb-1">
                            {item.name} × {item.quantity}
                          </div>
                        ))}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {formatPrice(order.total)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(
                          order.status
                        )}`}
                      >
                        {order.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(order.createdAt)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="primarySoft"
                          size="sm"
                          startIcon={<Eye size={16} />}
                          onClick={() => setSelectedOrder(order)}
                        >
                          View
                        </Button>
                        {(order.status === 'paid' ||
                          order.status === 'placed' ||
                          order.status === 'processing your order' ||
                          order.status === 'out for delivery') && (
                          <select
                            value=""
                            onChange={(e) => {
                              if (e.target.value) {
                                updateOrderStatus(order.id, e.target.value);
                              }
                            }}
                            disabled={updateLoading === order.id}
                            className="ml-2 text-sm border border-gray-300 rounded px-2 py-1"
                          >
                            <option value="">Update Status</option>
                            <option value="placed">Placed</option>
                            <option value="processing your order">
                              Processing
                            </option>
                            <option value="out for delivery">
                              Out for Delivery
                            </option>
                            <option value="delivered">Delivered</option>
                            <option value="cancelled">Cancelled</option>
                          </select>
                        )}
                        {updateLoading === order.id && (
                          <Loader2 className="h-4 w-4 animate-spin text-blue-600" />
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {orders.length === 0 && (
            <div className="text-center py-12">
              <Package className="h-12 w-12 mx-auto mb-4 text-gray-400" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No orders found
              </h3>
              <p className="text-gray-600">
                {selectedStatus
                  ? `No orders with status "${selectedStatus}" found.`
                  : 'No orders have been placed yet.'}
              </p>
            </div>
          )}
        </div>
      )}

      {/* Pagination */}
      {!loading && !error && totalPages > 1 && (
        <div className="flex justify-center items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
          >
            Previous
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
                variant={currentPage === pageNum ? 'primary' : 'outline'}
                size="sm"
                onClick={() => handlePageChange(pageNum)}
              >
                {pageNum}
              </Button>
            );
          })}

          <Button
            variant="outline"
            size="sm"
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
          >
            Next
          </Button>
        </div>
      )}

      {/* Order Details Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-black-50 bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-gray-900">
                  Order Details - #{selectedOrder.id.slice(-8)}
                </h2>
                <button
                  onClick={() => setSelectedOrder(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <XCircle size={24} />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              {/* Order Status */}
              <div className="flex items-center gap-4">
                <span
                  className={`px-3 py-1 text-sm font-semibold rounded-full ${getStatusColor(
                    selectedOrder.status
                  )}`}
                >
                  {selectedOrder.status}
                </span>
                <span className="text-sm text-gray-500">
                  Last updated: {formatDate(selectedOrder.updatedAt)}
                </span>
              </div>

              {/* Customer Information */}
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-3">
                    Customer Information
                  </h3>
                  <div className="space-y-2 text-sm">
                    <div>
                      <span className="font-medium">Name:</span>{' '}
                      {selectedOrder.customer.name || 'Unknown'}
                    </div>
                    <div>
                      <span className="font-medium">Email:</span>{' '}
                      {selectedOrder.customer.email}
                    </div>
                    {selectedOrder.customer.phone && (
                      <div>
                        <span className="font-medium">Phone:</span>{' '}
                        {selectedOrder.customer.phone}
                      </div>
                    )}
                  </div>
                </div>

                {/* Shipping Address */}
                {selectedOrder.shippingAddress && (
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-3">
                      Shipping Address
                    </h3>
                    <div className="text-sm text-gray-600">
                      <div>{selectedOrder.shippingAddress.line1}</div>
                      {selectedOrder.shippingAddress.line2 && (
                        <div>{selectedOrder.shippingAddress.line2}</div>
                      )}
                      <div>
                        {selectedOrder.shippingAddress.city},{' '}
                        {selectedOrder.shippingAddress.state}
                      </div>
                      <div>{selectedOrder.shippingAddress.pincode}</div>
                    </div>
                  </div>
                )}
              </div>

              {/* Order Items */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-3">
                  Order Items
                </h3>
                <div className="border border-gray-200 rounded-lg overflow-hidden">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-2 text-left text-sm font-medium text-gray-500">
                          Product
                        </th>
                        <th className="px-4 py-2 text-center text-sm font-medium text-gray-500">
                          Quantity
                        </th>
                        <th className="px-4 py-2 text-right text-sm font-medium text-gray-500">
                          Unit Price
                        </th>
                        <th className="px-4 py-2 text-right text-sm font-medium text-gray-500">
                          Total
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedOrder.items.map((item, index) => (
                        <tr key={index} className="border-t border-gray-200">
                          <td className="px-4 py-3 text-sm text-gray-900">
                            {item.name}
                          </td>
                          <td className="px-4 py-3 text-sm text-center text-gray-900">
                            {item.quantity}
                          </td>
                          <td className="px-4 py-3 text-sm text-right text-gray-900">
                            {formatPrice(item.price)}
                          </td>
                          <td className="px-4 py-3 text-sm text-right text-gray-900">
                            {formatPrice(item.price * item.quantity)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot className="bg-gray-50">
                      <tr>
                        <td
                          colSpan={3}
                          className="px-4 py-3 text-sm font-medium text-gray-900 text-right"
                        >
                          Subtotal:
                        </td>
                        <td className="px-4 py-3 text-sm text-right text-gray-900">
                          {formatPrice(selectedOrder.subtotal)}
                        </td>
                      </tr>
                      {selectedOrder.tax > 0 && (
                        <tr>
                          <td
                            colSpan={3}
                            className="px-4 py-3 text-sm font-medium text-gray-900 text-right"
                          >
                            Tax:
                          </td>
                          <td className="px-4 py-3 text-sm text-right text-gray-900">
                            {formatPrice(selectedOrder.tax)}
                          </td>
                        </tr>
                      )}
                      <tr>
                        <td
                          colSpan={3}
                          className="px-4 py-3 text-sm font-bold text-gray-900 text-right"
                        >
                          Total:
                        </td>
                        <td className="px-4 py-3 text-sm font-bold text-right text-gray-900">
                          {formatPrice(selectedOrder.total)}
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>

              {/* Payment Information */}
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-3">
                    Payment Information
                  </h3>
                  <div className="space-y-2 text-sm">
                    <div>
                      <span className="font-medium">Razorpay Order ID:</span>{' '}
                      {selectedOrder.razorpayOrderId}
                    </div>
                    {selectedOrder.razorpayPaymentId && (
                      <div>
                        <span className="font-medium">Payment ID:</span>{' '}
                        {selectedOrder.razorpayPaymentId}
                      </div>
                    )}
                    {selectedOrder.paidAt && (
                      <div>
                        <span className="font-medium">Paid At:</span>{' '}
                        {formatDate(selectedOrder.paidAt)}
                      </div>
                    )}
                  </div>
                </div>

                {/* Order Notes */}
                {selectedOrder.notes &&
                  Object.keys(selectedOrder.notes).length > 0 && (
                    <div>
                      <h3 className="text-lg font-medium text-gray-900 mb-3">
                        Order Notes
                      </h3>
                      <div className="space-y-2 text-sm">
                        {Object.entries(selectedOrder.notes).map(
                          ([key, value]) => (
                            <div key={key}>
                              <span className="font-medium">{key}:</span>{' '}
                              {value}
                            </div>
                          )
                        )}
                      </div>
                    </div>
                  )}
              </div>

              {/* Quick Status Update */}
              {(selectedOrder.status === 'paid' ||
                selectedOrder.status === 'placed' ||
                selectedOrder.status === 'processing your order' ||
                selectedOrder.status === 'out for delivery') && (
                <div className="border-t border-gray-200 pt-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-3">
                    Update Order Status
                  </h3>
                  <div className="flex gap-2 flex-wrap">
                    {[
                      'placed',
                      'processing your order',
                      'out for delivery',
                      'delivered',
                      'cancelled',
                    ]
                      .filter((status) => status !== selectedOrder.status)
                      .map((status) => (
                        <Button
                          key={status}
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            updateOrderStatus(selectedOrder.id, status)
                          }
                          disabled={updateLoading === selectedOrder.id}
                          startIcon={
                            updateLoading === selectedOrder.id ? (
                              <Loader2 className="animate-spin" size={16} />
                            ) : undefined
                          }
                        >
                          Mark as {status}
                        </Button>
                      ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
