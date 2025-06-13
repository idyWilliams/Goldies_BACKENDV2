"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationController = void 0;
const notificationService_1 = require("../service/notificationService");
class NotificationController {
    notificationService;
    constructor(io) {
        this.notificationService = new notificationService_1.NotificationService(io);
    }
    // Get all notifications for current admin
    getNotifications = async (req, res, next) => {
        try {
            console.log({ req }, "kkk");
            if (!req.user) {
                return res.status(401).json({ message: "Unauthorized" });
            }
            const notifications = await this.notificationService.getAdminNotifications(req.user._id, req.user.role);
            res.status(200).json(notifications);
        }
        catch (error) {
            next(error);
        }
    };
    // Mark notification as read
    markNotificationAsRead = async (req, res, next) => {
        try {
            if (!req.user) {
                return res.status(401).json({ message: "Unauthorized" });
            }
            const notification = await this.notificationService.markAsRead(req.params.id, req.user._id);
            if (!notification) {
                return res.status(404).json({ message: "Notification not found" });
            }
            res.status(200).json(notification);
        }
        catch (error) {
            next(error);
        }
    };
    // Mark all notifications as read
    markAllNotificationsAsRead = async (req, res, next) => {
        try {
            if (!req.user) {
                return res.status(401).json({ message: "Unauthorized" });
            }
            // Now passing both adminId and adminRole
            await this.notificationService.markAllAsRead(req.user._id, req.user.role);
            res.status(200).json({ message: "All notifications marked as read" });
        }
        catch (error) {
            next(error);
        }
    };
    // Create new notification
    createNotification = async (req, res, next) => {
        try {
            if (!req.user) {
                return res.status(401).json({ message: "Unauthorized" });
            }
            const { title, message, type, visibility, recipientId, relatedId } = req.body;
            const notifications = await this.notificationService.createNotification({
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
    };
}
exports.NotificationController = NotificationController;
//# sourceMappingURL=notificationController.js.map