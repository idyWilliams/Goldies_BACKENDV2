import { create_acct, login } from "../controllers/authController.js";
import express from "express";
const router = express.Router();

router.post("/create_acct", create_acct);
router.post("/login", login);

export default router;
