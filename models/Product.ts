import { Schema, model, models, type Model, type Document } from "mongoose";

export interface ProductDocument extends Document {
  name: string;
  quantity: number;
  price: number;
  createdAt: Date;
  updatedAt: Date;
}

const ProductSchema = new Schema<ProductDocument>(
  {
    name: { type: String, required: true, trim: true, minlength: 1 },
    quantity: { type: Number, required: true, min: 0 },
    price: { type: Number, required: true, min: 0 },
  },
  { timestamps: true }
);

ProductSchema.index({ name: 1 }, { unique: false });

const Product: Model<ProductDocument> =
  models.Product || model<ProductDocument>("Product", ProductSchema);

export default Product;
