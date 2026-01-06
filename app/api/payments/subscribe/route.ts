import { NextRequest, NextResponse } from "next/server";
import { authenticateRequest } from "@/lib/auth";
import { connectToDatabase } from "@/lib/mongoose";
import { createRazorpayOrder } from "@/lib/razorpay";
import Subscription from "@/models/Subscription";
import { z } from "zod";

const subscribeSchema = z.object({
  planName: z.string().min(1).default("Premium"),
  amount: z.number().min(1).default(499),
});

export const POST = async (request: NextRequest) => {
  const user = await authenticateRequest(request);
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const payload = await request.json();
    const body = subscribeSchema.parse(payload);

    await connectToDatabase();

    // Check if user already has active subscription
    const existingActive = await Subscription.findOne({
      userId: user._id,
      status: "active",
      endDate: { $gt: new Date() },
    });

    if (existingActive) {
      return NextResponse.json(
        { error: "You already have an active subscription" },
        { status: 400 }
      );
    }

    // Create Razorpay order (amount in paise)
    const razorpayOrder = await createRazorpayOrder({
      amount: Math.round(body.amount * 100),
      currency: "INR",
      receipt: `sub_${Date.now()}`,
      notes: {
        userId: user._id.toString(),
        planName: body.planName,
      },
    });

    // Create subscription record
    const subscription = await Subscription.create({
      userId: user._id,
      planName: body.planName,
      amount: body.amount,
      currency: "INR",
      status: "pending",
      razorpayOrderId: razorpayOrder.id,
    });

    return NextResponse.json({
      success: true,
      order: {
        id: subscription._id.toString(),
        razorpayOrderId: razorpayOrder.id,
        amount: razorpayOrder.amount,
        currency: razorpayOrder.currency,
        planName: body.planName,
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.issues.map((i) => i.message).join(", ") },
        { status: 422 }
      );
    }
    console.error("Subscribe error:", error);
    return NextResponse.json(
      { error: "Failed to create subscription" },
      { status: 500 }
    );
  }
};
