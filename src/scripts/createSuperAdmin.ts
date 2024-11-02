// scripts/createSuperAdmin.ts

import mongoose from "mongoose";
import Admin from "../models/Admin.model";
import bcryptjs from "bcryptjs";
import dotenv from "dotenv";

dotenv.config();

const createSuperAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI as string);

    const superAdminData = {
      userName: "superadmin",
      email: "superadmin@example.com",
      password: await bcryptjs.hash("superadmin123", 10),
      isVerified: true,
      role: "super_admin",
    };

    const existingAdmin = await Admin.findOne({ email: superAdminData.email });

    if (!existingAdmin) {
      const superAdmin = await Admin.create(superAdminData);
      console.log("Super admin created:", superAdmin);
    } else {
      console.log("Super admin already exists");
    }

    mongoose.connection.close();
  } catch (error) {
    console.error("Error creating super admin:", error);
  }
};

createSuperAdmin();

//run this script to create a super admin

// ts-node scripts/createSuperAdmin.ts