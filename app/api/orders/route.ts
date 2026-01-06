import { NextRequest, NextResponse } from 'next/server';
import { authenticateRequest } from '@/lib/auth';
import { connectToDatabase } from '@/lib/mongoose';
import { createRazorpayOrder } from '@/lib/razorpay';
import Order from '@/models/Order';
import Product from '@/models/Product';
import { z } from 'zod';
import { Types } from 'mongoose';

// Check environment variables
if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
  console.error('Missing Razorpay environment variables');
}

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
    console.log('Order payload received:', payload);

    const body = createOrderSchema.parse(payload);
    console.log('Payload validated successfully:', body);

    await connectToDatabase();
    console.log('Database connected successfully');

    // Fetch products and validate
    const productIds = body.items.map((item) => {
      try {
        return new Types.ObjectId(item.productId);
      } catch (err) {
        throw new Error(`Invalid product ID format: ${item.productId}`);
      }
    });
    console.log('Product IDs:', productIds);

    const products = await Product.find({ _id: { $in: productIds } }).lean();
    console.log(
      'Products found:',
      products.length,
      'Expected:',
      body.items.length
    );

    if (products.length !== body.items.length) {
      return NextResponse.json(
        { error: 'One or more products not found' },
        { status: 400 }
      );
    }

    // Create product map for easy lookup
    const productMap = new Map(products.map((p) => [p._id.toString(), p]));

    // Validate stock and calculate totals
    let subtotal = 0;
    const orderItems = [];
    console.log('Starting product validation and calculation...');

    for (const item of body.items) {
      const product = productMap.get(item.productId);
      if (!product) {
        console.error(`Product not found in map: ${item.productId}`);
        return NextResponse.json(
          { error: `Product ${item.productId} not found` },
          { status: 400 }
        );
      }

      if (product.quantity < item.quantity) {
        console.error(
          `Insufficient stock for ${product.name}: available ${product.quantity}, requested ${item.quantity}`
        );
        return NextResponse.json(
          {
            error: `Insufficient stock for ${product.name}. Available: ${product.quantity}, Requested: ${item.quantity}`,
          },
          { status: 400 }
        );
      }

      const itemTotal = product.price * item.quantity;
      subtotal += itemTotal;

      orderItems.push({
        productId: new Types.ObjectId(item.productId),
        name: product.name,
        quantity: item.quantity,
        price: product.price,
      });
    }

    const tax = 0; // Add tax calculation if needed
    const total = subtotal + tax;
    console.log('Order totals calculated:', { subtotal, tax, total });

    // Create Razorpay order
    console.log(
      'Creating Razorpay order with amount:',
      Math.round(total * 100)
    );
    const razorpayOrder = await createRazorpayOrder({
      amount: Math.round(total * 100), // Convert to paise
      currency: 'INR',
      receipt: `order_${Date.now()}`,
      notes: {
        userId: user._id.toString(),
        customerEmail: user.email,
        ...body.notes,
      },
    });
    console.log('Razorpay order created:', razorpayOrder.id);

    // Create order in database
    console.log('Creating order in database...');
    const order = await Order.create({
      userId: user._id,
      items: orderItems,
      subtotal,
      tax,
      total,
      currency: 'INR',
      status: 'pending',
      razorpayOrderId: razorpayOrder.id,
      shippingAddress: body.shippingAddress,
      notes: body.notes,
    });
    console.log('Order created successfully:', order._id.toString());

    return NextResponse.json(
      {
        success: true,
        order: {
          id: order._id.toString(),
          razorpayOrderId: razorpayOrder.id,
          amount: razorpayOrder.amount,
          currency: razorpayOrder.currency,
          total: order.total,
          items: order.items,
          status: order.status,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Create order error details:', error);

    if (error instanceof z.ZodError) {
      const errorMessage = error.issues.map((i) => i.message).join(', ');
      console.error('Zod validation error:', errorMessage);
      return NextResponse.json(
        { error: `Validation error: ${errorMessage}` },
        { status: 422 }
      );
    }

    if (error instanceof Error) {
      console.error('Known error:', error.message);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    console.error('Unknown error type:', typeof error, error);
    return NextResponse.json(
      {
        error:
          'Failed to create order. Please check the server logs for details.',
      },
      { status: 500 }
    );
  }
};

export const GET = async (request: NextRequest) => {
  return NextResponse.json({
    message: 'Orders API is working',
    timestamp: new Date().toISOString(),
    env_check: {
      razorpay_key_id: !!process.env.RAZORPAY_KEY_ID,
      razorpay_key_secret: !!process.env.RAZORPAY_KEY_SECRET,
    },
  });
};
