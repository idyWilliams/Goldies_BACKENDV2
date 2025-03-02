// import { model, Document, Schema } from "mongoose";

// interface cartSchemaI extends Document {
//   size: string;
//   toppings: string;
//   dateNeeded: string;
//   details: string;
//   quantity: number
// }

// const cartSchema = new Schema<cartSchemaI>({
//   size: { type: String, require: [true, "Please provide cake size"] },
//   toppings: {
//     type: String,
//     require: [true, "Please provide cake toppings"],
//   },
//   dateNeeded: {
//     type: String,
//     require: [true, "Please provide when the cake is needed"],
//   },
//   details: { type: String, require: [true, "Please provide cake details"] },
//   quantity: { type: Number, required: [true, "Please provide the quantity for the product"]}
// }, {
//   timestamps: true
// });

// const Cart = model<cartSchemaI>("Cart", cartSchema);
// export default Cart;


import mongoose, { Schema, Document } from "mongoose";

interface ICartProduct {
  productId: mongoose.Types.ObjectId;
  size: string;
  toppings: string;
  flavour: string;
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
        productId: { type: Schema.Types.ObjectId, ref: "Product", required: true },
        size: { type: String, required: [true, "Please provide cake size"] },
        toppings: { type: String, required: [true, "Please provide cake toppings"] },
        flavour: { type: String, required: [true, "Please provide cake flavour"] },
        dateNeeded: { type: String, required: [true, "Please provide when the cake is needed"] },
        details: { type: String, required: [true, "Please provide cake details"] },
        quantity: { type: Number, required: [true, "Please provide the quantity"], min: 1 },
      },
    ],
  },
  { timestamps: true }
);

const Cart = mongoose.model<ICart>("Cart", cartSchema);
export default Cart;
