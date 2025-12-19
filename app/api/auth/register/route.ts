import { NextRequest, NextResponse } from "next/server";
import { hash } from "bcryptjs";
import { z } from "zod";
import { createUser, findUserByEmail } from "@/lib/users";
import { client } from "@/sanity/lib/client";

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
  phoneNumber: z
    .string()
    .trim()
    .min(7, "Phone number must be at least 7 characters.")
    .max(20, "Phone number must be at most 20 characters.")
    .regex(/^[0-9+\-()\s]*$/u, "Enter a valid phone number."),
  firmName: z
    .string()
    .trim()
    .min(2, "Firm name must be at least 2 characters."),
  addressLine1: z
    .string()
    .trim()
    .min(3, "Address line 1 must be at least 3 characters."),
  addressLine2: z
    .string()
    .trim()
    .max(120, "Address line 2 must be at most 120 characters.")
    .optional()
    .or(z.literal("")),
  city: z
    .string()
    .trim()
    .min(2, "City must be at least 2 characters."),
  state: z
    .string()
    .trim()
    .min(2, "State must be at least 2 characters."),
});

export const POST = async (request: NextRequest) => {
  try {
    const formData = await request.formData();

    const stringField = (key: string) => {
      const value = formData.get(key);
      return typeof value === "string" ? value : undefined;
    };

    const payload = registerSchema.parse({
      firstName: stringField("firstName"),
      lastName: stringField("lastName"),
      email: stringField("email"),
      password: stringField("password"),
      phoneNumber: stringField("phoneNumber"),
      firmName: stringField("firmName"),
      addressLine1: stringField("addressLine1"),
      addressLine2: stringField("addressLine2"),
      city: stringField("city"),
      state: stringField("state"),
    });

    const visitingCard = formData.get("visitingCard");

    if (!(visitingCard instanceof File) || visitingCard.size === 0) {
      return NextResponse.json(
        { error: "Please upload a visiting card image." },
        { status: 422 }
      );
    }

    if (!visitingCard.type?.startsWith("image/")) {
      return NextResponse.json(
        { error: "Visiting card must be an image file." },
        { status: 422 }
      );
    }

    const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024;
    if (visitingCard.size > MAX_FILE_SIZE_BYTES) {
      return NextResponse.json(
        { error: "Visiting card must be 5MB or smaller." },
        { status: 422 }
      );
    }

    const {
      firstName,
      lastName,
      email,
      password,
      phoneNumber,
      firmName,
      addressLine1,
      addressLine2,
      city,
      state,
    } = payload;

    const existing = await findUserByEmail(email);
    if (existing) {
      return NextResponse.json(
        { error: "This email is already registered." },
        { status: 409 }
      );
    }

    const passwordHash = await hash(password, 12);

    const visitingCardArrayBuffer = await visitingCard.arrayBuffer();
    const visitingCardBuffer = Buffer.from(visitingCardArrayBuffer);

    let visitingCardAssetId: string | undefined;
    let visitingCardAssetUrl: string | undefined;
    let visitingCardOriginalFilename: string | undefined;

    try {
      const asset = await client.assets.upload("image", visitingCardBuffer, {
        filename: visitingCard.name ?? "visiting-card.jpg",
        contentType: visitingCard.type,
      });

      visitingCardAssetId = asset?._id;
      visitingCardAssetUrl = asset?.url;
      visitingCardOriginalFilename = asset?.originalFilename;
    } catch (assetError) {
      console.error("Visiting card upload failed:", assetError);
      return NextResponse.json(
        { error: "We could not store the visiting card. Please try again." },
        { status: 500 }
      );
    }

    await createUser({
      firstName,
      lastName,
      email,
      passwordHash,
      phoneNumber,
      firmName,
      address: {
        line1: addressLine1,
        line2: addressLine2 || undefined,
        city,
        state,
      },
      visitingCardAssetId,
      visitingCardAssetUrl,
      visitingCardOriginalFilename,
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
