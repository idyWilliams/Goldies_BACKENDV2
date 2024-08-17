import express from "express";
const router = express.Router();
import {
  inviteAdmin,
  adminSignup,
  verifyOTP,
} from "../controllers/adminController";

router.post("/invite_admin", inviteAdmin);
router.post("/admin_auth", adminSignup);
router.post("/verify_otp", verifyOTP);

export default router;
