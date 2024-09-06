"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const verifyJWT_1 = require("../middleware/verifyJWT");
const userController_1 = require("../controllers/userController");
const router = (0, express_1.Router)();
router.get("/get_user", verifyJWT_1.authenticateToken, userController_1.getUser);
router.get("/get_all_users", verifyJWT_1.authenticateToken, userController_1.getAllUSers);
router.post("/save_billing_details", verifyJWT_1.authenticateToken, userController_1.saveBillingInfo);
router.put("/update_billing_info/:billingId", verifyJWT_1.authenticateToken, userController_1.updateBillingInfo);
router.patch("/update_default_billing_info/:billingId", verifyJWT_1.authenticateToken, userController_1.updateDefaultBillingInfo);
router.delete("/delete_billing_info/:billingId", verifyJWT_1.authenticateToken, userController_1.deleteBillingInfo);
exports.default = router;
// eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY2YWE1ZGI2ZGQ1MjA5NDM4MzE3YmUzNiIsImlhdCI6MTcyNDg1MzQwOSwiZXhwIjoxNzI0ODYwNjA5fQ.xaipU658Q53i5b6eg-ds1BHxRkOoABx3o2dHXxWjVg0
