import { NextRequest, NextResponse } from "next/server";
import { compare } from "bcryptjs";
import { z } from "zod";
import { sign } from "jsonwebtoken";
import { clearUserOtp, findUserById, incrementOtpAttempts } from "@/lib/users";
import { JWT_EXPIRES_IN, JWT_SECRET, SESSION_COOKIE_NAME } from "@/app/env";

const MAX_OTP_ATTEMPTS = 5;

const verifySchema = z.object({
  userId: z.string().trim().min(1, "Missing user identifier."),
  otpCode: z
    .string()
    .trim()
    .regex(/^[0-9]{6}$/u, "Enter the 6-digit code we emailed you."),
});

export const POST = async (request: NextRequest) => {
  try {
    const payload = await request.json();
    const { userId, otpCode } = verifySchema.parse(payload);

    const user = await findUserById(userId);
    if (!user || !user.otpCodeHash || !user.otpExpiresAt) {
      return NextResponse.json(
        { error: "Something went wrong. Please sign in again." },
        { status: 400 }
      );
    }

    if (!user.is_approved) {
      await clearUserOtp(user._id);
      return NextResponse.json(
        {
          error:
            "Your account is awaiting approval. Please contact the administrator.",
        },
        { status: 403 }
      );
    }

    if ((user.otpAttemptCount ?? 0) >= MAX_OTP_ATTEMPTS) {
      await clearUserOtp(user._id);
      return NextResponse.json(
        { error: "Too many attempts. Please sign in again." },
        { status: 429 }
      );
    }

    if (user.otpExpiresAt.getTime() < Date.now()) {
      await clearUserOtp(user._id);
      return NextResponse.json(
        { error: "That code expired. Please sign in again." },
        { status: 400 }
      );
    }

    const match = await compare(otpCode, user.otpCodeHash);
    if (!match) {
      const updatedUser = await incrementOtpAttempts(user._id);
      const attemptsLeft = Math.max(
        0,
        MAX_OTP_ATTEMPTS - (updatedUser?.otpAttemptCount ?? 0)
      );

      if ((updatedUser?.otpAttemptCount ?? 0) >= MAX_OTP_ATTEMPTS) {
        await clearUserOtp(user._id);
        return NextResponse.json(
          { error: "Too many attempts. Please sign in again." },
          { status: 429 }
        );
      }

      return NextResponse.json(
        {
          error:
            attemptsLeft > 0
              ? `Incorrect code. You have ${attemptsLeft} attempts left.`
              : "Incorrect code. Please sign in again.",
        },
        { status: 401 }
      );
    }

    await clearUserOtp(user._id);

    const token = sign(
      {
        sub: user._id.toString(),
        email: user.email,
      },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );

    const response = NextResponse.json(
      {
        user: {
          id: user._id.toString(),
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          phoneNumber: user.phoneNumber,
          firmName: user.firmName,
          address: {
            line1: user.address?.line1 ?? "",
            line2: user.address?.line2 ?? "",
            city: user.address?.city ?? "",
            state: user.address?.state ?? "",
            country: user.address?.country ?? "",
          },
          visitingCardAssetId: user.visitingCardAssetId ?? null,
          visitingCardAssetUrl: user.visitingCardAssetUrl ?? null,
          visitingCardOriginalFilename:
            user.visitingCardOriginalFilename ?? null,
          is_admin: user.is_admin,
          is_approved: user.is_approved,
        },
      },
      { status: 200 }
    );

    response.cookies.set({
      name: SESSION_COOKIE_NAME,
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
    });

    return response;
  } catch (error) {
    if (error instanceof z.ZodError) {
      const issues = error.issues.map((issue) => issue.message);
      return NextResponse.json({ error: issues.join(" ") }, { status: 422 });
    }

    console.error("Verify OTP endpoint error:", error);
    return NextResponse.json(
      { error: "Unable to verify the code right now." },
      { status: 500 }
    );
  }
};
