import { NextRequest, NextResponse } from "next/server";
import { hash } from "bcryptjs";
import { z } from "zod";
import { createUser, findUserByEmail } from "@/lib/users";

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
    console.log("Register payload:", payload);
    const { firstName, lastName, email, password } =
      registerSchema.parse(payload);

    const existing = await findUserByEmail(email);
    if (existing) {
      return NextResponse.json(
        { error: "This email is already registered." },
        { status: 409 }
      );
    }
    // Password123#@
    const passwordHash = await hash(password, 12);

    const user = await createUser({
      firstName,
      lastName,
      email,
      passwordHash,
    });
    return NextResponse.json(
      {
        pendingApproval: true,
        message:
          "Registration received. An administrator will approve your account soon.",
      },
      { status: 201 }
    );
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
