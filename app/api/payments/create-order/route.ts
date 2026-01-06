import { NextRequest, NextResponse } from 'next/server';
import { authenticateRequest } from '@/lib/auth';
import { connectToDatabase } from '@/lib/mongoose';
import { createRazorpayOrder } from '@/lib/razorpay';
import Order from '@/models/Order';
import Product from '@/models/Product';
import { z } from 'zod';
import { Types } from 'mongoose';

const orderItemSchema = z.object({
  productId: z.string().min(1, 'Product ID is required'),
  quantity: z.number().int().min(1, 'Quantity must be at least 1'),
});

const createOrderSchema = z.object({
  items: z.array(orderItemSchema).min(1, 'At least one item is required'),
  shippingAddress: z
    .object({
      line1: z.string().min(1),
      line2: z.string().optional(),
      city: z.string().min(1),
      state: z.string().min(1),
      pincode: z.string().min(5),
    })
    .optional(),
  notes: z.record(z.string(), z.string()).optional(),
});

export const POST = async (request: NextRequest) => {
  const user = await authenticateRequest(request);
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const payload = await request.json();
    const body = createOrderSchema.parse(payload);

    await connectToDatabase();

    // Fetch products and validate
    const productIds = body.items.map(
      (item) => new Types.ObjectId(item.productId)
    );
    const products = await Product.find({ _id: { $in: productIds } }).lean();

    if (products.length !== body.items.length) {
      return NextResponse.json(
        { error: 'One or more products not found' },
        { status: 400 }
      );
    }

    // Build order items with current prices
    const orderItems = body.items.map((item) => {
      const product = products.find((p) => p._id.toString() === item.productId);
      if (!product) throw new Error('Product not found');

      // Check stock
      if (product.quantity < item.quantity) {
        throw new Error(`Insufficient stock for ${product.name}`);
      }

      return {
        productId: new Types.ObjectId(item.productId),
        name: product.name,
        quantity: item.quantity,
        price: product.price,
      };
    });

    // Calculate totals
    const subtotal = orderItems.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );
    const tax = Math.round(subtotal * 0.18 * 100) / 100; // 18% GST
    const total = Math.round((subtotal + tax) * 100) / 100;

    // Create Razorpay order (amount in paise)
    const razorpayOrder = await createRazorpayOrder({
      amount: Math.round(total * 100), // Convert to paise
      currency: 'INR',
      receipt: `order_${Date.now()}`,
      notes: {
        userId: user._id.toString(),
        ...body.notes,
      },
    });

    // Create order in database
    const order = await Order.create({
      userId: user._id,
      items: orderItems,
      subtotal,
      tax,
      total,
      currency: 'INR',
      status: 'pending',
      razorpayOrderId: razorpayOrder.id,
      notes: body.notes,
      shippingAddress: body.shippingAddress,
    });

    return NextResponse.json({
      success: true,
      order: {
        id: order._id.toString(),
        razorpayOrderId: razorpayOrder.id,
        amount: razorpayOrder.amount,
        currency: razorpayOrder.currency,
        subtotal,
        tax,
        total,
        items: orderItems,
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.issues.map((i) => i.message).join(', ') },
        { status: 422 }
      );
    }
    console.error('Create order error:', error);
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : 'Failed to create order',
      },
      { status: 500 }
    );
  }
};
