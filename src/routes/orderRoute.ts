import { Router } from "express";
import { createOrder, deleteOrder, getAllOrders, getOrder, getSpecificUserOrder, updateOrderStatus } from "../controllers/orderController";
const router = Router();
import { authenticateToken } from "../middleware/verifyJWT";

router.post("/create_order", authenticateToken, createOrder);
router.get("/get_all_order", authenticateToken, getAllOrders);
router.patch("/update_order_status/:orderId", authenticateToken, updateOrderStatus);
router.delete("/delete_order/:orderId", authenticateToken, deleteOrder);
router.get("/get_order/:orderId", authenticateToken, getOrder);
router.get("/get_specific_user_order", authenticateToken, getSpecificUserOrder);

export default router;
