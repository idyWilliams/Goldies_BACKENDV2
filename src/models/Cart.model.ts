


import mongoose, { Schema, Document } from "mongoose";

interface ICartProduct {
  product: mongoose.Types.ObjectId;
  size: string;
  toppings: string[];
  flavour: string[];
  dateNeeded: string;
  details: string;
  quantity: number;
}

export interface ICart extends Document {
  userId: mongoose.Types.ObjectId;
  products: ICartProduct[];
}

const cartSchema = new Schema<ICart>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    products: [
      {
        product: { type: Schema.Types.ObjectId, ref: "Product", required: true },
        size: { type: String, required: [true, "Please provide cake size"] },
        toppings: { type: [String], required: [true, "Please provide cake toppings"] },
        flavour: { type: [String], required: [true, "Please provide cake flavour"] },
        dateNeeded: { type: String, required: false },
        details: { type: String, required: false},
        quantity: { type: Number, required: [true, "Please provide the quantity"], min: 1 },
      },
    ],
  },
  { timestamps: true }
);

const Cart = mongoose.model<ICart>("Cart", cartSchema);
export default Cart;
