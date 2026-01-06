import {
  Schema,
  model,
  models,
  type Model,
  type Document,
  Types,
} from 'mongoose';

export const ORDER_STATUS = {
  PENDING: 'pending',
  PAID: 'paid',
  PLACED: 'placed',
  PROCESSING: 'processing your order',
  OUT_FOR_DELIVERY: 'out for delivery',
  DELIVERED: 'delivered',
  FAILED: 'failed',
  REFUNDED: 'refunded',
  CANCELLED: 'cancelled',
} as const;

export type OrderStatus = (typeof ORDER_STATUS)[keyof typeof ORDER_STATUS];

export interface OrderItem {
  productId: Types.ObjectId;
  name: string;
  quantity: number;
  price: number; // price per unit
}

export interface OrderDocument extends Document {
  userId: Types.ObjectId;
  items: OrderItem[];
  subtotal: number;
  tax: number;
  total: number; // in rupees
  currency: string;
  status: OrderStatus;
  razorpayOrderId: string;
  razorpayPaymentId?: string;
  razorpaySignature?: string;
  paidAt?: Date;
  notes?: Record<string, string>;
  shippingAddress?: {
    line1: string;
    line2?: string;
    city: string;
    state: string;
    pincode: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

const OrderItemSchema = new Schema<OrderItem>(
  {
    productId: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
    name: { type: String, required: true },
    quantity: { type: Number, required: true, min: 1 },
    price: { type: Number, required: true, min: 0 },
  },
  { _id: false }
);

const OrderSchema = new Schema<OrderDocument>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    items: {
      type: [OrderItemSchema],
      required: true,
      validate: [
        (val: OrderItem[]) => val.length > 0,
        'Order must have at least one item',
      ],
    },
    subtotal: { type: Number, required: true, min: 0 },
    tax: { type: Number, required: true, default: 0, min: 0 },
    total: { type: Number, required: true, min: 0 },
    currency: { type: String, required: true, default: 'INR' },
    status: {
      type: String,
      required: true,
      enum: Object.values(ORDER_STATUS),
      default: ORDER_STATUS.PENDING,
      index: true,
    },
    razorpayOrderId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    razorpayPaymentId: { type: String, sparse: true, index: true },
    razorpaySignature: { type: String },
    paidAt: { type: Date },
    notes: { type: Schema.Types.Mixed },
    shippingAddress: {
      line1: { type: String },
      line2: { type: String },
      city: { type: String },
      state: { type: String },
      pincode: { type: String },
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

// Index for user's orders sorted by date
OrderSchema.index({ userId: 1, createdAt: -1 });

const Order: Model<OrderDocument> =
  models.Order || model<OrderDocument>('Order', OrderSchema);

export default Order;
