'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '@/store';
import Button from '@/components/ui/button/Button';
import { ShoppingCart, Package, IndianRupee, Loader2 } from 'lucide-react';
import useRazorpay from '@/hooks/useRazorpay';

interface Product {
  id: string;
  name: string;
  quantity: number;
  price: number;
  createdAt: string;
  updatedAt: string;
}

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const router = useRouter();
  const user = useSelector((state: RootState) => state.auth.user);
  const [orderQuantity, setOrderQuantity] = useState(1);
  const [showQuantitySelector, setShowQuantitySelector] = useState(false);

  const { initiatePayment, loading } = useRazorpay({
    onSuccess: (result) => {
      alert(`Order successful! Order ID: ${result.orderId}`);
      setShowQuantitySelector(false);
      setOrderQuantity(1);
    },
    onError: (error) => {
      alert(`Payment failed: ${error}`);
    },
    prefill: {
      name: user ? `${user.firstName || ''} ${user.lastName || ''}`.trim() : '',
      email: user?.email || '',
      contact: user?.phoneNumber || '',
    },
  });

  const handleOrderClick = () => {
    if (!user) {
      // Store the current path to redirect back after login
      sessionStorage.setItem('redirectAfterLogin', '/products');
      router.push('/login?message=Please login to order products');
      return;
    }

    if (product.quantity === 0) return;

    setShowQuantitySelector(true);
  };

  const handleConfirmOrder = async () => {
    if (!user) return;

    try {
      await initiatePayment({
        items: [
          {
            productId: product.id,
            quantity: orderQuantity,
          },
        ],
        shippingAddress: user.address
          ? {
              line1: user.address.line1 || '',
              line2: user.address.line2 || '',
              city: user.address.city || '',
              state: user.address.state || '',
              pincode: '400001', // Default pincode if not available
            }
          : undefined,
        notes: {
          productName: product.name,
          customerEmail: user.email,
        },
      });
    } catch (error) {
      console.error('Order initiation failed:', error);
      alert('Failed to initiate payment. Please try again.');
    }
  };

  const handleCancelOrder = () => {
    setShowQuantitySelector(false);
    setOrderQuantity(1);
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
    }).format(price);
  };

  const totalPrice = product.price * orderQuantity;

  if (showQuantitySelector) {
    return (
      <div className="bg-white rounded-lg border border-blue-200 shadow-md transition-shadow duration-200 overflow-hidden">
        <div className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Order: {product.name}
          </h3>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Quantity:
              </label>
              <div className="flex items-center gap-3">
                <button
                  onClick={() =>
                    setOrderQuantity(Math.max(1, orderQuantity - 1))
                  }
                  disabled={orderQuantity <= 1}
                  className="w-8 h-8 rounded border border-gray-300 flex items-center justify-center disabled:opacity-50 hover:bg-gray-50"
                >
                  -
                </button>
                <span className="font-medium text-lg min-w-[3ch] text-center">
                  {orderQuantity}
                </span>
                <button
                  onClick={() =>
                    setOrderQuantity(
                      Math.min(product.quantity, orderQuantity + 1)
                    )
                  }
                  disabled={orderQuantity >= product.quantity}
                  className="w-8 h-8 rounded border border-gray-300 flex items-center justify-center disabled:opacity-50 hover:bg-gray-50"
                >
                  +
                </button>
              </div>
              <p className="text-sm text-gray-500 mt-1">
                Available: {product.quantity}
              </p>
            </div>

            <div className="bg-gray-50 p-3 rounded">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Unit Price:</span>
                <span className="font-medium">
                  {formatPrice(product.price)}
                </span>
              </div>
              <div className="flex justify-between items-center mt-1">
                <span className="text-sm text-gray-600">Quantity:</span>
                <span className="font-medium">{orderQuantity}</span>
              </div>
              <hr className="my-2" />
              <div className="flex justify-between items-center">
                <span className="font-semibold text-gray-900">Total:</span>
                <span className="font-bold text-lg text-blue-600">
                  {formatPrice(totalPrice)}
                </span>
              </div>
            </div>

            <div className="flex gap-3">
              <Button
                variant="outline"
                size="sm"
                onClick={handleCancelOrder}
                disabled={loading}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={handleConfirmOrder}
                disabled={loading}
                className="flex-1"
                startIcon={
                  loading ? (
                    <Loader2 className="animate-spin" size={16} />
                  ) : (
                    <ShoppingCart size={16} />
                  )
                }
              >
                {loading ? 'Processing...' : 'Pay Now'}
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-200 overflow-hidden">
      <div className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {product.name}
            </h3>
            <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
              <div className="flex items-center gap-1">
                <Package size={16} />
                <span>Stock: {product.quantity}</span>
              </div>
              <div className="flex items-center gap-1">
                <IndianRupee size={16} />
                <span className="text-lg font-semibold text-gray-900">
                  {formatPrice(product.price)}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-500">
            {product.quantity > 0 ? (
              <span className="text-green-600 font-medium">In Stock</span>
            ) : (
              <span className="text-red-600 font-medium">Out of Stock</span>
            )}
          </div>

          <Button
            variant="primary"
            size="sm"
            startIcon={<ShoppingCart size={16} />}
            onClick={handleOrderClick}
            disabled={product.quantity === 0}
            className="min-w-[100px]"
          >
            {user ? 'Order Now' : 'Login to Order'}
          </Button>
        </div>
      </div>
    </div>
  );
}
