import { Schema, model, models, type Model, type Document } from "mongoose";

export interface UserAddress {
  line1: string;
  line2?: string;
  city: string;
  state: string;
}

export interface UserDocument extends Document {
  firstName: string;
  lastName: string;
  email: string;
  passwordHash: string;
  is_admin: boolean;
  is_approved: boolean;
  phoneNumber: string;
  firmName: string;
  address: UserAddress;
  visitingCardAssetId?: string;
  visitingCardAssetUrl?: string;
  visitingCardOriginalFilename?: string;
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
    phoneNumber: {
      type: String,
      required: true,
      trim: true,
      minlength: 7,
      maxlength: 20,
    },
    firmName: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
    },
    address: {
      line1: {
        type: String,
        required: true,
        trim: true,
        minlength: 3,
      },
      line2: {
        type: String,
        required: false,
        trim: true,
      },
      city: {
        type: String,
        required: true,
        trim: true,
        minlength: 2,
      },
      state: {
        type: String,
        required: true,
        trim: true,
        minlength: 2,
      },
    },
    visitingCardAssetId: {
      type: String,
      required: false,
      trim: true,
    },
    visitingCardAssetUrl: {
      type: String,
      required: false,
      trim: true,
    },
    visitingCardOriginalFilename: {
      type: String,
      required: false,
      trim: true,
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
