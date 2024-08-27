import { Router } from "express";
import { createOrder } from "../controllers/ordercontroller";
const router = Router();
import { authenticateToken } from "../middleware/verifyJWT";

router.post("/create_order", authenticateToken, createOrder);

export default router;
