"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.notificationRouter = void 0;
const express_1 = __importDefault(require("express"));
const notificationController_1 = require("../controllers/notificationController");
const auth_middleware_1 = require("../middleware/auth.middleware");
const notificationRouter = (io) => {
    const router = express_1.default.Router();
    const notificationController = new notificationController_1.NotificationController(io);
    // Protect all routes with JWT authentication
    router.use(auth_middleware_1.protect);
    /**
     * @route GET /api/notifications
     * @desc Get all notifications for current admin (filtered by role)
     * @access Private (admin or super_admin)
     */
    router.get("/", (0, auth_middleware_1.authorize)("admin", "super_admin"), notificationController.getNotifications);
    /**
     * @route PATCH /api/notifications/:id/read
     * @desc Mark notification as read
     * @access Private (admin or super_admin)
     */
    router.patch("/:id/read", (0, auth_middleware_1.authorize)("admin", "super_admin"), notificationController.markNotificationAsRead);
    /**
     * @route PATCH /api/notifications/read-all
     * @desc Mark all notifications as read
     * @access Private (admin or super_admin)
     */
    router.patch("/read-all", (0, auth_middleware_1.authorize)("admin", "super_admin"), notificationController.markAllNotificationsAsRead);
    /**
     * @route POST /api/notifications/admin-alert
     * @desc Create a new notification
     * @access Private (admin or super_admin)
     */
    router.post("/admin-alert", (0, auth_middleware_1.authorize)("admin", "super_admin"), notificationController.createNotification);
    return router;
};
exports.notificationRouter = notificationRouter;
//# sourceMappingURL=notificationRoute.js.map