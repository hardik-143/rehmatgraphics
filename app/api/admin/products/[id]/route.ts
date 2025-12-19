import { NextRequest, NextResponse } from "next/server";
import { authenticateRequest } from "@/lib/auth";
import { updateProduct, deleteProduct } from "@/lib/products";
import { z } from "zod";

const updateSchema = z.object({
  name: z.string().trim().min(1).optional(),
  quantity: z.number().int().min(0).optional(),
  price: z.number().min(0).optional(),
}).refine((data) => Object.keys(data).length > 0, { message: "No fields to update" });

export const PATCH = async (
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) => {
      const { id } = await params;

  const adminUser = await authenticateRequest(request);
  if (!adminUser) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!adminUser.is_admin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  try {
    const payload = await request.json();
    const body = updateSchema.parse(payload);
    const updated = await updateProduct(id, body);
    if (!updated) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json({
      id: updated._id.toString(),
      name: updated.name,
      quantity: updated.quantity,
      price: updated.price,
      createdAt: updated.createdAt,
      updatedAt: updated.updatedAt,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues.map(i => i.message).join(" ") }, { status: 422 });
    }
    console.error("PATCH /api/admin/products/[id] error:", error);
    return NextResponse.json({ error: "Failed to update product" }, { status: 500 });
  }
};

export const DELETE = async (
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) => {
      const { id } = await params;
  const adminUser = await authenticateRequest(request);
  if (!adminUser) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!adminUser.is_admin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  try {
    const deleted = await deleteProduct(id);
    if (!deleted) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE /api/admin/products/[id] error:", error);
    return NextResponse.json({ error: "Failed to delete product" }, { status: 500 });
  }
};
