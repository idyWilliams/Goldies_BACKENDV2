import express from "express";
import { authenticateToken } from "../middleware/verifyJWT";
import { PaymentController } from "../controllers/paystackController";
const router = express.Router();

router.post("/initialize_payment", authenticateToken, PaymentController.initializePayment);
router.post("/verify_payment/:reference", authenticateToken, PaymentController.verifyPayment);

export default router;
