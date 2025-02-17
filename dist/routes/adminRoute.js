"use strict";
// import express from "express";
// const router = express.Router();
// import {
//   inviteAdmin,
//   adminSignup,
//   verifyOTP,
// } from "../controllers/adminController";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// router.post("/invite_admin", inviteAdmin);
// router.post("/admin_auth", adminSignup);
// router.post("/verify_otp", verifyOTP);
// export default router;
// routes/admin.routes.ts
const express_1 = __importDefault(require("express"));
const adminController_1 = require("../controllers/adminController");
const auth_middleware_1 = require("../middleware/auth.middleware");
const router = express_1.default.Router();
// Public routes
router.post('/login', adminController_1.adminLogin);
router.post('/signup', adminController_1.adminSignup);
router.post('/verify', adminController_1.verifyOTP);
router.post('/forgot-password', adminController_1.forgotPassword);
router.post('/reset-password', adminController_1.resetPassword);
// Protected routes
router.post('/invite', auth_middleware_1.protect, (0, auth_middleware_1.authorize)('super_admin'), adminController_1.inviteAdmin);
router.put('/profile/:id', auth_middleware_1.protect, adminController_1.updateProfile);
router.get('/:id', auth_middleware_1.protect, adminController_1.getAdmin);
exports.default = router;
