// controllers/notification.controller.ts
import { Response } from "express";
import { StatusCodes } from "http-status-codes";
import mongoose from "mongoose";
import { Request } from "express";
import { Server } from "socket.io";
import { createNotificationSchema, markAsReadSchema, notificationPaginationSchema } from "../validation/notificationValidation";
import Notification from "../models/notificationModel";

export interface CustomRequest extends Request {
  id?: string;
  user?: {
    _id: string;
    id?: string;
    email: string;
    role: string;
    isAdmin: boolean;
    isBlocked?: boolean;
    isDeleted?: boolean;
    isVerified?: boolean;
  };
  io?: Server;
}

export class NotificationController {
  // User-specific notifications
  static async getUserNotifications(req: CustomRequest, res: Response) {
    try {
      const { page, limit, sortOrder, type, read, search } =
        notificationPaginationSchema.parse({
          page: req.query.page || 1,
          limit: req.query.limit || 10,
          sortOrder: req.query.sortOrder || "desc",
          type: req.query.type,
          read: req.query.read || "all",
          search: req.query.search,
        });

      const skip = (page - 1) * limit;

      // Build filter
      const filter: any = {
        userId: req.user?._id,
        archived: false,
      };

      // Add type filter if specified
      if (type) {
        filter.type = type;
      }

      // Add read filter if specified
      if (read !== "all") {
        filter.read = read === "true";
      }

      // Add search filter if specified
      if (search) {
        filter.$or = [
          { message: { $regex: search, $options: "i" } },
          { title: { $regex: search, $options: "i" } },
        ];
      }

      const [notifications, total] = await Promise.all([
        Notification.find(filter)
          .sort({ createdAt: sortOrder === "asc" ? 1 : -1 })
          .skip(skip)
          .limit(limit)
          .lean(),
        Notification.countDocuments(filter),
      ]);

      // Count unread notifications
      const unreadCount = await Notification.countDocuments({
        userId: req.user?._id,
        archived: false,
        read: false,
      });

      res.status(StatusCodes.OK).json({
        success: true,
        data: notifications,
        unreadCount,
        pagination: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit),
        },
      });
    } catch (error) {
      res.status(StatusCodes.BAD_REQUEST).json({
        success: false,
        message: "Invalid request parameters",
        error,
      });
    }
  }

  // Admin notifications - for regular admins
  static async getAdminNotifications(req: CustomRequest, res: Response) {
    try {
      const { page, limit, sortOrder, type, read, search } =
        notificationPaginationSchema.parse({
          page: req.query.page || 1,
          limit: req.query.limit || 25,
          sortOrder: req.query.sortOrder || "desc",
          type: req.query.type,
          read: req.query.read || "all",
          search: req.query.search,
        });

      const skip = (page - 1) * limit;

      // Build filter
      const filter: any = {
        userId: req.user?._id,
        archived: false,
      };

      // Add type filter if specified
      if (type) {
        filter.type = type;
      }

      // Add read filter if specified
      if (read !== "all") {
        filter.read = read === "true";
      }

      // Add search filter if specified
      if (search) {
        filter.$or = [
          { message: { $regex: search, $options: "i" } },
          { title: { $regex: search, $options: "i" } },
        ];
      }

      const [notifications, total] = await Promise.all([
        Notification.find(filter)
          .sort({ createdAt: sortOrder === "asc" ? 1 : -1 })
          .skip(skip)
          .limit(limit)
          .lean(),
        Notification.countDocuments(filter),
      ]);

      // Count unread notifications
      const unreadCount = await Notification.countDocuments({
        userId: req.user?._id,
        archived: false,
        read: false,
      });

      res.status(StatusCodes.OK).json({
        success: true,
        data: notifications,
        unreadCount,
        pagination: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit),
        },
      });
    } catch (error) {
      res.status(StatusCodes.BAD_REQUEST).json({
        success: false,
        message: "Invalid request parameters",
        error,
      });
    }
  }

  // Super-admin only: Get all system notifications
  static async getAllNotifications(req: CustomRequest, res: Response) {
    try {
      const { page, limit, sortOrder, type, read, search } =
        notificationPaginationSchema.parse({
          page: req.query.page || 1,
          limit: req.query.limit || 25,
          sortOrder: req.query.sortOrder || "desc",
          type: req.query.type,
          read: req.query.read || "all",
          search: req.query.search,
        });

      const skip = (page - 1) * limit;

      // Build filter
      const filter: any = { archived: false };

      // Add type filter if specified
      if (type) {
        filter.type = type;
      }

      // Add read filter if specified
      if (read !== "all") {
        filter.read = read === "true";
      }

      // Add search filter if specified
      if (search) {
        filter.$or = [
          { message: { $regex: search, $options: "i" } },
          { title: { $regex: search, $options: "i" } },
        ];
      }

      const [notifications, total] = await Promise.all([
        Notification.find(filter)
          .sort({ createdAt: sortOrder === "asc" ? 1 : -1 })
          .skip(skip)
          .limit(limit)
          .populate("userId", "name email")
          .lean(),
        Notification.countDocuments(filter),
      ]);

      // Count unread notifications
      const unreadCount = await Notification.countDocuments({
        archived: false,
        read: false,
      });

      // Count by category
      const typeCounts = await Notification.aggregate([
        { $match: { archived: false } },
        { $group: { _id: "$type", count: { $sum: 1 } } },
      ]);

      // Format type counts into an object
      const typeCountsObj: Record<string, number> = {};
      typeCounts.forEach((item) => {
        typeCountsObj[item._id] = item.count;
      });

      res.status(StatusCodes.OK).json({
        success: true,
        data: notifications,
        unreadCount,
        typeCounts: typeCountsObj,
        pagination: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit),
        },
      });
    } catch (error) {
      res.status(StatusCodes.BAD_REQUEST).json({
        success: false,
        message: "Invalid request parameters",
        error,
      });
    }
  }

  static async markAsRead(req: CustomRequest, res: Response) {
    try {
      const { ids } = markAsReadSchema.parse(req.body);

      // Create filter based on user role
      const filter: any = { _id: { $in: ids } };

      // If not super_admin, only allow updating own notifications
      if (req.user?.role !== "super_admin") {
        filter.userId = req.user?._id;
      }

      const result = await Notification.updateMany(filter, {
        $set: { read: true },
      });

      res.status(StatusCodes.OK).json({
        success: true,
        message: "Notifications marked as read",
        count: result.modifiedCount,
      });
    } catch (error) {
      res.status(StatusCodes.BAD_REQUEST).json({
        success: false,
        message: "Invalid notification IDs",
        error,
      });
    }
  }

  static async markAllAsRead(req: CustomRequest, res: Response) {
    try {
      // Create filter based on user role
      const filter: any = { read: false, archived: false };

      // If not super_admin, only allow updating own notifications
      if (req.user?.role !== "super_admin") {
        filter.userId = req.user?._id;
      }

      // Filter by type if provided
      if (req.query.type) {
        filter.type = req.query.type;
      }

      const result = await Notification.updateMany(filter, {
        $set: { read: true },
      });

      res.status(StatusCodes.OK).json({
        success: true,
        message: "All notifications marked as read",
        count: result.modifiedCount,
      });
    } catch (error) {
      res.status(StatusCodes.BAD_REQUEST).json({
        success: false,
        message: "Failed to mark notifications as read",
        error,
      });
    }
  }

  // Admin-only: Archive notification (soft delete)
  static async archiveNotification(req: CustomRequest, res: Response) {
    try {
      const { id } = req.params;

      // Create filter based on user role
      const filter: any = { _id: id };

      // If admin (not super_admin), only allow archiving own notifications
      if (req.user?.role === "admin") {
        filter.userId = req.user._id;
      }

      const notification = await Notification.findOneAndUpdate(
        filter,
        { $set: { archived: true } },
        { new: true }
      );

      if (!notification) {
        return res.status(StatusCodes.NOT_FOUND).json({
          success: false,
          message:
            "Notification not found or you don't have permission to archive it",
        });
      }

      res.status(StatusCodes.OK).json({
        success: true,
        message: "Notification archived",
      });
    } catch (error) {
      res.status(StatusCodes.BAD_REQUEST).json({
        success: false,
        message: "Invalid notification ID",
        error,
      });
    }
  }

  // Admin-only: Archive multiple notifications
  static async archiveMultipleNotifications(req: CustomRequest, res: Response) {
    try {
      const { ids } = markAsReadSchema.parse(req.body);

      // Create filter based on user role
      const filter: any = { _id: { $in: ids } };

      // If admin (not super_admin), only allow archiving own notifications
      if (req.user?.role === "admin") {
        filter.userId = req.user._id;
      }

      const result = await Notification.updateMany(filter, {
        $set: { archived: true },
      });

      res.status(StatusCodes.OK).json({
        success: true,
        message: "Notifications archived",
        count: result.modifiedCount,
      });
    } catch (error) {
      res.status(StatusCodes.BAD_REQUEST).json({
        success: false,
        message: "Invalid notification IDs",
        error,
      });
    }
  }

  // Notification creation (used within the application)
  static async createNotification(req: CustomRequest, data: any) {
    try {
      const validatedData = createNotificationSchema.parse(data);
      const notification = await Notification.create(validatedData);

      // Emit real-time notification using Socket.io if available
      req.io?.to(validatedData.userId).emit("new-notification", notification);

      return notification;
    } catch (error) {
      throw new Error("Failed to create notification");
    }
  }

  // Utility to create system notifications for admins
  static async createSystemNotification(
    req: CustomRequest,
    message: string,
    title: string,
    priority: "high" | "medium" | "low" = "medium"
  ) {
    try {
      // Find all admin users
      const admins = await mongoose
        .model("User")
        .find({
          role: { $in: ["admin", "super_admin"] },
          isVerified: true,
          isDeleted: false,
          isBlocked: false,
        })
        .select("_id");

      const notifications = [];

      // Create notification for each admin
      for (const admin of admins) {
        const notificationData = {
          userId: admin._id.toString(),
          message,
          title,
          type: "system",
          priority,
        };

        const notification = await Notification.create(notificationData);
        notifications.push(notification);

        // Emit real-time notification if socket.io is available
        req.io?.to(admin._id.toString()).emit("new-notification", notification);
      }

      return notifications;
    } catch (error) {
      throw new Error("Failed to create system notification");
    }
  }

  // Create order notification for admins
  static async createOrderNotification(
    req: CustomRequest,
    orderId: string,
    message: string
  ) {
    try {
      // Find all admin users
      const admins = await mongoose
        .model("User")
        .find({
          role: { $in: ["admin", "super_admin"] },
          isVerified: true,
          isDeleted: false,
          isBlocked: false,
        })
        .select("_id");

      const notifications = [];

      // Create notification for each admin
      for (const admin of admins) {
        const notificationData = {
          userId: admin._id.toString(),
          message,
          title: `New Order #${orderId.substring(0, 8)}`,
          type: "order",
          relatedEntityId: orderId,
          priority: "high",
        };

        const notification = await Notification.create(notificationData);
        notifications.push(notification);

        // Emit real-time notification if socket.io is available
        req.io?.to(admin._id.toString()).emit("new-notification", notification);
      }

      return notifications;
    } catch (error) {
      throw new Error("Failed to create order notification");
    }
  }
}

export default NotificationController;
