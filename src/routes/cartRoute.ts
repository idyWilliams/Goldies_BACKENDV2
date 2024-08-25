import { Router } from "express";
const router = Router();

import { authenticateToken } from "../middleware/verifyJWT";
import { addToCart, deleteCart } from "../controllers/cartController";

router.post("/add_to_cart", authenticateToken, addToCart);
router.delete(
  "/delete_cart/:cartId",
  authenticateToken,
  deleteCart
);

export default router;
