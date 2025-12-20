"use client";

import { useCallback, useState } from "react";

declare global {
  interface Window {
    Razorpay: any;
  }
}

interface OrderItem {
  productId: string;
  quantity: number;
}

interface ShippingAddress {
  line1: string;
  line2?: string;
  city: string;
  state: string;
  pincode: string;
}

interface CreateOrderParams {
  items: OrderItem[];
  shippingAddress?: ShippingAddress;
  notes?: Record<string, string>;
}

interface PaymentResult {
  success: boolean;
  orderId?: string;
  paymentId?: string;
  error?: string;
}

interface UseRazorpayOptions {
  onSuccess?: (result: PaymentResult) => void;
  onError?: (error: string) => void;
  prefill?: {
    name?: string;
    email?: string;
    contact?: string;
  };
}

export const useRazorpay = (options: UseRazorpayOptions = {}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadRazorpayScript = (): Promise<boolean> => {
    return new Promise((resolve) => {
      if (window.Razorpay) {
        resolve(true);
        return;
      }

      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const initiatePayment = useCallback(
    async (params: CreateOrderParams): Promise<PaymentResult> => {
      setLoading(true);
      setError(null);

      try {
        // Load Razorpay script
        const scriptLoaded = await loadRazorpayScript();
        if (!scriptLoaded) {
          throw new Error("Failed to load Razorpay SDK");
        }

        // Create order on server
        const orderRes = await fetch("/api/payments/create-order", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(params),
        });

        const orderData = await orderRes.json();
        if (!orderRes.ok) {
          throw new Error(orderData.error || "Failed to create order");
        }

        // Open Razorpay checkout
        return new Promise((resolve) => {
          const razorpayOptions = {
            key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
            amount: orderData.order.amount,
            currency: orderData.order.currency,
            name: "Rehmat Graphics",
            description: "Order Payment",
            order_id: orderData.order.razorpayOrderId,
            prefill: options.prefill || {},
            theme: {
              color: "#0f172a",
            },
            handler: async (response: {
              razorpay_order_id: string;
              razorpay_payment_id: string;
              razorpay_signature: string;
            }) => {
              try {
                // Verify payment on server
                const verifyRes = await fetch("/api/payments/verify", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify(response),
                });

                const verifyData = await verifyRes.json();
                if (!verifyRes.ok) {
                  throw new Error(verifyData.error || "Payment verification failed");
                }

                const result: PaymentResult = {
                  success: true,
                  orderId: verifyData.order.id,
                  paymentId: response.razorpay_payment_id,
                };

                setLoading(false);
                options.onSuccess?.(result);
                resolve(result);
              } catch (err) {
                const errorMsg = err instanceof Error ? err.message : "Verification failed";
                setError(errorMsg);
                setLoading(false);
                options.onError?.(errorMsg);
                resolve({ success: false, error: errorMsg });
              }
            },
            modal: {
              ondismiss: () => {
                setLoading(false);
                const result: PaymentResult = {
                  success: false,
                  error: "Payment cancelled by user",
                };
                resolve(result);
              },
            },
          };

          const razorpay = new window.Razorpay(razorpayOptions);
          razorpay.on("payment.failed", (response: { error: { description: string } }) => {
            const errorMsg = response.error.description || "Payment failed";
            setError(errorMsg);
            setLoading(false);
            options.onError?.(errorMsg);
            resolve({ success: false, error: errorMsg });
          });
          razorpay.open();
        });
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : "Payment failed";
        setError(errorMsg);
        setLoading(false);
        options.onError?.(errorMsg);
        return { success: false, error: errorMsg };
      }
    },
    [options]
  );

  return {
    initiatePayment,
    loading,
    error,
  };
};

export default useRazorpay;
