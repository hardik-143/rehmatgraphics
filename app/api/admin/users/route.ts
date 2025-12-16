import { NextRequest, NextResponse } from "next/server";
import { authenticateRequest } from "@/lib/auth";
import { connectToDatabase } from "@/lib/mongoose";
import { User } from "@/models/User";

export const GET = async (request: NextRequest) => {
  const adminUser = await authenticateRequest(request);

  if (!adminUser) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!adminUser.is_admin) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  await connectToDatabase();

  const [users, totalUsers, approvedUsers] = await Promise.all([
    User.find({})
      .sort({ createdAt: -1 })
      .select(
        "firstName lastName email is_admin is_approved createdAt updatedAt"
      )
      .lean(),
    User.countDocuments().exec(),
    User.countDocuments({ is_approved: true }).exec(),
  ]);

  return NextResponse.json({
    totalUsers,
    approvedUsers,
    pendingUsers: totalUsers - approvedUsers,
    users: users.map((user) => ({
      id: user._id.toString(),
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      is_admin: user.is_admin,
      is_approved: user.is_approved,
      createdAt: new Date(user.createdAt).toISOString(),
      updatedAt: new Date(user.updatedAt).toISOString(),
    })),
  });
};
