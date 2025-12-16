import { connectToDatabase } from "@/lib/mongoose";
import { User, type UserDocument } from "@/models/User";
import { Types } from "mongoose";

interface CreateUserInput {
  firstName: string;
  lastName: string;
  email: string;
  passwordHash: string;
  is_admin?: boolean;
  is_approved?: boolean;
}

export const findUserByEmail = async (email: string) => {
  await connectToDatabase();
  return User.findOne({ email: email.toLowerCase() }).exec();
};

export const createUser = async (
  input: CreateUserInput
): Promise<UserDocument> => {
  await connectToDatabase();
  const user = await User.create({
    ...input,
    email: input.email.toLowerCase(),
    is_admin: input.is_admin ?? false,
    is_approved: input.is_approved ?? false,
  });
  return user;
};

export const findUserById = async (userId: Types.ObjectId | string) => {
  await connectToDatabase();
  return User.findById(userId).exec();
};

export const setUserOtp = async (
  userId: Types.ObjectId | string,
  otpCodeHash: string,
  otpExpiresAt: Date
) => {
  await connectToDatabase();
  return User.findByIdAndUpdate(
    userId,
    {
      otpCodeHash,
      otpExpiresAt,
      otpAttemptCount: 0,
    },
    { new: true }
  ).exec();
};

export const clearUserOtp = async (userId: Types.ObjectId | string) => {
  await connectToDatabase();
  return User.findByIdAndUpdate(
    userId,
    {
      $unset: { otpCodeHash: "", otpExpiresAt: "" },
      otpAttemptCount: 0,
    },
    { new: true }
  ).exec();
};

export const incrementOtpAttempts = async (userId: Types.ObjectId | string) => {
  await connectToDatabase();
  return User.findByIdAndUpdate(
    userId,
    {
      $inc: { otpAttemptCount: 1 },
    },
    { new: true }
  ).exec();
};
