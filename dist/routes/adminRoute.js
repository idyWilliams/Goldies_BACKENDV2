"use strict";
//
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const adminController_1 = require("../controllers/adminController");
const auth_middleware_1 = require("../middleware/auth.middleware");
const router = express_1.default.Router();
// const logRouteInfo = (req: Request, res: Response, next: NextFunction) => {
//   console.log(`Incoming ${req.method} request to ${req.path}`);
//   console.log("Request Params:", req.params);
//   console.log("Request Body:", req.body);
//   next();
// };
// router.use(logRouteInfo);
// Public routes
router.post("/login", adminController_1.adminLogin);
router.post("/signup", adminController_1.adminSignup);
router.post("/verify", adminController_1.verifyOTP);
router.post("/forgot-password", adminController_1.forgotPassword);
router.post("/reset-password", adminController_1.resetPassword);
// Protected routes
router.post("/invite", auth_middleware_1.protect, (0, auth_middleware_1.authorize)("super_admin"), adminController_1.inviteAdmin);
router.put("/profile/:id", auth_middleware_1.protect, adminController_1.updateProfile);
// Admin management routes
// router.get("/admins", isSuperAdmin, getAllAdmins);
// router.get("/admins/:id", isSuperAdmin, getAdminById);
// router.put("/admins/revoke-access/:id", isSuperAdmin, revokeAdminAccess);
// router.put("/admins/unblock-access/:id", isSuperAdmin, unblockAdminAccess);
// router.delete("/admins/:id", isSuperAdmin, deleteAdmin);
router.get("/all", auth_middleware_1.protect, auth_middleware_1.isSuperAdmin, adminController_1.getAllAdmins);
// router.get("/admins/:id", protect, isSuperAdmin, getAdminById);
router.put("/revoke-access/:id", auth_middleware_1.protect, auth_middleware_1.isSuperAdmin, adminController_1.revokeAdminAccess);
router.put("/unblock-access/:id", auth_middleware_1.protect, auth_middleware_1.isSuperAdmin, adminController_1.unblockAdminAccess);
router.put("/verify-access/:id", auth_middleware_1.protect, auth_middleware_1.isSuperAdmin, adminController_1.verifyAdmin);
router.delete("/:id", auth_middleware_1.protect, auth_middleware_1.isSuperAdmin, adminController_1.deleteAdmin);
// Generic parameter routes
router.get("/orders/:id", adminController_1.getUserOrderByUserId);
// router.get("/:id", protect, getAdmin);
exports.default = router;
