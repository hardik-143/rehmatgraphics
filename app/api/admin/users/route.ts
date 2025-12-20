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

  const { searchParams } = new URL(request.url);
  const page = parseInt(searchParams.get("page") || "1", 10);
  const limit = Math.min(parseInt(searchParams.get("limit") || "10", 10), 100);
  const skip = (page - 1) * limit;
  const q = (searchParams.get("q") || "").trim();
  const regex = q ? new RegExp(q, "i") : null;
  const filter = regex
    ? {
        $or: [
          { firstName: regex },
          { lastName: regex },
          { email: regex },
          { firmName: regex },
          { phoneNumber: regex },
          { "address.city": regex },
          { "address.state": regex },
        ],
      }
    : {};

  const [users, filteredTotal, totalUsers, approvedUsers] = await Promise.all([
    User.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .select(
        "firstName lastName email phoneNumber firmName address visitingCardAssetId visitingCardAssetUrl visitingCardOriginalFilename is_admin is_approved createdAt updatedAt"
      )
      .lean(),
    User.countDocuments(filter).exec(),
    User.countDocuments().exec(),
    User.countDocuments({ is_approved: true }).exec(),
  ]);

  const items = users.map((user) => ({
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
  }));

  return NextResponse.json({
    stats: {
      totalUsers,
      approvedUsers,
      pendingUsers: totalUsers - approvedUsers,
    },
    items,
    pagination: {
      page,
      limit,
      total: filteredTotal,
      totalPages: Math.ceil(filteredTotal / limit),
    },
  });
};
