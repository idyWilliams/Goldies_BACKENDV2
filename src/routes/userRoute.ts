import { Router } from "express";
import { authenticateToken } from "../middleware/verifyJWT";
import { getUser, saveBillingInfo } from "../controllers/userController";
const router = Router();

router.get("/get_user", authenticateToken, getUser);
router.post("/save_billing_details", authenticateToken, saveBillingInfo);
export default router;
