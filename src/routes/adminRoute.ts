//

import express from "express";
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

// Protected routes
router.post("/invite", protect, authorize("super_admin"), inviteAdmin);
router.put("/profile/:id", protect, updateProfile);

// Admin management routes
// router.get("/admins", isSuperAdmin, getAllAdmins);
// router.get("/admins/:id", isSuperAdmin, getAdminById);
// router.put("/admins/revoke-access/:id", isSuperAdmin, revokeAdminAccess);
// router.put("/admins/unblock-access/:id", isSuperAdmin, unblockAdminAccess);
// router.delete("/admins/:id", isSuperAdmin, deleteAdmin);
router.get("/admins", protect, isSuperAdmin, getAllAdmins);
router.get("/admins/:id", protect, isSuperAdmin, getAdminById);
router.put(
  "/admins/revoke-access/:id",
  protect,
  isSuperAdmin,
  revokeAdminAccess
);
router.put(
  "/admins/unblock-access/:id",
  protect,
  isSuperAdmin,
  unblockAdminAccess
);
router.delete("/admins/:id", protect, isSuperAdmin, deleteAdmin);

// Generic parameter routes
router.get("/orders/:id", getUserOrderByUserId);
router.get("/:id", protect, getAdmin);

export default router;