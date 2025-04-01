import express from "express";
import { Server } from "socket.io";
import { NotificationController } from "../controllers/notificationController";
import { protect, authorize } from "../middleware/auth.middleware";

export const notificationRouter = (io: Server) => {
  const router = express.Router();
  const notificationController = new NotificationController(io);

  // Protect all routes with JWT authentication
  router.use(protect);

  /**
   * @route GET /api/notifications
   * @desc Get all notifications for current admin (filtered by role)
   * @access Private (admin or super_admin)
   */
  router.get(
    "/",
    authorize("admin", "super_admin"),
    notificationController.getNotifications
  );

  /**
   * @route PATCH /api/notifications/:id/read
   * @desc Mark notification as read
   * @access Private (admin or super_admin)
   */
  router.patch(
    "/:id/read",
    authorize("admin", "super_admin"),
    notificationController.markNotificationAsRead
  );

  /**
   * @route PATCH /api/notifications/read-all
   * @desc Mark all notifications as read
   * @access Private (admin or super_admin)
   */
  router.patch(
    "/read-all",
    authorize("admin", "super_admin"),
    notificationController.markAllNotificationsAsRead
  );

  /**
   * @route POST /api/notifications
   * @desc Create a new notification
   * @access Private (admin or super_admin)
   */
  router.post(
    "/",
    authorize("admin", "super_admin"),
    notificationController.createNotification
  );

  return router;
};
