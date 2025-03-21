import mongoose, { Schema, Document } from "mongoose";

const adminSchema = new mongoose.Schema({
  userName: {
    type: String,
    required: [true, "Username is required"],
    unique: true,
    trim: true,
  },
  email: {
    type: String,
    required: [true, "Email is required"],
    unique: true,
    trim: true,
    lowercase: true,
  },
  password: {
    type: String,
    required: [true, "Password is required"],
  },
  OTP: {
    type: String,
    required: false,
  },
  isVerified: {
    type: Boolean,
    default: false,
  },
  lastRefCode: {
    type: String,
    required: false,
  },
  isBlocked: { type: Boolean, default: false },
  isDeleted: { type: Boolean, default: false },
  statusChanges: [
    {
      status: String,
      timestamp: { type: Date, default: Date.now },
      adminId: { type: mongoose.Schema.Types.ObjectId, ref: "Admin" },
      reason: String,
    },
  ],
  role: {
    type: String,
    enum: ["super_admin", "admin"],
    default: "admin",
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.model("Admin", adminSchema);
