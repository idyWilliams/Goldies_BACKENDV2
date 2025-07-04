"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const orderController_1 = require("../controllers/orderController");
const router = (0, express_1.Router)();
const verifyJWT_1 = require("../middleware/verifyJWT");
router.post("/create_order", verifyJWT_1.authenticateToken, orderController_1.createOrder);
router.get("/get_all_order", verifyJWT_1.authenticateToken, orderController_1.getAllOrders);
router.patch("/update_order_status/:orderId", verifyJWT_1.authenticateToken, orderController_1.updateOrderStatus);
router.delete("/delete_order/:orderId", verifyJWT_1.authenticateToken, orderController_1.deleteOrder);
router.get("/get_order/:orderId", verifyJWT_1.authenticateToken, orderController_1.getOrder);
router.get("/get_specific_user_order", verifyJWT_1.authenticateToken, orderController_1.getSpecificUserOrder);
exports.default = router;
//# sourceMappingURL=orderRoute.js.map