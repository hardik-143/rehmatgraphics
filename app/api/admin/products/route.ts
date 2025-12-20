import { NextRequest, NextResponse } from "next/server";
import { authenticateRequest } from "@/lib/auth";
import { listProducts, createProduct } from "@/lib/products";
import { z } from "zod";

const createSchema = z.object({
  name: z.string().trim().min(1, "Product name is required"),
  quantity: z.number().int().min(0, "Quantity cannot be negative"),
  price: z.number().min(0, "Price cannot be negative"),
});

export const GET = async (request: NextRequest) => {
  const adminUser = await authenticateRequest(request);
  if (!adminUser) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!adminUser.is_admin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { searchParams } = new URL(request.url);
  const page = parseInt(searchParams.get("page") || "1", 10);
  const limit = Math.min(parseInt(searchParams.get("limit") || "10", 10), 100);
  const q = (searchParams.get("q") || "").trim();

  try {
    const data = await listProducts(page, limit, q || undefined);
    return NextResponse.json(data);
  } catch (error) {
    console.error("GET /api/admin/products error:", error);
    return NextResponse.json({ error: "Failed to fetch products" }, { status: 500 });
  }
};

export const POST = async (request: NextRequest) => {
  const adminUser = await authenticateRequest(request);
  if (!adminUser) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!adminUser.is_admin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  try {
    const payload = await request.json();
    const body = createSchema.parse(payload);
    const created = await createProduct(body);
    return NextResponse.json({
      id: created._id.toString(),
      name: created.name,
      quantity: created.quantity,
      price: created.price,
      createdAt: created.createdAt,
      updatedAt: created.updatedAt,
    }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues.map(i => i.message).join(" ") }, { status: 422 });
    }
    console.error("POST /api/admin/products error:", error);
    return NextResponse.json({ error: "Failed to create product" }, { status: 500 });
  }
};
