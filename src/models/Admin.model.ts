


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
      status: {
        type: String,
        enum: ["created", "verified", "blocked", "unblocked", "deleted"],
        required: true,
      },
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

// Pre-save middleware to ensure initial status is added
adminSchema.pre("save", function (next) {
  // If this is a new document (being created for the first time)
  if (this.isNew && this.statusChanges.length === 0) {
    this.statusChanges.push({
      status: "created",
      timestamp: new Date(),
      reason: "Admin account created",
    });
  }
  next();
});

// Create an index on isDeleted and createdAt to optimize queries
adminSchema.index({ isDeleted: 1, createdAt: -1 });
// Create an index on email for faster lookups
adminSchema.index({ email: 1 });
// Create a compound index on common query patterns
adminSchema.index({ isBlocked: 1, role: 1 });

export default mongoose.model("Admin", adminSchema);


// models/adminModel.ts
// import mongoose, { Schema, Document } from "mongoose";

// // Define the interface for Admin document
// export interface IAdmin extends Document {
//   userName: string;
//   email: string;
//   password: string;
//   OTP?: string;
//   isVerified: boolean;
//   lastRefCode?: string;
//   isBlocked: boolean;
//   isDeleted: boolean;
//   statusChanges: {
//     status: "created" | "verified" | "blocked" | "unblocked" | "deleted";
//     timestamp: Date;
//     adminId?: mongoose.Schema.Types.ObjectId;
//     reason?: string;
//   }[];
//   role: "super_admin" | "admin";
//   createdAt: Date;
//   _id: mongoose.Schema.Types.ObjectId;
// }

// const adminSchema = new Schema<IAdmin>({
//   userName: {
//     type: String,
//     required: [true, "Username is required"],
//     unique: true,
//     trim: true,
//   },
//   email: {
//     type: String,
//     required: [true, "Email is required"],
//     unique: true,
//     trim: true,
//     lowercase: true,
//   },
//   password: {
//     type: String,
//     required: [true, "Password is required"],
//   },
//   OTP: {
//     type: String,
//     required: false,
//   },
//   isVerified: {
//     type: Boolean,
//     default: false,
//   },
//   lastRefCode: {
//     type: String,
//     required: false,
//   },
//   isBlocked: { type: Boolean, default: false },
//   isDeleted: { type: Boolean, default: false },
//   statusChanges: [
//     {
//       status: {
//         type: String,
//         enum: ["created", "verified", "blocked", "unblocked", "deleted"],
//         required: true,
//       },
//       timestamp: { type: Date, default: Date.now },
//       adminId: { type: mongoose.Schema.Types.ObjectId, ref: "Admin" },
//       reason: String,
//     },
//   ],
//   role: {
//     type: String,
//     enum: ["super_admin", "admin"],
//     default: "admin",
//   },
//   createdAt: {
//     type: Date,
//     default: Date.now,
//   },
// });

// // Pre-save middleware to ensure initial status is added
// adminSchema.pre("save", function (next) {
//   if (this.isNew && this.statusChanges.length === 0) {
//     this.statusChanges.push({
//       status: "created",
//       timestamp: new Date(),
//       reason: "Admin account created",
//     });
//   }
//   next();
// });

// // Indexes
// adminSchema.index({ isDeleted: 1, createdAt: -1 });
// adminSchema.index({ email: 1 });
// adminSchema.index({ isBlocked: 1, role: 1 });

// const Admin = mongoose.model<IAdmin>("Admin", adminSchema);
// export default Admin;