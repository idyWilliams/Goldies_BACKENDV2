import { Schema, model, Document } from "mongoose";

interface IProduct extends Document {
  name: string;
  description: string;
  images: string[] | undefined;
  category: string;
  subCategory: string;
  minPrice: string;
  maxPrice: string;
  sizes: string[] | undefined;
  toppings: string[] | undefined;
  flavour: string[] | undefined;
  productType: string;
}

const productSchema = new Schema<IProduct>(
  {
    name: { type: String, require: true },
    description: { type: String, require: true },
    images: { type: Array, require: true },
    category: { type: String, require: true },
    subCategory: { type: String, require: true },
    minPrice: { type: String, require: true },
    maxPrice: { type: String, require: true },
    sizes: { type: Array, require: true },
    productType: { type: String, require: true },
    toppings: { type: Array, require: true },
    flavour: Array,
  },
  {
    timestamps: true,
  }
);

const Product = model<IProduct>("Product", productSchema);
export default Product;
