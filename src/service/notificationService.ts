// services/notification.service.ts
import mongoose from "mongoose";
import { CustomRequest } from "../middleware/verifyJWT";
import { NotificationController } from "../controllers/notificationController";


export class NotificationService {
  // Create a notification for a specific user
  static async createUserNotification(
    req: CustomRequest,
    userId: string,
    message: string,
    title: string,
    type: "user" | "order" | "system" | "product" | "promotion" = "user",
    priority: "high" | "medium" | "low" = "medium",
    relatedEntityId?: string
  ) {
    try {
      const notificationData = {
        userId,
        message,
        title,
        type,
        priority,
        relatedEntityId,
      };

      return await NotificationController.createNotification(
        req,
        notificationData
      );
    } catch (error) {
      console.error("Failed to create user notification:", error);
      throw new Error("Failed to create user notification");
    }
  }

  // Create a notification for all admins
  static async createAdminNotification(
    req: CustomRequest,
    message: string,
    title: string,
    type: "system" | "order" | "product" | "promotion" = "system",
    priority: "high" | "medium" | "low" = "medium",
    relatedEntityId?: string
  ) {
    try {
      // Find all admin users
      const admins = await mongoose
        .model("User")
        .find({
          role: "admin",
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
          type,
          priority,
          relatedEntityId,
        };

        const notification = await NotificationController.createNotification(
          req,
          notificationData
        );
        notifications.push(notification);
      }

      return notifications;
    } catch (error) {
      console.error("Failed to create admin notification:", error);
      throw new Error("Failed to create admin notification");
    }
  }

  // Create a notification for super admins only
  static async createSuperAdminNotification(
    req: CustomRequest,
    message: string,
    title: string,
    type: "system" | "order" | "product" | "promotion" = "system",
    priority: "high" | "medium" | "low" = "high",
    relatedEntityId?: string
  ) {
    try {
      // Find all super admin users
      const superAdmins = await mongoose
        .model("User")
        .find({
          role: "super_admin",
          isVerified: true,
          isDeleted: false,
          isBlocked: false,
        })
        .select("_id");

      const notifications = [];

      // Create notification for each super admin
      for (const admin of superAdmins) {
        const notificationData = {
          userId: admin._id.toString(),
          message,
          title,
          type,
          priority,
          relatedEntityId,
        };

        const notification = await NotificationController.createNotification(
          req,
          notificationData
        );
        notifications.push(notification);
      }

      return notifications;
    } catch (error) {
      console.error("Failed to create super admin notification:", error);
      throw new Error("Failed to create super admin notification");
    }
  }

  // Create a notification for all staff (admins + super admins)
  static async createStaffNotification(
    req: CustomRequest,
    message: string,
    title: string,
    type: "system" | "order" | "product" | "promotion" = "system",
    priority: "high" | "medium" | "low" = "medium",
    relatedEntityId?: string
  ) {
    try {
      return await NotificationController.createSystemNotification(
        req,
        message,
        title,
        priority
      );
    } catch (error) {
      console.error("Failed to create staff notification:", error);
      throw new Error("Failed to create staff notification");
    }
  }
}

export default NotificationService;
