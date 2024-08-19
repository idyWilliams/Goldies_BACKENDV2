import mongoose, { Schema, Document } from "mongoose";
interface AdminSchemaI extends Document {
  email: string
  password: string
  OTP: string
}


const AdminSchema = new Schema<AdminSchemaI>(
  {
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    OTP: String
  },
  {
    timestamps: true,
  }
);

const Admin = mongoose.model<AdminSchemaI>("Admin", AdminSchema);

export default Admin;
