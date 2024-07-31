import { Router } from "express";
import { authenticateToken } from "../middleware/verifyJWT";
import getUser from "../controllers/userController";
const router = Router();

router.get("/get_user", authenticateToken, getUser);
export default router;
