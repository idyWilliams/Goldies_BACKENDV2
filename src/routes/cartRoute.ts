import { Router } from "express";
const router = Router();

import { authenticateToken } from "../middleware/verifyJWT";
import { addToCart, clearCart, getCart, removeCartItem, updateCartItem } from "../controllers/cartController";

router.post("/add", authenticateToken, addToCart);
router.patch("/update-cart", authenticateToken, updateCartItem);
router.get("/", authenticateToken, getCart);
router.delete("/clear", authenticateToken, clearCart);
router.delete("/remove/:productId", authenticateToken, removeCartItem);




export default router;
