// controllers/notificationController.ts
import { Request, Response, NextFunction } from "express";

import { Server } from "socket.io";
import { AuthRequest } from "../middleware/auth.middleware"; // Import your custom request type
import { NotificationService } from "../service/notificationService";

export class NotificationController {
  private notificationService: NotificationService;

  constructor(io: Server) {
    this.notificationService = new NotificationService(io);
  }

  // Get all notifications for the current admin
  public getNotifications = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ) => {
    try {
      if (!req.admin) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const notifications =
        await this.notificationService.getAdminNotifications(
          req.admin._id,
          req.admin.role
        );
      res.status(200).json(notifications);
    } catch (error) {
      next(error);
    }
  };

  // Mark a notification as read
  public markNotificationAsRead = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ) => {
    try {
      if (!req.admin) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const notification = await this.notificationService.markAsRead(
        req.params.id,
        req.admin._id
      );

      if (!notification) {
        return res.status(404).json({ message: "Notification not found" });
      }

      res.status(200).json(notification);
    } catch (error) {
      next(error);
    }
  };

  // Mark all notifications as read
  public markAllNotificationsAsRead = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ) => {
    try {
      if (!req.admin) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      await this.notificationService.markAllAsRead(req.admin._id);
      res.status(200).json({ message: "All notifications marked as read" });
    } catch (error) {
      next(error);
    }
  };

  // Create an admin alert (super_admin only)
  public createAdminAlert = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ) => {
    try {
      if (!req.admin) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const { title, message, recipientId } = req.body;

      const notification = await this.notificationService.createNotification({
        title,
        message,
        type: "system",
        visibility: recipientId ? "all" : "super_admin",
        recipientId,
      });

      res.status(201).json(notification);
    } catch (error) {
      next(error);
    }
  };
}
