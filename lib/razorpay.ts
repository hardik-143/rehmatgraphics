import Razorpay from "razorpay";
import crypto from "crypto";
import { RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET } from "@/app/env";

// Initialize Razorpay instance
export const razorpay = new Razorpay({
  key_id: RAZORPAY_KEY_ID,
  key_secret: RAZORPAY_KEY_SECRET,
});

export interface CreateOrderOptions {
  amount: number; // Amount in smallest currency unit (paise for INR)
  currency?: string;
  receipt?: string;
  notes?: Record<string, string>;
}

export interface RazorpayOrder {
  id: string;
  entity: string;
  amount: number;
  amount_paid: number;
  amount_due: number;
  currency: string;
  receipt: string;
  status: string;
  attempts: number;
  notes: Record<string, string>;
  created_at: number;
}

/**
 * Create a Razorpay order
 */
export const createRazorpayOrder = async (
  options: CreateOrderOptions
): Promise<RazorpayOrder> => {
  const { amount, currency = "INR", receipt, notes = {} } = options;

  const order = await razorpay.orders.create({
    amount, // amount in paise
    currency,
    receipt: receipt || `receipt_${Date.now()}`,
    notes,
  });

  return order as RazorpayOrder;
};

/**
 * Verify Razorpay payment signature
 */
export const verifyPaymentSignature = (params: {
  orderId: string;
  paymentId: string;
  signature: string;
}): boolean => {
  const { orderId, paymentId, signature } = params;

  const body = `${orderId}|${paymentId}`;
  const expectedSignature = crypto
    .createHmac("sha256", RAZORPAY_KEY_SECRET)
    .update(body)
    .digest("hex");

  return expectedSignature === signature;
};

/**
 * Fetch payment details from Razorpay
 */
export const fetchPayment = async (paymentId: string) => {
  return razorpay.payments.fetch(paymentId);
};

/**
 * Fetch order details from Razorpay
 */
export const fetchOrder = async (orderId: string) => {
  return razorpay.orders.fetch(orderId);
};

/**
 * Initiate a refund
 */
export const createRefund = async (
  paymentId: string,
  amount?: number,
  notes?: Record<string, string>
) => {
  return razorpay.payments.refund(paymentId, {
    amount, // If not provided, full refund
    notes,
  });
};
