// services/notificationService.ts
import { Request } from "express";
import { Server } from "socket.io";
import Notification, { INotification } from "../models/notificationModel";
import Admin from "../models/Admin.model";
// import Admin, { IAdmin } from "../models/adminModel";

export class NotificationService {
  private io: Server;

  constructor(io: Server) {
    this.io = io;
  }

  // Create and send a notification
  // async createNotification(options: {
  //   title: string;
  //   message: string;
  //   type: INotification["type"];
  //   relatedId?: string;
  //   visibility: "admin" | "super_admin" | "all";
  //   recipientId?: string; // Optional specific recipient
  // }): Promise<INotification[]> {
  //   const { title, message, type, relatedId, visibility, recipientId } =
  //     options;
  //   const notifications: INotification[] = [];

  //   if (recipientId) {
  //     // Send to specific admin
  //     const notification = await Notification.create({
  //       recipient: recipientId,
  //       title,
  //       message,
  //       type,
  //       relatedId,
  //       visibility,
  //     });

  //     this.io.to(recipientId).emit("new-notification", notification);
  //     notifications.push(notification);
  //   } else {
  //     // Broadcast to all relevant admins based on visibility
  //     let query: any = {};
  //     if (visibility === "admin") {
  //       query.role = "admin";
  //     } else if (visibility === "super_admin") {
  //       query.role = "super_admin";
  //     } else {
  //       query = { $or: [{ role: "admin" }, { role: "super_admin" }] };
  //     }

  //     const recipients = await Admin.find(query).select("_id");

  //     for (const admin of recipients) {
  //       const notification = await Notification.create({
  //         recipient: admin._id,
  //         title,
  //         message,
  //         type,
  //         relatedId,
  //         visibility,
  //       });

  //       this.io.to(admin._id.toString()).emit("new-notification", notification);
  //       notifications.push(notification);
  //     }
  //   }

  //   return notifications;
  // }
  // In notificationService.ts
  async createNotification(options: {
    title: string;
    message: string;
    type: INotification["type"];
    relatedId?: string;
    visibility: "admin" | "super_admin" | "all";
    recipientId?: string;
  }): Promise<INotification[]> {
    const { title, message, type, relatedId, visibility, recipientId } =
      options;
    const notifications: INotification[] = [];

    if (recipientId) {
      // Verify the recipient exists and is an admin
      const recipient = await Admin.findById(recipientId);
      if (!recipient || recipient.isDeleted) {
        throw new Error("Invalid recipient");
      }

      const notification = await Notification.create({
        recipient: recipientId,
        title,
        message,
        type,
        relatedId,
        visibility,
      });

      this.io.to(recipientId).emit("new-notification", notification);
      notifications.push(notification);
    } else {
      // Build the role query based on visibility
      let roleQuery: any = {};
      if (visibility === "admin") {
        roleQuery.role = "admin";
      } else if (visibility === "super_admin") {
        roleQuery.role = "super_admin";
      } else {
        roleQuery = { $or: [{ role: "admin" }, { role: "super_admin" }] };
      }

      // Find active admins (not deleted)
      const recipients = await Admin.find({
        ...roleQuery,
        isDeleted: false,
      }).select("_id role");

      for (const admin of recipients) {
        const notification = await Notification.create({
          recipient: admin._id,
          title,
          message,
          type,
          relatedId,
          visibility,
        });

        this.io.to(admin._id.toString()).emit("new-notification", notification);
        notifications.push(notification);
      }
    }

    return notifications;
  }
  // Get filtered notifications for the current admin based on role
  async getAdminNotifications(
    adminId: string,
    adminRole: string
  ): Promise<INotification[]> {
    const query: any = {
      $or: [
        { recipient: adminId },
        // Include broadcast notifications that match the admin's role
        {
          recipient: { $exists: false },
          $or: [{ visibility: "all" }, { visibility: adminRole }],
        },
      ],
    };

    return await Notification.find(query).sort({ createdAt: -1 }).exec();
  }

  // Mark notification as read
  async markAsRead(
    notificationId: string,
    adminId: string
  ): Promise<INotification | null> {
    return await Notification.findOneAndUpdate(
      { _id: notificationId, recipient: adminId },
      { isRead: true },
      { new: true }
    );
  }

  // Mark all notifications as read for an admin
  async markAllAsRead(adminId: string): Promise<void> {
    await Notification.updateMany(
      { recipient: adminId, isRead: false },
      { isRead: true }
    ).exec();
  }
}
