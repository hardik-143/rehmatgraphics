import { NextRequest, NextResponse } from 'next/server';
import { authenticateRequest } from '@/lib/auth';
import { connectToDatabase } from '@/lib/mongoose';
import Order from '@/models/Order';
export const GET = async (request: NextRequest) => {
  const adminUser = await authenticateRequest(request);
  if (!adminUser)
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  if (!adminUser.is_admin)
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const { searchParams } = new URL(request.url);
  const page = parseInt(searchParams.get('page') || '1', 10);
  const limit = Math.min(parseInt(searchParams.get('limit') || '10', 10), 100);
  const status = searchParams.get('status');

  try {
    await connectToDatabase();

    const filter: any = {};
    const validStatuses = [
      'pending',
      'paid',
      'placed',
      'processing your order',
      'out for delivery',
      'delivered',
      'failed',
      'refunded',
      'cancelled',
    ];
    if (status && validStatuses.includes(status)) {
      filter.status = status;
    }

    const skip = (page - 1) * limit;
    const [orders, total] = await Promise.all([
      Order.find(filter)
        .populate('userId', 'firstName lastName email phoneNumber')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Order.countDocuments(filter),
    ]);

    console.log(
      `Fetched ${orders.length} orders for admin ${adminUser.email}`,
      orders
    );
    const formattedOrders = orders.map((order) => ({
      id: order._id.toString(),
      userId:
        typeof order.userId === 'object' ? order.userId._id.toString() : null,
      customer: {
        name:
          typeof order.userId === 'object' && order.userId && 'firstName' in order.userId && 'lastName' in order.userId
            ? `${(order.userId as any).firstName || ''} ${(order.userId as any).lastName || ''}`.trim()
            : 'Unknown Customer',
        email:
          typeof order.userId === 'object' && order.userId && 'email' in order.userId ? (order.userId as any).email : undefined,
        phone:
          typeof order.userId === 'object' && order.userId && 'phoneNumber' in order.userId
            ? (order.userId as any).phoneNumber
            : undefined,
      },
      items: order.items.map((item) => ({
        productId: item.productId.toString(),
        name: item.name,
        quantity: item.quantity,
        price: item.price,
      })),
      subtotal: order.subtotal,
      tax: order.tax,
      total: order.total,
      currency: order.currency,
      status: order.status,
      razorpayOrderId: order.razorpayOrderId,
      razorpayPaymentId: order.razorpayPaymentId,
      paidAt: order.paidAt?.toISOString(),
      shippingAddress: order.shippingAddress,
      notes: order.notes,
      createdAt: order.createdAt.toISOString(),
      updatedAt: order.updatedAt.toISOString(),
    }));

    return NextResponse.json({
      orders: formattedOrders,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('GET /api/admin/orders error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch orders' },
      { status: 500 }
    );
  }
};
