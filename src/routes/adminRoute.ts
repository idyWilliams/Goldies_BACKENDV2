// import express from "express";
// const router = express.Router();
// import {
//   inviteAdmin,
//   adminSignup,
//   verifyOTP,
// } from "../controllers/adminController";

// router.post("/invite_admin", inviteAdmin);
// router.post("/admin_auth", adminSignup);
// router.post("/verify_otp", verifyOTP);

// export default router;
// routes/admin.routes.ts

import express from 'express';
import {
  inviteAdmin,
  adminSignup,
  verifyOTP,
  adminLogin,
  forgotPassword,
  resetPassword,
  updateProfile,
  getAdmin,
  getUserOrderByUserId
} from "../controllers/adminController";
import { protect, authorize } from '../middleware/auth.middleware';

const router = express.Router();


// Public routes
router.post('/login', adminLogin);
router.post('/signup', adminSignup);
router.post('/verify', verifyOTP);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);

// Protected routes
router.post('/invite', protect, authorize('super_admin'), inviteAdmin);
router.put('/profile/:id', protect, updateProfile);
router.get('/:id', protect, getAdmin);
router.get('/orders/:id',getUserOrderByUserId )


export default router;