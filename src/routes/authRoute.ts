import {
  create_acct,
  login,
  forgottenPassword,
} from "../controllers/authController";
import express from "express";
const router = express.Router();

router.post("/create_acct", create_acct);
router.post("/login", login);
router.post("/forgot_password", forgottenPassword);

export default router;
