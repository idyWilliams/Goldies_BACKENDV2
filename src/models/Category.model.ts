import { Schema, model, Document } from "mongoose";

interface ICategory extends Document {
  name: string;
  description: string;
  images: string[] | undefined;
  category: string;
  minPrice: string;
  maxPrice: string;
  shapes: string[] | undefined;
  sizes: string[] | undefined;
  toppings: string[] | undefined;
  fillings: string[] | undefined;
}

const categorySchema = new Schema<ICategory>(
  {
    name: { type: String, require: true },
    description: { type: String, require: true },
    images: { type: Array, require: true },
    category: { type: String, require: true },
    minPrice: { type: String, require: true },
    maxPrice: { type: String, require: true },
    shapes: { type: Array, require: true },
    sizes: { type: Array, require: true },
    fillings: { type: Array, require: true },
    toppings: { type: Array, require: true },
  },
  {
    timestamps: true,
  }
);

const Category = model<ICategory>("Category", categorySchema);
export default Category;
