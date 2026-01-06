import { NextRequest, NextResponse } from 'next/server';
import { authenticateRequest } from '@/lib/auth';
import { connectToDatabase } from '@/lib/mongoose';
import Order from '@/models/Order';
import { z } from 'zod';

const updateOrderSchema = z.object({
  status: z.enum([
    'placed',
    'processing your order',
    'out for delivery',
    'delivered',
    'cancelled',
  ]),
});

export const PATCH = async (
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) => {
  const adminUser = await authenticateRequest(request);
  if (!adminUser)
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  if (!adminUser.is_admin)
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  try {
    const payload = await request.json();
    const body = updateOrderSchema.parse(payload);

    const { id } = await params;

    await connectToDatabase();

    const order = await Order.findById(id);
    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    // Only allow status updates for paid orders
    if (
      order.status !== 'paid' &&
      order.status !== 'placed' &&
      order.status !== 'processing your order' &&
      order.status !== 'out for delivery'
    ) {
      return NextResponse.json(
        { error: 'Cannot update status of unpaid or completed orders' },
        { status: 400 }
      );
    }

    order.status = body.status;
    await order.save();

    return NextResponse.json({
      id: order._id.toString(),
      status: order.status,
      updatedAt: order.updatedAt.toISOString(),
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.issues.map((i) => i.message).join(', ') },
        { status: 422 }
      );
    }

    console.error('PATCH /api/admin/orders/[id] error:', error);
    return NextResponse.json(
      { error: 'Failed to update order' },
      { status: 500 }
    );
  }
};
