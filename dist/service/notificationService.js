"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationService = void 0;
const notificationModel_1 = __importDefault(require("../models/notificationModel"));
const Admin_model_1 = __importDefault(require("../models/Admin.model"));
// import Admin, { IAdmin } from "../models/adminModel";
class NotificationService {
    constructor(io) {
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
    createNotification(options) {
        return __awaiter(this, void 0, void 0, function* () {
            const { title, message, type, relatedId, visibility, recipientId } = options;
            const notifications = [];
            if (recipientId) {
                // Verify the recipient exists and is an admin
                const recipient = yield Admin_model_1.default.findById(recipientId);
                if (!recipient || recipient.isDeleted) {
                    throw new Error("Invalid recipient");
                }
                const notification = yield notificationModel_1.default.create({
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
                // Build the role query based on visibility
                let roleQuery = {};
                if (visibility === "admin") {
                    roleQuery.role = "admin";
                }
                else if (visibility === "super_admin") {
                    roleQuery.role = "super_admin";
                }
                else {
                    roleQuery = { $or: [{ role: "admin" }, { role: "super_admin" }] };
                }
                // Find active admins (not deleted)
                const recipients = yield Admin_model_1.default.find(Object.assign(Object.assign({}, roleQuery), { isDeleted: false })).select("_id role");
                for (const admin of recipients) {
                    const notification = yield notificationModel_1.default.create({
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
        });
    }
    // Get filtered notifications for the current admin based on role
    getAdminNotifications(adminId, adminRole) {
        return __awaiter(this, void 0, void 0, function* () {
            const query = {
                $or: [
                    { recipient: adminId },
                    // Include broadcast notifications that match the admin's role
                    {
                        recipient: { $exists: false },
                        $or: [{ visibility: "all" }, { visibility: adminRole }],
                    },
                ],
            };
            return yield notificationModel_1.default.find(query).sort({ createdAt: -1 }).exec();
        });
    }
    // Mark notification as read
    markAsRead(notificationId, adminId) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield notificationModel_1.default.findOneAndUpdate({ _id: notificationId, recipient: adminId }, { isRead: true }, { new: true });
        });
    }
    // Mark all notifications as read for an admin
    markAllAsRead(adminId) {
        return __awaiter(this, void 0, void 0, function* () {
            yield notificationModel_1.default.updateMany({ recipient: adminId, isRead: false }, { isRead: true }).exec();
        });
    }
}
exports.NotificationService = NotificationService;
