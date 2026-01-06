import { NextRequest, NextResponse } from "next/server";
import { authenticateRequest } from "@/lib/auth";
import { connectToDatabase } from "@/lib/mongoose";
import { verifyPaymentSignature } from "@/lib/razorpay";
import Subscription, { SUBSCRIPTION_STATUS } from "@/models/Subscription";
import { User } from "@/models/User";
import { z } from "zod";

const verifySchema = z.object({
  razorpay_order_id: z.string().min(1),
  razorpay_payment_id: z.string().min(1),
  razorpay_signature: z.string().min(1),
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

    const subscription = await Subscription.findOne({
      razorpayOrderId: body.razorpay_order_id,
      userId: user._id,
    });

    if (!subscription) {
      return NextResponse.json({ error: "Subscription not found" }, { status: 404 });
    }

    if (subscription.status === SUBSCRIPTION_STATUS.ACTIVE) {
      return NextResponse.json({
        success: true,
        message: "Already verified",
        subscription: { id: subscription._id.toString(), status: subscription.status },
      });
    }

    // Verify signature
    const isValid = verifyPaymentSignature({
      orderId: body.razorpay_order_id,
      paymentId: body.razorpay_payment_id,
      signature: body.razorpay_signature,
    });

    if (!isValid) {
      await Subscription.findByIdAndUpdate(subscription._id, {
        status: SUBSCRIPTION_STATUS.EXPIRED,
      });
      return NextResponse.json({ error: "Invalid payment signature" }, { status: 400 });
    }

    // Activate subscription (1 month from now)
    const startDate = new Date();
    const endDate = new Date();
    endDate.setMonth(endDate.getMonth() + 1);

    subscription.razorpayPaymentId = body.razorpay_payment_id;
    subscription.razorpaySignature = body.razorpay_signature;
    subscription.status = SUBSCRIPTION_STATUS.ACTIVE;
    subscription.paidAt = new Date();
    subscription.startDate = startDate;
    subscription.endDate = endDate;
    await subscription.save();

    // Mark user as subscribed
    await User.findByIdAndUpdate(user._id, {
      is_subscribed: true,
      subscriptionEndDate: endDate,
    });

    return NextResponse.json({
      success: true,
      message: "Subscription activated",
      subscription: {
        id: subscription._id.toString(),
        status: subscription.status,
        planName: subscription.planName,
        startDate,
        endDate,
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.issues.map((i) => i.message).join(", ") },
        { status: 422 }
      );
    }
    console.error("Verify subscription error:", error);
    return NextResponse.json({ error: "Failed to verify subscription" }, { status: 500 });
  }
};
