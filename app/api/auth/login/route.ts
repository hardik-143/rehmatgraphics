import { randomInt } from "crypto";
import { NextRequest, NextResponse } from "next/server";
import { compare, hash } from "bcryptjs";
import { z } from "zod";
import { findUserByEmail, setUserOtp } from "@/lib/users";
import { OTP_EXPIRY_MINUTES } from "@/app/env";
import { sendOtpEmail } from "@/lib/mailer";

const loginSchema = z.object({
  email: z
    .string()
    .trim()
    .toLowerCase()
    .email("Please provide a valid email address."),
  password: z.string().min(8, "Password must be at least 8 characters."),
});

export const POST = async (request: NextRequest) => {
  try {
    const payload = await request.json();
    const { email, password } = loginSchema.parse(payload);

    const user = await findUserByEmail(email);
    if (!user) {
      return NextResponse.json(
        { error: "Invalid email or password." },
        { status: 401 }
      );
    }

    const passwordsMatch = await compare(password, user.passwordHash);
    if (!passwordsMatch) {
      return NextResponse.json(
        { error: "Invalid email or password." },
        { status: 401 }
      );
    }

    if (!user.is_approved) {
      return NextResponse.json(
        {
          error:
            "Your account is awaiting approval. Please contact the administrator.",
        },
        { status: 403 }
      );
    }

    const otpCode = String(randomInt(100000, 1000000));
    const otpExpiresAt = new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000);
    const otpCodeHash = await hash(otpCode, 10);

    await setUserOtp(user._id, otpCodeHash, otpExpiresAt);
    await sendOtpEmail(user.email, otpCode, OTP_EXPIRY_MINUTES);

    return NextResponse.json(
      {
        otpRequired: true,
        userId: user._id.toString(),
        message: "We emailed you a one-time code to finish signing in.",
      },
      { status: 200 }
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      const issues = error.issues.map((issue) => issue.message);
      return NextResponse.json({ error: issues.join(" ") }, { status: 422 });
    }

    console.error("Login endpoint error:", error);
    return NextResponse.json(
      { error: "Unable to sign in right now." },
      { status: 500 }
    );
  }
};
