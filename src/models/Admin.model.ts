import mongoose, { Schema, Document } from "mongoose";
// interface AdminSchemaI extends Document {
//   userName: string;
//   email: string
//   password: string
//   OTP: string
// }


// const AdminSchema = new Schema<AdminSchemaI>(
//   {
//     userName: { type: String, required: true, unique: true },
//     email: { type: String, required: true, unique: true },
//     password: { type: String, required: true },
//     OTP: String,
//   },
//   {
//     timestamps: true,
//   }
// );

// const Admin = mongoose.model<AdminSchemaI>("Admin", AdminSchema);

// export default Admin;



const adminSchema = new mongoose.Schema({
  userName: {
    type: String,
    required: [true, "Username is required"],
    unique: true,
    trim: true
  },
  email: {
    type: String,
    required: [true, "Email is required"],
    unique: true,
    trim: true,
    lowercase: true
  },
  password: {
    type: String,
    required: [true, "Password is required"]
  },
  OTP: {
    type: String,
    required: false
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  lastRefCode: {
    type: String,
    required: false
  },
  role: {
    type: String,
    enum: ['super-admin', 'admin'],
    default: 'admin'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

export default mongoose.model("Admin", adminSchema);