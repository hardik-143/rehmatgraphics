import { connectToDatabase } from "@/lib/mongoose";
import Product, { type ProductDocument } from "@/models/Product";
import { Types } from "mongoose";

export interface CreateProductInput {
  name: string;
  quantity: number;
  price: number;
}

export const listProducts = async (page = 1, limit = 10) => {
  await connectToDatabase();
  const skip = (page - 1) * limit;
  const [items, total] = await Promise.all([
    Product.find({}).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
    Product.countDocuments({}),
  ]);
  return {
    items: items.map((p) => ({
      id: p._id.toString(),
      name: p.name,
      quantity: p.quantity,
      price: p.price,
      createdAt: new Date(p.createdAt!).toISOString(),
      updatedAt: new Date(p.updatedAt!).toISOString(),
    })),
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
};

export const createProduct = async (input: CreateProductInput): Promise<ProductDocument> => {
  await connectToDatabase();
  return Product.create({ ...input });
};

export const updateProduct = async (id: string | Types.ObjectId, input: Partial<CreateProductInput>) => {
  await connectToDatabase();
  return Product.findByIdAndUpdate(id, input, { new: true }).lean();
};

export const deleteProduct = async (id: string | Types.ObjectId) => {
  await connectToDatabase();
  return Product.findByIdAndDelete(id).lean();
};
