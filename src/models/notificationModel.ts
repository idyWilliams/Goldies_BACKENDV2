// models/notificationModel.ts
import mongoose, { Document, Schema } from "mongoose";

export interface INotification extends Document {
  recipient: mongoose.Schema.Types.ObjectId; // Admin or super_admin ID
  title: string;
  message: string;
  type: "order" | "user" | "product" | "system" | "payment";
  relatedId?: mongoose.Schema.Types.ObjectId; // ID of related entity (order, user, etc.)
  isRead: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const notificationSchema = new Schema<INotification>(
  {
    recipient: { type: Schema.Types.ObjectId, required: true, ref: "Admin" },
    title: { type: String, required: true },
    message: { type: String, required: true },
    type: {
      type: String,
      required: true,
      enum: ["order", "user", "product", "system", "payment"],
    },
    relatedId: { type: Schema.Types.ObjectId },
    isRead: { type: Boolean, default: false },
  },
  { timestamps: true }
);

const Notification = mongoose.model<INotification>(
  "Notification",
  notificationSchema
);
export default Notification;
