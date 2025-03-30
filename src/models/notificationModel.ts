
import mongoose, { Schema, Document } from "mongoose";

export interface INotification extends Document {
  userId: mongoose.Types.ObjectId;
  message: string;
  title: string;
  type: "order" | "user" | "system" | "product" | "promotion";
  read: boolean;
  archived: boolean;
  relatedEntityId?: string;
  priority: "high" | "medium" | "low";
  createdAt: Date;
  updatedAt: Date;
}

const NotificationSchema: Schema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      enum: ["order", "user", "system", "product", "promotion"],
      default: "system",
    },
    read: {
      type: Boolean,
      default: false,
    },
    archived: {
      type: Boolean,
      default: false,
    },
    relatedEntityId: {
      type: String,
      default: null,
    },
    priority: {
      type: String,
      enum: ["high", "medium", "low"],
      default: "medium",
    },
  },
  { timestamps: true }
);

const Notification = mongoose.model<INotification>(
  "Notification",
  NotificationSchema
);

export default Notification;
