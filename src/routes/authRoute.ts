import {
  create_acct,
  login,
  forgottenPassword,
  resetPassword,
  logout
} from "../controllers/authController";
import express from "express";
import { authenticateToken } from "../middleware/verifyJWT";
const router = express.Router();

router.post("/create_acct", create_acct);
router.post("/login", login);
router.post("/forgot_password", forgottenPassword);
router.post("/reset_password", resetPassword);
router.post("/logout", logout);


export default router;
