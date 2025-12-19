import { connectToDatabase } from "@/lib/mongoose";
import { User, type UserDocument, type UserAddress } from "@/models/User";
import { Types } from "mongoose";

interface CreateUserInput {
  firstName: string;
  lastName: string;
  email: string;
  passwordHash: string;
  phoneNumber: string;
  firmName: string;
  address: UserAddress;
  visitingCardAssetId?: string;
  visitingCardAssetUrl?: string;
  visitingCardOriginalFilename?: string;
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

export const listUsers = async (page = 1, limit = 10) => {
  await connectToDatabase();
  const skip = (page - 1) * limit;

  const [users, totalUsers] = await Promise.all([
    User.find({})
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .select(
        "firstName lastName email phoneNumber firmName address visitingCardAssetId visitingCardAssetUrl visitingCardOriginalFilename is_admin is_approved createdAt updatedAt"
      )
      .lean(),
    User.countDocuments().exec(),
  ]);

  return {
    items: users.map((user) => ({
      id: user._id.toString(),
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      phoneNumber: user.phoneNumber,
      firmName: user.firmName,
      address: {
        line1: user.address?.line1 ?? "",
        line2: user.address?.line2 ?? "",
        city: user.address?.city ?? "",
        state: user.address?.state ?? "",
      },
      visitingCardAssetId: user.visitingCardAssetId ?? null,
      visitingCardAssetUrl: user.visitingCardAssetUrl ?? null,
      visitingCardOriginalFilename: user.visitingCardOriginalFilename ?? null,
      is_admin: user.is_admin,
      is_approved: user.is_approved,
      createdAt: new Date(user.createdAt).toISOString(),
      updatedAt: new Date(user.updatedAt).toISOString(),
    })),
    pagination: {
      page,
      limit,
      total: totalUsers,
      totalPages: Math.ceil(totalUsers / limit),
    },
  } as const;
};
