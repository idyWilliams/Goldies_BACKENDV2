// validations/notification.validation.ts
import { z } from "zod";
import mongoose from "mongoose";

export const notificationPaginationSchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(10),
  sortOrder: z.enum(["asc", "desc"]).default("desc"),
  type: z.enum(["order", "user", "system", "product", "promotion"]).optional(),
  read: z.enum(["true", "false", "all"]).default("all"),
  search: z.string().optional(),
});

export const createNotificationSchema = z.object({
  userId: z.string().refine((val) => mongoose.Types.ObjectId.isValid(val)),
  message: z.string().min(1),
  type: z.enum(["order", "user", "system", "product", "promotion"]),
  relatedEntityId: z.string().optional(),
  title: z.string().min(1),
  priority: z.enum(["high", "medium", "low"]).default("medium"),
});

export const markAsReadSchema = z.object({
  ids: z.array(
    z.string().refine((val) => mongoose.Types.ObjectId.isValid(val))
  ),
});
