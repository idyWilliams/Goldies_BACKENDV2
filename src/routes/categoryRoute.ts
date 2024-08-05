import { Router } from "express";
const router = Router();
import { createCategory } from "../controllers/categoryController";
import { authenticateToken } from "../middleware/verifyJWT";

router.post("/create_category", authenticateToken, createCategory);

export default router;
