import { Router } from "express";
import { authenticateToken } from "../middleware/verifyJWT.js";
import getUser from "../controllers/userController.js";
const router = Router();

router.get("/get_user", authenticateToken, getUser);
export default router;
