//

import express, { NextFunction } from "express";
import {
  inviteAdmin,
  adminSignup,
  verifyOTP,
  adminLogin,
  forgotPassword,
  resetPassword,
  updateProfile,
  getAdmin,
  getUserOrderByUserId,
  getAllAdmins,
  getAdminById,
  revokeAdminAccess,
  unblockAdminAccess,
  deleteAdmin,
  verifyAdmin,
  refreshAccessToken,
  adminLogout,
} from "../controllers/adminController";
import {
  protect,
  authorize,
  isSuperAdmin,
} from "../middleware/auth.middleware";

const router = express.Router();


// Public routes
router.post("/login", adminLogin);
router.post("/signup", adminSignup);
router.post("/verify", verifyOTP);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);
router.post("/refresh-token", refreshAccessToken); 
// Protected routes
router.post("/invite", protect, authorize("super_admin"), inviteAdmin);
router.put("/profile/:id", protect, updateProfile);
router.post("/logout", protect, adminLogout);

router.get("/all", protect, isSuperAdmin, getAllAdmins);
// router.get("/admins/:id", protect, isSuperAdmin, getAdminById);
router.put(
  "/revoke-access/:id",
  protect,
  isSuperAdmin,
  revokeAdminAccess
);
router.put(
  "/unblock-access/:id",
  protect,
  isSuperAdmin,
  unblockAdminAccess
);
router.put("/verify-access/:id", protect, isSuperAdmin, verifyAdmin);
router.delete("/:id", protect, isSuperAdmin, deleteAdmin);

// Generic parameter routes
router.get("/orders/:id", getUserOrderByUserId);
// router.get("/:id", protect, getAdmin);

export default router;
