"use strict";
// middleware/auth.middleware.ts
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
exports.isAdmin = exports.getAdminIdentifier = exports.isSuperAdmin = exports.authorize = exports.protect = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const Admin_model_1 = __importDefault(require("../models/Admin.model"));
const protect = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    let token;
    if (req.headers.authorization &&
        req.headers.authorization.startsWith("Bearer")) {
        try {
            // Get token from header
            token = req.headers.authorization.split(" ")[1];
            // Verify token
            const decoded = jsonwebtoken_1.default.verify(token, process.env.ACCESS_SECRET_TOKEN);
            // Get admin from token - include userName for status changes
            const admin = yield Admin_model_1.default.findById(decoded.id).select("-password");
            if (!admin) {
                return res.status(401).json({
                    error: true,
                    message: "Admin account not found",
                });
            }
            if (admin.isBlocked) {
                return res.status(403).json({
                    error: true,
                    message: "Your account has been blocked. Please contact a super admin.",
                });
            }
            if (admin.isDeleted) {
                return res.status(401).json({
                    error: true,
                    message: "This account has been deleted.",
                });
            }
            // Add admin to request object with properly typed structure
            req.admin = {
                _id: admin._id.toString(),
                id: admin._id.toString(), // Include both for compatibility
                userName: admin.userName,
                email: admin.email,
                role: admin.role,
                isBlocked: admin.isBlocked,
                isDeleted: admin.isDeleted,
                isVerified: admin.isVerified,
            };
            next();
        }
        catch (error) {
            console.error("Auth middleware error:", error);
            res.status(401).json({
                error: true,
                message: "Not authorized, token invalid",
            });
            return; // Add return to prevent further execution
        }
    }
    if (!token) {
        res.status(401).json({
            error: true,
            message: "Not authorized, no token",
        });
        return; // Add return to prevent further execution
    }
});
exports.protect = protect;
const authorize = (...roles) => {
    return (req, res, next) => {
        if (!req.admin) {
            return res.status(401).json({
                error: true,
                message: "Not authorized",
            });
        }
        if (!roles.includes(req.admin.role)) {
            return res.status(403).json({
                error: true,
                message: `Not authorized for this action. Required role: ${roles.join(" or ")}`,
            });
        }
        next();
    };
};
exports.authorize = authorize;
const isSuperAdmin = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    // Check if admin exists in request (protect middleware should be called first)
    if (!req.admin || (!req.admin.id && !req.admin._id)) {
        return res.status(401).json({
            error: true,
            message: "Authentication required. Please log in.",
        });
    }
    const adminId = req.admin.id || req.admin._id;
    try {
        const admin = yield Admin_model_1.default.findById(adminId);
        if (!admin) {
            return res.status(401).json({
                error: true,
                message: "Admin account not found",
            });
        }
        if (admin.role !== "super_admin") {
            return res.status(403).json({
                error: true,
                message: "Access denied. Only super admins can perform this action.",
            });
        }
        next();
    }
    catch (error) {
        return res.status(500).json({
            error: true,
            message: "Internal server error",
        });
    }
});
exports.isSuperAdmin = isSuperAdmin;
// Helper function to get admin name for status changes
const getAdminIdentifier = (req) => {
    if (!req.admin) {
        return { id: "system", name: "System" };
    }
    return {
        id: req.admin._id || req.admin.id || "unknown",
        name: req.admin.userName || "Unknown Admin",
    };
};
exports.getAdminIdentifier = getAdminIdentifier;
const isAdmin = (req, res, next) => {
    if (!req.user) {
        return res.status(401).json({
            error: true,
            message: "Authentication required. Please log in.",
        });
    }
    if (!["admin", "super_admin"].includes(req.user.role)) {
        return res.status(403).json({
            error: true,
            message: "Access denied. Only admins can perform this action.",
        });
    }
    next();
};
exports.isAdmin = isAdmin;
