"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationService = void 0;
const notificationModel_1 = __importDefault(require("../models/notificationModel"));
const Admin_model_1 = __importDefault(require("../models/Admin.model"));
class NotificationService {
    io;
    constructor(io) {
        this.io = io;
    }
    // Create and send notifications
    async createNotification({ title, message, type, visibility = "all", recipientId, relatedId, }) {
        const notifications = [];
        if (recipientId) {
            // Send to specific recipient
            const notification = await notificationModel_1.default.create({
                recipient: recipientId,
                title,
                message,
                type,
                relatedId,
                visibility,
            });
            this.io.to(recipientId).emit("new-notification", notification);
            notifications.push(notification);
        }
        else {
            // Broadcast based on visibility
            let query = { isBlocked: false, isDeleted: false };
            if (visibility === "admin") {
                query.role = "admin";
            }
            else if (visibility === "super_admin") {
                query.role = "super_admin";
            }
            else {
                query.$or = [{ role: "admin" }, { role: "super_admin" }];
            }
            const recipients = await Admin_model_1.default.find(query).select("_id");
            for (const admin of recipients) {
                const notification = await notificationModel_1.default.create({
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
    async getAdminNotifications(adminId, adminRole) {
        const query = {
            $or: [
                { recipient: adminId },
                {
                    recipient: { $exists: false },
                    $or: [{ visibility: "all" }, { visibility: adminRole }],
                },
            ],
        };
        return await notificationModel_1.default.find(query).sort({ createdAt: -1 }).exec();
    }
    // Mark single notification as read
    async markAsRead(notificationId, adminId) {
        return await notificationModel_1.default.findOneAndUpdate({
            _id: notificationId,
            $or: [{ recipient: adminId }, { recipient: { $exists: false } }],
        }, { isRead: true }, { new: true });
    }
    // Mark all notifications as read for admin
    async markAllAsRead(adminId, adminRole) {
        await notificationModel_1.default.updateMany({
            $or: [
                { recipient: adminId, isRead: false },
                {
                    recipient: { $exists: false },
                    isRead: false,
                    $or: [{ visibility: "all" }, { visibility: adminRole }],
                },
            ],
        }, { isRead: true }).exec();
    }
}
exports.NotificationService = NotificationService;
//# sourceMappingURL=notificationService.js.map