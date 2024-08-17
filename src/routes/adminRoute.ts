import express from "express";
const router = express.Router();
import { inviteAdmin } from "../controllers/adminController";

router.post("invite_admin", inviteAdmin);

export default router;
