import { Router } from "express";
const router = Router();

import { authenticateToken } from "../middleware/verifyJWT";
import {
  addToCart,
  clearCart,
  getCart,
  removeCartItem,
  updateCartItem,
  mergeLocalCart,
} from "../controllers/cartController";


router.post("/merge_local_cart", authenticateToken, mergeLocalCart);
router.get("/", authenticateToken, getCart);
router.post("/add", authenticateToken, addToCart);
router.patch("/update_cart", authenticateToken, updateCartItem);
router.delete("/clear", authenticateToken, clearCart);
router.delete("/remove/:productId", authenticateToken, removeCartItem);


export default router;
