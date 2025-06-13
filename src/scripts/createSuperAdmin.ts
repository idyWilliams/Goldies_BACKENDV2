// src/scripts/createSuperAdmin.ts
import mongoose from "mongoose";
import Admin from "../models/Admin.model";
import * as bcryptjs from "bcryptjs";
import * as dotenv from "dotenv";

dotenv.config();

const createSuperAdmin = async () => {
  try {
    // Check if MONGO_URI exists
    if (!process.env.MONGO_URI) {
      throw new Error("MONGO_URI environment variable is not defined");
    }

    console.log("Connecting to MongoDB...");
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ Connected to MongoDB");

    const superAdminData = {
      userName: "superadmin",
      email: "widorenyin0@gmail.com",
      password: await bcryptjs.hash("Password", 10),
      isVerified: true,
      role: "super_admin",
    };

    console.log("Checking if super admin already exists...");
    const existingAdmin = await Admin.findOne({ email: superAdminData.email });

    if (!existingAdmin) {
      console.log("Creating super admin...");
      const superAdmin = await Admin.create(superAdminData);
      console.log("✅ Super admin created successfully:", {
        id: superAdmin._id,
        userName: superAdmin.userName,
        email: superAdmin.email,
        role: superAdmin.role,
      });
    } else {
      console.log("⚠️ Super admin already exists:", {
        id: existingAdmin._id,
        userName: existingAdmin.userName,
        email: existingAdmin.email,
        role: existingAdmin.role,
      });
    }
  } catch (error) {
    console.error("❌ Error creating super admin:", error);
  } finally {
    console.log("Closing MongoDB connection...");
    await mongoose.connection.close();
    console.log("✅ MongoDB connection closed");
    process.exit(0);
  }
};

createSuperAdmin();

//run this script to create a super admin

// ts-node scripts/createSuperAdmin.ts
