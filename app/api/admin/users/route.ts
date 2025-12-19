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
        "firstName lastName email phoneNumber firmName address visitingCardAssetId visitingCardAssetUrl visitingCardOriginalFilename is_admin is_approved createdAt updatedAt"
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
      phoneNumber: user.phoneNumber,
      firmName: user.firmName,
      address: {
        line1: user.address?.line1 ?? "",
        line2: user.address?.line2 ?? "",
        city: user.address?.city ?? "",
        state: user.address?.state ?? "",
        country: user.address?.country ?? "",
      },
      visitingCardAssetId: user.visitingCardAssetId ?? null,
      visitingCardAssetUrl: user.visitingCardAssetUrl ?? null,
      visitingCardOriginalFilename: user.visitingCardOriginalFilename ?? null,
      is_admin: user.is_admin,
      is_approved: user.is_approved,
      createdAt: new Date(user.createdAt).toISOString(),
      updatedAt: new Date(user.updatedAt).toISOString(),
    })),
  });
};
