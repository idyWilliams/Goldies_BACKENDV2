"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const verifyJWT_1 = require("../middleware/verifyJWT");
const userController_1 = require("../controllers/userController");
const router = (0, express_1.Router)();
router.get("/get_user", verifyJWT_1.authenticateToken, userController_1.getUser);
router.get("/get_all_users", verifyJWT_1.authenticateToken, userController_1.getAllUSers);
router.post("/save_billing_details", verifyJWT_1.authenticateToken, userController_1.saveBillingInfo);
router.patch("/update_billing_info/:billingId", verifyJWT_1.authenticateToken, userController_1.updateBillingInfo);
router.patch("/update_default_billing_info/:billingId", verifyJWT_1.authenticateToken, userController_1.updateDefaultBillingInfo);
router.delete("/delete_billing_info/:billingId", verifyJWT_1.authenticateToken, userController_1.deleteBillingInfo);
router.get("/billing_info", verifyJWT_1.authenticateToken, userController_1.getBillingInfo);
router.patch("/profile", verifyJWT_1.authenticateToken, userController_1.updateProfile);
router.delete("/my_account", verifyJWT_1.authenticateToken, userController_1.deleteAccount);
router.get("/:userId", verifyJWT_1.authenticateToken, userController_1.getUserById);
exports.default = router;
//# sourceMappingURL=userRoute.js.map