// routes/notification.routes.ts
import express from "express";
import { authenticateToken } from "../middleware/verifyJWT";
import NotificationController from "../controllers/notificationController";
import { isAdmin, isSuperAdmin } from "../middleware/auth.middleware";


const router = express.Router();

// User routes
router.get(
  "/user",
  authenticateToken,
  NotificationController.getUserNotifications
);
router.post("/mark-read", authenticateToken, NotificationController.markAsRead);
router.post(
  "/mark-all-read",
  authenticateToken,
  NotificationController.markAllAsRead
);

// Admin routes
router.get(
  "/admin",
  authenticateToken,
  isAdmin,
  NotificationController.getAdminNotifications
);
router.patch(
  "/archive/:id",
  authenticateToken,
  isAdmin,
  NotificationController.archiveNotification
);
router.post(
  "/archive-multiple",
  authenticateToken,
  isAdmin,
  NotificationController.archiveMultipleNotifications
);

// Super Admin routes
router.get(
  "/all",
  authenticateToken,
  isSuperAdmin,
  NotificationController.getAllNotifications
);

export default router;
