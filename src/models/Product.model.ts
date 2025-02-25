import { Schema, model, Document, Types } from "mongoose";

const categoryT = new Schema({
  name: { type: String, required: true },
  id: { type: String, required: true },
});

interface IProduct extends Document {
  name: string;
  description: string;
  shapes: string[] | undefined;
  sizes: string[] | undefined;
  productType: string;
  toppings: string[] | undefined;
  category: Schema.Types.ObjectId;           // Reference to category
  subCategories: Schema.Types.ObjectId[];  
  minPrice: string;
  maxPrice: string;
  images: string[] | undefined;
  flavour?: string[] | undefined;
  status: string;
  productCode: string;
}

const productSchema = new Schema<IProduct>(
  {
    name: { type: String, require: true },
    description: { type: String, require: true },
    shapes: { type: Array, require: true },
    sizes: { type: Array, require: true },
    productType: { type: String, require: true },
    toppings: { type: Array, require: true },
    category: { 
      type: Schema.Types.ObjectId, 
      ref: 'Category',
      required: true 
    },
    subCategories: { 
      type: [Schema.Types.ObjectId], 
      ref: 'SubCategory',
      required: true 
    },
    minPrice: { type: String, require: true },
    maxPrice: { type: String, require: true },
    images: { type: Array, require: true },
    flavour: { type: Array, required: false },
    status: {type: String, required: true},
    productCode: {type: String, required: false}
  },
  {
    timestamps: true,
  }
);

const Product = model<IProduct>("Product", productSchema);
export default Product;
