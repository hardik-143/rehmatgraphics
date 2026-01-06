import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedUserFromCookies } from '@/lib/auth';

export const GET = async (request: NextRequest) => {
  try {
    const user = await getAuthenticatedUserFromCookies();

    if (!user) {
      return NextResponse.json({ user: null }, { status: 200 });
    }

    return NextResponse.json({
      user: {
        id: user._id.toString(),
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        phoneNumber: user.phoneNumber,
        firmName: user.firmName,
        address: user.address,
        visitingCardAssetId: user.visitingCardAssetId,
        visitingCardAssetUrl: user.visitingCardAssetUrl,
        visitingCardOriginalFilename: user.visitingCardOriginalFilename,
        is_admin: user.is_admin,
        is_approved: user.is_approved,
        is_subscribed: user.is_subscribed,
        subscriptionEndDate: user.subscriptionEndDate?.toISOString(),
      },
    });
  } catch (error) {
    console.error('GET /api/auth/me error:', error);
    return NextResponse.json({ user: null }, { status: 200 });
  }
};
