import { Schema, model, models, type Model, type Document } from "mongoose";

export interface UserDocument extends Document {
  firstName: string;
  lastName: string;
  email: string;
  passwordHash: string;
  is_admin: boolean;
  is_approved: boolean;
  otpCodeHash?: string;
  otpExpiresAt?: Date;
  otpAttemptCount?: number;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<UserDocument>(
  {
    firstName: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
    },
    lastName: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    passwordHash: {
      type: String,
      required: true,
    },
    is_admin: {
      type: Boolean,
      required: true,
      default: false,
    },
    is_approved: {
      type: Boolean,
      required: true,
      default: false,
    },
    otpCodeHash: {
      type: String,
      required: false,
    },
    otpExpiresAt: {
      type: Date,
      required: false,
    },
    otpAttemptCount: {
      type: Number,
      required: false,
      default: 0,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

export const User: Model<UserDocument> =
  models.User || model<UserDocument>("User", UserSchema);
