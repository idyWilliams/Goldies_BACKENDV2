import { Router } from "express";
import { authenticateToken } from "../middleware/verifyJWT";
import { deleteBillingInfo, getUser, saveBillingInfo, updateBillingInfo, updateDefaultBillingInfo } from "../controllers/userController";
const router = Router();

router.get("/get_user", authenticateToken, getUser);
router.post("/save_billing_details", authenticateToken, saveBillingInfo);
router.put("/update_billing_info/:billingId", authenticateToken, updateBillingInfo);
router.patch("/update_default_billing_info/:billingId", authenticateToken, updateDefaultBillingInfo);
router.delete("/delete_billing_info/:billingId", authenticateToken, deleteBillingInfo);

export default router;

// eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY2YWE1ZGI2ZGQ1MjA5NDM4MzE3YmUzNiIsImlhdCI6MTcyNDg1MzQwOSwiZXhwIjoxNzI0ODYwNjA5fQ.xaipU658Q53i5b6eg-ds1BHxRkOoABx3o2dHXxWjVg0
