import { Schema, model, models, type Model, type Document, Types } from "mongoose";

export const SUBSCRIPTION_STATUS = {
  ACTIVE: "active",
  EXPIRED: "expired",
  CANCELLED: "cancelled",
  PENDING: "pending",
} as const;

export type SubscriptionStatus = (typeof SUBSCRIPTION_STATUS)[keyof typeof SUBSCRIPTION_STATUS];

export interface SubscriptionDocument extends Document {
  userId: Types.ObjectId;
  planName: string;
  amount: number;
  currency: string;
  status: SubscriptionStatus;
  razorpayOrderId: string;
  razorpayPaymentId?: string;
  razorpaySignature?: string;
  startDate?: Date;
  endDate?: Date;
  paidAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const SubscriptionSchema = new Schema<SubscriptionDocument>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    planName: { type: String, required: true },
    amount: { type: Number, required: true, min: 0 },
    currency: { type: String, required: true, default: "INR" },
    status: {
      type: String,
      required: true,
      enum: Object.values(SUBSCRIPTION_STATUS),
      default: SUBSCRIPTION_STATUS.PENDING,
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
    startDate: { type: Date },
    endDate: { type: Date },
    paidAt: { type: Date },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

SubscriptionSchema.index({ userId: 1, status: 1 });

const Subscription: Model<SubscriptionDocument> =
  models.Subscription || model<SubscriptionDocument>("Subscription", SubscriptionSchema);

export default Subscription;
