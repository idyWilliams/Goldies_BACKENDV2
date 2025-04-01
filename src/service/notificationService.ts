// services/notificationService.ts
import { Server } from "socket.io";
import Notification, { INotification } from "../models/notificationModel";
import AdminModel from "../models/Admin.model";

export class NotificationService {
  private io: Server;

  constructor(io: Server) {
    this.io = io;
  }

  // Create and send notifications
  async createNotification({
    title,
    message,
    type,
    visibility = "all",
    recipientId,
    relatedId,
  }: {
    title: string;
    message: string;
    type: INotification["type"];
    visibility?: "admin" | "super_admin" | "all";
    recipientId?: string;
    relatedId?: string;
  }): Promise<INotification[]> {
    const notifications: INotification[] = [];

    if (recipientId) {
      // Send to specific recipient
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
      // Broadcast based on visibility
      let query: any = { isBlocked: false, isDeleted: false };

      if (visibility === "admin") {
        query.role = "admin";
      } else if (visibility === "super_admin") {
        query.role = "super_admin";
      } else {
        query.$or = [{ role: "admin" }, { role: "super_admin" }];
      }

      const recipients = await AdminModel.find(query).select("_id");

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

  // Get notifications for admin (filtered by role)
  async getAdminNotifications(
    adminId: string,
    adminRole: string
  ): Promise<INotification[]> {
    const query: any = {
      $or: [
        { recipient: adminId },
        {
          recipient: { $exists: false },
          $or: [{ visibility: "all" }, { visibility: adminRole }],
        },
      ],
    };

    return await Notification.find(query).sort({ createdAt: -1 }).exec();
  }

  // Mark single notification as read
  async markAsRead(
    notificationId: string,
    adminId: string
  ): Promise<INotification | null> {
    return await Notification.findOneAndUpdate(
      {
        _id: notificationId,
        $or: [{ recipient: adminId }, { recipient: { $exists: false } }],
      },
      { isRead: true },
      { new: true }
    );
  }

  // Mark all notifications as read for admin
  async markAllAsRead(adminId: string, adminRole: string): Promise<void> {
    await Notification.updateMany(
      {
        $or: [
          { recipient: adminId, isRead: false },
          {
            recipient: { $exists: false },
            isRead: false,
            $or: [{ visibility: "all" }, { visibility: adminRole }],
          },
        ],
      },
      { isRead: true }
    ).exec();
  }
}
