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
exports.authorize = exports.protect = void 0;
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
            // Get admin from token
            req.admin = yield Admin_model_1.default.findById(decoded.id).select("-password");
            next();
        }
        catch (error) {
            console.error("Auth middleware error:", error);
            res.status(401).json({
                error: true,
                message: "Not authorized",
            });
        }
    }
    if (!token) {
        res.status(401).json({
            error: true,
            message: "Not authorized, no token",
        });
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
                message: "Not authorized for this action",
            });
        }
        next();
    };
};
exports.authorize = authorize;
