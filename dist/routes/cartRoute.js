"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const router = (0, express_1.Router)();
const verifyJWT_1 = require("../middleware/verifyJWT");
const cartController_1 = require("../controllers/cartController");
router.post("/add_to_cart", verifyJWT_1.authenticateToken, cartController_1.addToCart);
router.delete("/delete_cart/:cartId", verifyJWT_1.authenticateToken, cartController_1.deleteCart);
exports.default = router;
