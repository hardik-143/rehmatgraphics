import { NextRequest, NextResponse } from "next/server";
import { hash } from "bcryptjs";
import { z } from "zod";
import { sign } from "jsonwebtoken";
import { createUser, findUserByEmail } from "@/lib/users";
import { JWT_EXPIRES_IN, JWT_SECRET, SESSION_COOKIE_NAME } from "@/app/env";

const registerSchema = z.object({
  firstName: z
    .string()
    .trim()
    .min(2, "First name must be at least 2 characters."),
  lastName: z
    .string()
    .trim()
    .min(2, "Last name must be at least 2 characters."),
  email: z
    .string()
    .trim()
    .toLowerCase()
    .email("Please provide a valid email address."),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters.")
    .max(72, "Password must be at most 72 characters."),
});

export const POST = async (request: NextRequest) => {
  try {
    const payload = await request.json();
    const { firstName, lastName, email, password } =
      registerSchema.parse(payload);

    const existing = await findUserByEmail(email);
    if (existing) {
      return NextResponse.json(
        { error: "This email is already registered." },
        { status: 409 }
      );
    }

    const passwordHash = await hash(password, 12);

    const user = await createUser({
      firstName,
      lastName,
      email,
      passwordHash,
    });

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
        },
      },
      { status: 201 }
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

    console.error("Register endpoint error:", error);
    return NextResponse.json(
      { error: "Unable to complete registration right now." },
      { status: 500 }
    );
  }
};
