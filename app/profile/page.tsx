'use client';

import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '@/store';
import Button from '@/components/ui/button/Button';
import {
  User,
  Mail,
  Phone,
  MapPin,
  Building,
  Calendar,
  Package,
  IndianRupee,
  Eye,
  Loader2,
  Clock,
  CheckCircle,
  Truck,
  XCircle,
} from 'lucide-react';
import TopBar from '@/components/TopBar';
import Navbar from '@/components/Navbar';

interface OrderItem {
  productId: string;
  name: string;
  quantity: number;
  price: number;
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

const getStatusIcon = (status: string) => {
  switch (status) {
    case 'pending':
      return <Clock className="h-4 w-4" />;
    case 'paid':
    case 'placed':
      return <CheckCircle className="h-4 w-4" />;
    case 'processing your order':
      return <Package className="h-4 w-4" />;
    case 'out for delivery':
      return <Truck className="h-4 w-4" />;
    case 'delivered':
      return <CheckCircle className="h-4 w-4" />;
    case 'cancelled':
    case 'failed':
      return <XCircle className="h-4 w-4" />;
    default:
      return <Clock className="h-4 w-4" />;
  }
};

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
    case 'failed':
      return 'bg-red-100 text-red-800';
    case 'pending':
      return 'bg-gray-100 text-gray-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

export default function ProfilePage() {
  const user = useSelector((state: RootState) => state.auth.user);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [ordersLoading, setOrdersLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalOrders, setTotalOrders] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  const fetchOrders = async (page: number = 1) => {
    try {
      setOrdersLoading(true);
      const url = new URL('/api/orders/me', window.location.origin);
      url.searchParams.set('page', page.toString());
      url.searchParams.set('limit', '10');

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
      setOrdersLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      setLoading(false);
      fetchOrders();
    }
  }, [user]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    fetchOrders(page);
    window.scrollTo(0, 0);
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <User className="h-12 w-12 mx-auto mb-4 text-gray-400" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Please log in
          </h2>
          <p className="text-gray-600">
            You need to be logged in to view your profile.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <TopBar />
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">My Profile</h1>
          <p className="text-gray-600">
            Manage your account and view order history
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Profile Information */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Profile Information
              </h2>

              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100">
                    <User className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">Name</p>
                    <p className="text-sm text-gray-600">
                      {user.firstName && user.lastName
                        ? `${user.firstName} ${user.lastName}`
                        : user.firstName || user.lastName || 'Not provided'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
                    <Mail className="h-6 w-6 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">Email</p>
                    <p className="text-sm text-gray-600">{user.email}</p>
                  </div>
                </div>

                {user.phoneNumber && (
                  <div className="flex items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-purple-100">
                      <Phone className="h-6 w-6 text-purple-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">Phone</p>
                      <p className="text-sm text-gray-600">
                        {user.phoneNumber}
                      </p>
                    </div>
                  </div>
                )}

                {user.firmName && (
                  <div className="flex items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-orange-100">
                      <Building className="h-6 w-6 text-orange-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        Firm Name
                      </p>
                      <p className="text-sm text-gray-600">{user.firmName}</p>
                    </div>
                  </div>
                )}

                {user.address && (
                  <div className="flex items-start gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
                      <MapPin className="h-6 w-6 text-red-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        Address
                      </p>
                      <div className="text-sm text-gray-600">
                        {user.address.line1 && <p>{user.address.line1}</p>}
                        {user.address.line2 && <p>{user.address.line2}</p>}
                        {(user.address.city || user.address.state) && (
                          <p>
                            {user.address.city}
                            {user.address.city && user.address.state && ', '}
                            {user.address.state}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* Account Status */}
                {/* <div className="pt-4 border-t border-gray-200">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-900">
                      Account Status
                    </span>
                    <span
                      className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        user.is_approved
                          ? 'bg-green-100 text-green-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}
                    >
                      {user.is_approved ? 'Approved' : 'Pending Approval'}
                    </span>
                  </div>

                  {user.is_subscribed && (
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-sm font-medium text-gray-900">
                        Subscription
                      </span>
                      <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-purple-100 text-purple-800">
                        Premium
                      </span>
                    </div>
                  )}
                </div> */}
              </div>
            </div>
          </div>

          {/* Orders History */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900">
                      Order History
                    </h2>
                    <p className="text-gray-600">
                      {totalOrders} total order{totalOrders !== 1 ? 's' : ''}
                    </p>
                  </div>
                  <Package className="h-6 w-6 text-gray-400" />
                </div>
              </div>

              <div className="p-6">
                {ordersLoading ? (
                  <div className="flex justify-center items-center py-12">
                    <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                    <span className="ml-2 text-gray-600">
                      Loading orders...
                    </span>
                  </div>
                ) : error ? (
                  <div className="text-center py-12">
                    <div className="text-red-600 mb-4">
                      <Package className="h-12 w-12 mx-auto mb-2" />
                      <p className="text-lg font-medium">
                        Failed to load orders
                      </p>
                      <p className="text-sm">{error}</p>
                    </div>
                    <Button
                      variant="primary"
                      onClick={() => fetchOrders(currentPage)}
                    >
                      Try Again
                    </Button>
                  </div>
                ) : orders.length === 0 ? (
                  <div className="text-center py-12">
                    <Package className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      No orders yet
                    </h3>
                    <p className="text-gray-600 mb-4">
                      You haven't placed any orders yet.
                    </p>
                    <Button
                      variant="primary"
                      onClick={() => (window.location.href = '/products')}
                    >
                      Browse Products
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {orders.map((order) => (
                      <div
                        key={order.id}
                        className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors"
                      >
                        <div className="flex items-center justify-between mb-3">
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-semibold text-gray-900">
                                Order #{order.id.slice(-8)}
                              </span>
                              <span
                                className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(
                                  order.status
                                )}`}
                              >
                                {getStatusIcon(order.status)}
                                {order.status}
                              </span>
                            </div>
                            <p className="text-sm text-gray-500">
                              {formatDate(order.createdAt)}
                            </p>
                          </div>
                          <div className="text-right">
                            <div className="text-lg font-semibold text-gray-900">
                              {formatPrice(order.total)}
                            </div>
                            <p className="text-sm text-gray-500">
                              {order.items.length} item
                              {order.items.length !== 1 ? 's' : ''}
                            </p>
                          </div>
                        </div>

                        <div className="mb-3">
                          <div className="text-sm text-gray-600">
                            {order.items.slice(0, 2).map((item, index) => (
                              <div key={index}>
                                {item.name} × {item.quantity}
                              </div>
                            ))}
                            {order.items.length > 2 && (
                              <div className="text-gray-500">
                                +{order.items.length - 2} more item
                                {order.items.length - 2 !== 1 ? 's' : ''}
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="flex justify-between items-center">
                          <div className="text-sm text-gray-500">
                            {order.paidAt && (
                              <span>Paid on {formatDate(order.paidAt)}</span>
                            )}
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            startIcon={<Eye size={16} />}
                            onClick={() => setSelectedOrder(order)}
                          >
                            View Details
                          </Button>
                        </div>
                      </div>
                    ))}

                    {/* Pagination */}
                    {totalPages > 1 && (
                      <div className="flex justify-center items-center gap-2 pt-4">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handlePageChange(currentPage - 1)}
                          disabled={currentPage === 1}
                        >
                          Previous
                        </Button>

                        {Array.from(
                          { length: Math.min(5, totalPages) },
                          (_, i) => {
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
                                variant={
                                  currentPage === pageNum
                                    ? 'primary'
                                    : 'outline'
                                }
                                size="sm"
                                onClick={() => handlePageChange(pageNum)}
                              >
                                {pageNum}
                              </Button>
                            );
                          }
                        )}

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
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Order Details Modal */}
        {selectedOrder && (
          <div className="fixed inset-0 bg-black-50 bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
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
                {selectedOrder.razorpayPaymentId && (
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-3">
                      Payment Information
                    </h3>
                    <div className="space-y-2 text-sm">
                      <div>
                        <span className="font-medium">Payment ID:</span>{' '}
                        {selectedOrder.razorpayPaymentId}
                      </div>
                      {selectedOrder.paidAt && (
                        <div>
                          <span className="font-medium">Paid At:</span>{' '}
                          {formatDate(selectedOrder.paidAt)}
                        </div>
                      )}
                    </div>
                  </div>
                )}

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
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
