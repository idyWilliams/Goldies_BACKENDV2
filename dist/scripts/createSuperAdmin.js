"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// src/scripts/createSuperAdmin.ts
const mongoose_1 = __importDefault(require("mongoose"));
const Admin_model_1 = __importDefault(require("../models/Admin.model"));
const bcryptjs = __importStar(require("bcryptjs"));
const dotenv = __importStar(require("dotenv"));
dotenv.config();
const createSuperAdmin = async () => {
    try {
        // Check if MONGO_URI exists
        if (!process.env.MONGO_URI) {
            throw new Error("MONGO_URI environment variable is not defined");
        }
        console.log("Connecting to MongoDB...");
        await mongoose_1.default.connect(process.env.MONGO_URI);
        console.log("✅ Connected to MongoDB");
        const superAdminData = {
            userName: "superadmin",
            email: "widorenyin0@gmail.com",
            password: await bcryptjs.hash("Password", 10),
            isVerified: true,
            role: "super_admin",
        };
        console.log("Checking if super admin already exists...");
        const existingAdmin = await Admin_model_1.default.findOne({ email: superAdminData.email });
        if (!existingAdmin) {
            console.log("Creating super admin...");
            const superAdmin = await Admin_model_1.default.create(superAdminData);
            console.log("✅ Super admin created successfully:", {
                id: superAdmin._id,
                userName: superAdmin.userName,
                email: superAdmin.email,
                role: superAdmin.role,
            });
        }
        else {
            console.log("⚠️ Super admin already exists:", {
                id: existingAdmin._id,
                userName: existingAdmin.userName,
                email: existingAdmin.email,
                role: existingAdmin.role,
            });
        }
    }
    catch (error) {
        console.error("❌ Error creating super admin:", error);
    }
    finally {
        console.log("Closing MongoDB connection...");
        await mongoose_1.default.connection.close();
        console.log("✅ MongoDB connection closed");
        process.exit(0);
    }
};
createSuperAdmin();
//run this script to create a super admin
// ts-node scripts/createSuperAdmin.ts
//# sourceMappingURL=createSuperAdmin.js.map