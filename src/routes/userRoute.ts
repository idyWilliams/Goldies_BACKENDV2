import { Router } from "express";
import { authenticateToken } from "../middleware/verifyJWT";
import { deleteBillingInfo, getAllUSers, getUser, saveBillingInfo, updateBillingInfo, updateDefaultBillingInfo, updateProfile } from "../controllers/userController";
const router = Router();

router.get("/get_user", authenticateToken, getUser);
router.get("/get_all_users", authenticateToken, getAllUSers);
router.post("/save_billing_details", authenticateToken, saveBillingInfo);
router.put("/update_billing_info/:billingId", authenticateToken, updateBillingInfo);
router.patch("/update_default_billing_info/:billingId", authenticateToken, updateDefaultBillingInfo);
router.delete("/delete_billing_info/:billingId", authenticateToken, deleteBillingInfo);
router.patch("/profile", authenticateToken, updateProfile);

export default router;
