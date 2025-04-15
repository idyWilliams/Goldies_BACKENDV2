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
class NotificationService {
    constructor(io) {
        this.io = io;
    }
    // Create and send notifications
    createNotification(_a) {
        return __awaiter(this, arguments, void 0, function* ({ title, message, type, visibility = "all", recipientId, relatedId, }) {
            const notifications = [];
            if (recipientId) {
                // Send to specific recipient
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
                const recipients = yield Admin_model_1.default.find(query).select("_id");
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
    // Get notifications for admin (filtered by role)
    getAdminNotifications(adminId, adminRole) {
        return __awaiter(this, void 0, void 0, function* () {
            const query = {
                $or: [
                    { recipient: adminId },
                    {
                        recipient: { $exists: false },
                        $or: [{ visibility: "all" }, { visibility: adminRole }],
                    },
                ],
            };
            return yield notificationModel_1.default.find(query).sort({ createdAt: -1 }).exec();
        });
    }
    // Mark single notification as read
    markAsRead(notificationId, adminId) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield notificationModel_1.default.findOneAndUpdate({
                _id: notificationId,
                $or: [{ recipient: adminId }, { recipient: { $exists: false } }],
            }, { isRead: true }, { new: true });
        });
    }
    // Mark all notifications as read for admin
    markAllAsRead(adminId, adminRole) {
        return __awaiter(this, void 0, void 0, function* () {
            yield notificationModel_1.default.updateMany({
                $or: [
                    { recipient: adminId, isRead: false },
                    {
                        recipient: { $exists: false },
                        isRead: false,
                        $or: [{ visibility: "all" }, { visibility: adminRole }],
                    },
                ],
            }, { isRead: true }).exec();
        });
    }
}
exports.NotificationService = NotificationService;
