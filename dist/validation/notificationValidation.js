"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.markAsReadSchema = exports.createNotificationSchema = exports.notificationPaginationSchema = void 0;
// validations/notification.validation.ts
const zod_1 = require("zod");
const mongoose_1 = __importDefault(require("mongoose"));
exports.notificationPaginationSchema = zod_1.z.object({
    page: zod_1.z.coerce.number().min(1).default(1),
    limit: zod_1.z.coerce.number().min(1).max(100).default(10),
    sortOrder: zod_1.z.enum(["asc", "desc"]).default("desc"),
    type: zod_1.z.enum(["order", "user", "system", "product", "promotion"]).optional(),
    read: zod_1.z.enum(["true", "false", "all"]).default("all"),
    search: zod_1.z.string().optional(),
});
exports.createNotificationSchema = zod_1.z.object({
    userId: zod_1.z.string().refine((val) => mongoose_1.default.Types.ObjectId.isValid(val)),
    message: zod_1.z.string().min(1),
    type: zod_1.z.enum(["order", "user", "system", "product", "promotion"]),
    relatedEntityId: zod_1.z.string().optional(),
    title: zod_1.z.string().min(1),
    priority: zod_1.z.enum(["high", "medium", "low"]).default("medium"),
});
exports.markAsReadSchema = zod_1.z.object({
    ids: zod_1.z.array(zod_1.z.string().refine((val) => mongoose_1.default.Types.ObjectId.isValid(val))),
});
//# sourceMappingURL=notificationValidation.js.map