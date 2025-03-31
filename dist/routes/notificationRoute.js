"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.notificationRouter = void 0;
// routes/notificationRoute.ts
const express_1 = __importDefault(require("express"));
const notificationController_1 = require("../controllers/notificationController");
const auth_middleware_1 = require("../middleware/auth.middleware");
const verifyJWT_1 = require("../middleware/verifyJWT");
const notificationRouter = (io) => {
    const router = express_1.default.Router();
    const notificationController = new notificationController_1.NotificationController(io);
    // Apply authentication middleware to all routes
    router.use(verifyJWT_1.authenticateToken); // From verifyJWT
    router.use(auth_middleware_1.isAdmin); // Ensures user is admin or super_admin
    /**
     * @route GET /api/notifications
     * @desc Get all notifications for the current admin (filtered by role)
     * @access Private (admin or super_admin)
     */
    router.get("/", notificationController.getNotifications);
    /**
     * @route PATCH /api/notifications/:id/read
     * @desc Mark a specific notification as read
     * @access Private (admin or super_admin)
     * @note Users can only mark their own notifications as read
     */
    router.patch("/:id/read", notificationController.markNotificationAsRead);
    /**
     * @route PATCH /api/notifications/read-all
     * @desc Mark all notifications as read for the current admin
     * @access Private (admin or super_admin)
     */
    router.patch("/read-all", notificationController.markAllNotificationsAsRead);
    /**
     * @route POST /api/notifications/admin-alert
     * @desc Create an admin alert (super_admin only)
     * @access Private (super_admin only)
     */
    router.post("/admin-alert", auth_middleware_1.isSuperAdmin, // Additional super_admin check
    notificationController.createAdminAlert);
    return router;
};
exports.notificationRouter = notificationRouter;
