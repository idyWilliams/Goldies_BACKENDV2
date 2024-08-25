import { model, Document, Schema } from "mongoose";

interface cartSchemaI extends Document {
  size: string;
  toppings: string;
  dateNeeded: string;
  details: string;
  quantity: number
}

const cartSchema = new Schema<cartSchemaI>({
  size: { type: String, require: [true, "Please provide cake size"] },
  toppings: {
    type: String,
    require: [true, "Please provide cake toppings"],
  },
  dateNeeded: {
    type: String,
    require: [true, "Please provide when the cake is needed"],
  },
  details: { type: String, require: [true, "Please provide cake details"] },
  quantity: { type: Number, required: [true, "Please provide the quantity for the product"]}
}, {
  timestamps: true
});

const Cart = model<cartSchemaI>("Cart", cartSchema);
export default Cart;
