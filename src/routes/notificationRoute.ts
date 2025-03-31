// routes/notificationRoute.ts
import express from "express";
import { Server } from "socket.io";
import { NotificationController } from "../controllers/notificationController";
import {
  protect,
  authorize,
  isSuperAdmin,
  isAdmin,
} from "../middleware/auth.middleware";
import { authenticateToken } from "../middleware/verifyJWT";

export const notificationRouter = (io: Server) => {
  const router = express.Router();
  const notificationController = new NotificationController(io);

  // Apply authentication middleware to all routes
  router.use(authenticateToken); // From verifyJWT
  router.use(isAdmin); // Ensures user is admin or super_admin

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
  router.post(
    "/admin-alert",
    isSuperAdmin, // Additional super_admin check
    notificationController.createAdminAlert
  );

  return router;
};
