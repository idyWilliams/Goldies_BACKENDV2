import { Document, model, Schema, Types } from "mongoose";

type FeeT = {
  subTotal: number;
  total: number;
  deliveryFee: number;
};

// Update the interface to include timestamp fields
interface OrderSchemaI extends Document {
  firstName: string;
  lastName: string;
  email: string;
  country: string;
  state: string;
  cityOrTown: string;
  streetAddress: string;
  phoneNumber: string;
  orderedItems: Array<{
    product: Schema.Types.ObjectId;
    size?: string;
    toppings?: string[];
    flavour?: string[];
    dateNeeded?: string;
    details?: string;
    quantity: number;
  }>;
  fee: FeeT;
  user: Schema.Types.ObjectId;
  orderStatus: "pending" | "completed" | "cancelled";
  orderId: string;
  // Add timestamp fields that Mongoose generates
  createdAt: Date;
  updatedAt: Date;
}

const FeeSchema = new Schema({
  subTotal: { type: Number, required: true },
  total: { type: Number, required: true },
  deliveryFee: { type: Number, required: true },
});

const OrderSchema = new Schema<OrderSchemaI>(
  {
    firstName: {
      type: String,
      require: [
        true,
        "Please provide billing first name to complete this process",
      ],
    },
    lastName: {
      type: String,
      require: [
        true,
        "Please provide billing last name to complete this process",
      ],
    },
    email: {
      type: String,
      require: [true, "Please provide billing email to complete this process"],
    },
    country: {
      type: String,
      require: [true, "Please provide country to complete this process"],
    },
    state: {
      type: String,
      require: [true, "Please provide city or town to complete this process"],
    },
    cityOrTown: {
      type: String,
      require: [true, "Please provide city or town to complete this process"],
    },
    streetAddress: {
      type: String,
      require: [true, "Please provide street address to complete this process"],
    },
    phoneNumber: {
      type: String,
      require: [true, "Please provide phone number to complete this process"],
    },
    orderedItems: [
      {
        product: {
          type: Schema.Types.ObjectId,
          ref: "Product",
          required: true,
        },
        size: { type: String, required: false },
        toppings: { type: [String], required: false },
        flavour: { type: [String], required: false },
        dateNeeded: { type: String, required: false },
        details: { type: String, required: false },
        quantity: { type: Number, required: true },
      },
    ],
    fee: {
      type: FeeSchema,
      require: [
        true,
        "Please provide all the necessary fees to complete this process",
      ],
    },
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    orderStatus: {
      type: String,
      enum: ["pending", "completed", "cancelled"],
      default: "pending",
    },
    orderId: { type: String, required: true },
  },
  {
    timestamps: true,
  }
);

const Order = model<OrderSchemaI>("Orders", OrderSchema);

export default Order;
