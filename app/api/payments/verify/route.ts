import { NextRequest, NextResponse } from "next/server";
import { authenticateRequest } from "@/lib/auth";
import { connectToDatabase } from "@/lib/mongoose";
import { verifyPaymentSignature } from "@/lib/razorpay";
import Order, { ORDER_STATUS } from "@/models/Order";
import Product from "@/models/Product";
import { z } from "zod";

const verifySchema = z.object({
  razorpay_order_id: z.string().min(1, "Order ID is required"),
  razorpay_payment_id: z.string().min(1, "Payment ID is required"),
  razorpay_signature: z.string().min(1, "Signature is required"),
});

export const POST = async (request: NextRequest) => {
  const user = await authenticateRequest(request);
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const payload = await request.json();
    const body = verifySchema.parse(payload);

    await connectToDatabase();

    // Find the order
    const order = await Order.findOne({
      razorpayOrderId: body.razorpay_order_id,
      userId: user._id,
    });

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    if (order.status === ORDER_STATUS.PAID) {
      return NextResponse.json({
        success: true,
        message: "Payment already verified",
        order: {
          id: order._id.toString(),
          status: order.status,
        },
      });
    }

    // Verify the payment signature
    const isValid = verifyPaymentSignature({
      orderId: body.razorpay_order_id,
      paymentId: body.razorpay_payment_id,
      signature: body.razorpay_signature,
    });

    if (!isValid) {
      // Update order status to failed
      await Order.findByIdAndUpdate(order._id, {
        status: ORDER_STATUS.FAILED,
      });

      return NextResponse.json(
        { error: "Invalid payment signature" },
        { status: 400 }
      );
    }

    // Update order with payment details
    order.razorpayPaymentId = body.razorpay_payment_id;
    order.razorpaySignature = body.razorpay_signature;
    order.status = ORDER_STATUS.PAID;
    order.paidAt = new Date();
    await order.save();

    // Reduce product stock
    const bulkOps = order.items.map((item) => ({
      updateOne: {
        filter: { _id: item.productId },
        update: { $inc: { quantity: -item.quantity } },
      },
    }));
    await Product.bulkWrite(bulkOps);

    return NextResponse.json({
      success: true,
      message: "Payment verified successfully",
      order: {
        id: order._id.toString(),
        status: order.status,
        paidAt: order.paidAt,
        total: order.total,
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.issues.map((i) => i.message).join(", ") },
        { status: 422 }
      );
    }
    console.error("Verify payment error:", error);
    return NextResponse.json(
      { error: "Failed to verify payment" },
      { status: 500 }
    );
  }
};
