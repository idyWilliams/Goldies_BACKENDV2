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
router.get("/:id", protect, getAdmin);
router.get("/orders/:id", getUserOrderByUserId);
// admin route

router.get("/admins", isSuperAdmin, getAllAdmins);
router.get("/admins/:id", isSuperAdmin, getAdminById);
router.put("/admins/revoke-access/:id", isSuperAdmin, revokeAdminAccess);
router.put("/admins/unblock-access/:id", isSuperAdmin, unblockAdminAccess);
router.delete("/admins/:id", isSuperAdmin, deleteAdmin);

export default router;
