"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const router = (0, express_1.Router)();
const verifyJWT_1 = require("../middleware/verifyJWT");
const cartController_1 = require("../controllers/cartController");
router.post("/add", verifyJWT_1.authenticateToken, cartController_1.addToCart);
router.patch("/update-cart", verifyJWT_1.authenticateToken, cartController_1.updateCartItem);
router.get("/", verifyJWT_1.authenticateToken, cartController_1.getCart);
router.delete("/clear", verifyJWT_1.authenticateToken, cartController_1.clearCart);
router.delete("/remove/:productId", verifyJWT_1.authenticateToken, cartController_1.removeCartItem);
exports.default = router;
