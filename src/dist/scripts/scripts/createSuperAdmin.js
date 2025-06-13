"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
// src/scripts/createSuperAdmin.ts
var mongoose_1 = require("mongoose");
var Admin_model_1 = require("../models/Admin.model");
var bcryptjs = require("bcryptjs");
var dotenv = require("dotenv");
dotenv.config();
var createSuperAdmin = function () { return __awaiter(void 0, void 0, void 0, function () {
    var superAdminData, existingAdmin, superAdmin, error_1;
    var _a;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                _b.trys.push([0, 7, 8, 10]);
                // Check if MONGO_URI exists
                if (!process.env.MONGO_URI) {
                    throw new Error("MONGO_URI environment variable is not defined");
                }
                console.log("Connecting to MongoDB...");
                return [4 /*yield*/, mongoose_1.default.connect(process.env.MONGO_URI)];
            case 1:
                _b.sent();
                console.log("✅ Connected to MongoDB");
                _a = {
                    userName: "superadmin",
                    email: "widorenyin0@gmail.com"
                };
                return [4 /*yield*/, bcryptjs.hash("Password", 10)];
            case 2:
                superAdminData = (_a.password = _b.sent(),
                    _a.isVerified = true,
                    _a.role = "super_admin",
                    _a);
                console.log("Checking if super admin already exists...");
                return [4 /*yield*/, Admin_model_1.default.findOne({ email: superAdminData.email })];
            case 3:
                existingAdmin = _b.sent();
                if (!!existingAdmin) return [3 /*break*/, 5];
                console.log("Creating super admin...");
                return [4 /*yield*/, Admin_model_1.default.create(superAdminData)];
            case 4:
                superAdmin = _b.sent();
                console.log("✅ Super admin created successfully:", {
                    id: superAdmin._id,
                    userName: superAdmin.userName,
                    email: superAdmin.email,
                    role: superAdmin.role,
                });
                return [3 /*break*/, 6];
            case 5:
                console.log("⚠️ Super admin already exists:", {
                    id: existingAdmin._id,
                    userName: existingAdmin.userName,
                    email: existingAdmin.email,
                    role: existingAdmin.role,
                });
                _b.label = 6;
            case 6: return [3 /*break*/, 10];
            case 7:
                error_1 = _b.sent();
                console.error("❌ Error creating super admin:", error_1);
                return [3 /*break*/, 10];
            case 8:
                console.log("Closing MongoDB connection...");
                return [4 /*yield*/, mongoose_1.default.connection.close()];
            case 9:
                _b.sent();
                console.log("✅ MongoDB connection closed");
                process.exit(0);
                return [7 /*endfinally*/];
            case 10: return [2 /*return*/];
        }
    });
}); };
createSuperAdmin();
//run this script to create a super admin
// ts-node scripts/createSuperAdmin.ts
