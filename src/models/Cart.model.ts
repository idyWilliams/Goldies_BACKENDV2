import mongoose, { Schema, Document } from "mongoose";

interface ICartProduct {
  product: mongoose.Types.ObjectId;
  shape: string;
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
        product: {
          type: Schema.Types.ObjectId,
          ref: "Product",
          required: true,
        },
        shape: { type: String, required: false },
        size: { type: String, required: false },
        toppings: { type: [String], required: false },
        flavour: { type: [String], required: false },
        dateNeeded: { type: String, required: false },
        details: { type: String, required: false },
        quantity: {
          type: Number,
          required: [true, "Please provide the quantity"],
          min: 1,
        },
      },
    ],
  },
  { timestamps: true }
);

const Cart = mongoose.model<ICart>("Cart", cartSchema);
export default Cart;
