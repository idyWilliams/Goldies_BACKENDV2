"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const adminSchema = new mongoose_1.default.Schema({
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
    refreshToken: {
        type: String,
        default: null,
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
            adminId: { type: mongoose_1.default.Schema.Types.ObjectId, ref: "Admin" },
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
exports.default = mongoose_1.default.model("Admin", adminSchema);
