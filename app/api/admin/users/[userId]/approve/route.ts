import { NextRequest, NextResponse } from "next/server";
import { authenticateRequest } from "@/lib/auth";
import { connectToDatabase } from "@/lib/mongoose";
import { User } from "@/models/User";
import { Types } from "mongoose";

type RouteParams = {
  userId: string;
};

export const POST = async (
  request: NextRequest,
  context: { params: Promise<RouteParams> }
) => {
  const adminUser = await authenticateRequest(request);

  if (!adminUser) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!adminUser.is_admin) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  const { userId } = await context.params;

  if (!Types.ObjectId.isValid(userId)) {
    return NextResponse.json({ error: "Invalid user id." }, { status: 400 });
  }

  await connectToDatabase();

  const updatedUser = await User.findByIdAndUpdate(
    userId,
    { is_approved: true },
    { new: true }
  )
    .select(
      "firstName lastName email is_admin is_approved createdAt updatedAt"
    )
    .lean();

  if (!updatedUser) {
    return NextResponse.json({ error: "User not found." }, { status: 404 });
  }

  return NextResponse.json({
    user: {
      id: updatedUser._id.toString(),
      firstName: updatedUser.firstName,
      lastName: updatedUser.lastName,
      email: updatedUser.email,
      is_admin: updatedUser.is_admin,
      is_approved: updatedUser.is_approved,
      createdAt: new Date(updatedUser.createdAt).toISOString(),
      updatedAt: new Date(updatedUser.updatedAt).toISOString(),
    },
  });
};
