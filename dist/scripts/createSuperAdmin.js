"use strict";
// scripts/createSuperAdmin.ts
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const Admin_model_1 = __importDefault(require("../models/Admin.model"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const createSuperAdmin = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield mongoose_1.default.connect(process.env.MONGODB_URI);
        const superAdminData = {
            userName: "superadmin",
            email: "superadmin@example.com",
            password: yield bcryptjs_1.default.hash("superadmin123", 10),
            isVerified: true,

            role: "super_admin",

        };
        const existingAdmin = yield Admin_model_1.default.findOne({ email: superAdminData.email });
        if (!existingAdmin) {
            const superAdmin = yield Admin_model_1.default.create(superAdminData);
            console.log("Super admin created:", superAdmin);
        }
        else {
            console.log("Super admin already exists");
        }
        mongoose_1.default.connection.close();
    }
    catch (error) {
        console.error("Error creating super admin:", error);
    }
});
createSuperAdmin();
//run this script to create a super admin
// ts-node scripts/createSuperAdmin.ts
