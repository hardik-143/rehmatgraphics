import { Schema, model, models, type Model, type Document, Types } from "mongoose";

/**
 * Activity type constants - Add new activity types here
 */
export const ACTIVITY_TYPES = {
  LOGIN: "LOGIN",
  REGISTER: "REGISTER",
  LOGOUT: "LOGOUT",
  PASSWORD_RESET: "PASSWORD_RESET",
  PROFILE_UPDATE: "PROFILE_UPDATE",
  ADMIN_APPROVE_USER: "ADMIN_APPROVE_USER",
} as const;

export type ActivityType = (typeof ACTIVITY_TYPES)[keyof typeof ACTIVITY_TYPES];

/**
 * Activity labels for display purposes
 */
export const ACTIVITY_LABELS: Record<ActivityType, string> = {
  [ACTIVITY_TYPES.LOGIN]: "User Login",
  [ACTIVITY_TYPES.REGISTER]: "User Registration",
  [ACTIVITY_TYPES.LOGOUT]: "User Logout",
  [ACTIVITY_TYPES.PASSWORD_RESET]: "Password Reset",
  [ACTIVITY_TYPES.PROFILE_UPDATE]: "Profile Update",
  [ACTIVITY_TYPES.ADMIN_APPROVE_USER]: "Admin Approved User",
};

export interface ActivityLogDocument extends Document {
  userId?: Types.ObjectId;
  action: ActivityType;
  details?: string;
  metadata?: Record<string, unknown>;
  ipAddress?: string;
  userAgent?: string;
  createdAt: Date;
}

const ActivityLogSchema = new Schema<ActivityLogDocument>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      index: true,
    },
    action: {
      type: String,
      required: true,
      enum: Object.values(ACTIVITY_TYPES),
      index: true,
    },
    details: {
      type: String,
      trim: true,
    },
    metadata: {
      type: Schema.Types.Mixed,
    },
    ipAddress: {
      type: String,
      trim: true,
    },
    userAgent: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  }
);

// Compound index for efficient queries
ActivityLogSchema.index({ action: 1, createdAt: -1 });
ActivityLogSchema.index({ userId: 1, createdAt: -1 });

const ActivityLog: Model<ActivityLogDocument> =
  models.ActivityLog || model<ActivityLogDocument>("ActivityLog", ActivityLogSchema);

export default ActivityLog;
