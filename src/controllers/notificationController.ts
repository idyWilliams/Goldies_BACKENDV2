import { Request, Response, NextFunction } from "express";

import { Server } from "socket.io";
import Notification from "../models/notificationModel";
import { NotificationService } from "../service/notificationService";

export class NotificationController {
  private notificationService: NotificationService;

  constructor(io: Server) {
    this.notificationService = new NotificationService(io);
  }

  // Get all notifications for current admin
  public getNotifications = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const notifications =
        await this.notificationService.getAdminNotifications(
          req.user._id,
          req.user.role
        );
      res.status(200).json(notifications);
    } catch (error) {
      next(error);
    }
  };

  // Mark notification as read
  public markNotificationAsRead = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const notification = await this.notificationService.markAsRead(
        req.params.id,
        req.user._id
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
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      // Now passing both adminId and adminRole
      await this.notificationService.markAllAsRead(req.user._id, req.user.role);
      res.status(200).json({ message: "All notifications marked as read" });
    } catch (error) {
      next(error);
    }
  };

  // Create new notification
  public createNotification = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const { title, message, type, visibility, recipientId, relatedId } =
        req.body;

      const notifications = await this.notificationService.createNotification({
        title,
        message,
        type,
        visibility: visibility || "all",
        recipientId,
        relatedId,
      });

      res.status(201).json(notifications);
    } catch (error) {
      next(error);
    }
  };
}
