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
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationController = void 0;
const notificationService_1 = require("../service/notificationService");
class NotificationController {
    constructor(io) {
        // Get all notifications for current admin
        this.getNotifications = (req, res, next) => __awaiter(this, void 0, void 0, function* () {
            try {
                console.log({ req }, "kkk");
                if (!req.user) {
                    return res.status(401).json({ message: "Unauthorized" });
                }
                const notifications = yield this.notificationService.getAdminNotifications(req.user._id, req.user.role);
                res.status(200).json(notifications);
            }
            catch (error) {
                next(error);
            }
        });
        // Mark notification as read
        this.markNotificationAsRead = (req, res, next) => __awaiter(this, void 0, void 0, function* () {
            try {
                if (!req.user) {
                    return res.status(401).json({ message: "Unauthorized" });
                }
                const notification = yield this.notificationService.markAsRead(req.params.id, req.user._id);
                if (!notification) {
                    return res.status(404).json({ message: "Notification not found" });
                }
                res.status(200).json(notification);
            }
            catch (error) {
                next(error);
            }
        });
        // Mark all notifications as read
        this.markAllNotificationsAsRead = (req, res, next) => __awaiter(this, void 0, void 0, function* () {
            try {
                if (!req.user) {
                    return res.status(401).json({ message: "Unauthorized" });
                }
                // Now passing both adminId and adminRole
                yield this.notificationService.markAllAsRead(req.user._id, req.user.role);
                res.status(200).json({ message: "All notifications marked as read" });
            }
            catch (error) {
                next(error);
            }
        });
        // Create new notification
        this.createNotification = (req, res, next) => __awaiter(this, void 0, void 0, function* () {
            try {
                if (!req.user) {
                    return res.status(401).json({ message: "Unauthorized" });
                }
                const { title, message, type, visibility, recipientId, relatedId } = req.body;
                const notifications = yield this.notificationService.createNotification({
                    title,
                    message,
                    type,
                    visibility: visibility || "all",
                    recipientId,
                    relatedId,
                });
                res.status(201).json(notifications);
            }
            catch (error) {
                next(error);
            }
        });
        this.notificationService = new notificationService_1.NotificationService(io);
    }
}
exports.NotificationController = NotificationController;
