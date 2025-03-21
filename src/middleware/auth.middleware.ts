// middleware/auth.middleware.ts

import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import Admin from "../models/Admin.model";

// Define the admin interface with all necessary properties
interface IAdmin {
  _id: string;
  id?: string; // Some places might be using id instead of _id
  userName: string;
  email: string;
  role: string;
  isBlocked: boolean;
  isDeleted: boolean;
  isVerified: boolean;
}

// Extend the Request interface to include the admin property
export interface AuthRequest extends Request {
  admin?: IAdmin;
}

export const protect = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    try {
      // Get token from header
      token = req.headers.authorization.split(" ")[1];

      // Verify token
      const decoded = jwt.verify(
        token,
        process.env.ACCESS_SECRET_TOKEN as string
      ) as { id: string };

      // Get admin from token - include userName for status changes
      const admin = await Admin.findById(decoded.id).select("-password");

      if (!admin) {
        return res.status(401).json({
          error: true,
          message: "Admin account not found",
        });
      }

      if (admin.isBlocked) {
        return res.status(403).json({
          error: true,
          message:
            "Your account has been blocked. Please contact a super admin.",
        });
      }

      if (admin.isDeleted) {
        return res.status(401).json({
          error: true,
          message: "This account has been deleted.",
        });
      }

      // Add admin to request object with properly typed structure
      req.admin = {
        _id: admin._id.toString(),
        id: admin._id.toString(), // Include both for compatibility
        userName: admin.userName,
        email: admin.email,
        role: admin.role,
        isBlocked: admin.isBlocked,
        isDeleted: admin.isDeleted,
        isVerified: admin.isVerified,
      };

      next();
    } catch (error) {
      console.error("Auth middleware error:", error);
      res.status(401).json({
        error: true,
        message: "Not authorized, token invalid",
      });
      return; // Add return to prevent further execution
    }
  }

  if (!token) {
    res.status(401).json({
      error: true,
      message: "Not authorized, no token",
    });
    return; // Add return to prevent further execution
  }
};

export const authorize = (...roles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.admin) {
      return res.status(401).json({
        error: true,
        message: "Not authorized",
      });
    }

    if (!roles.includes(req.admin.role)) {
      return res.status(403).json({
        error: true,
        message: `Not authorized for this action. Required role: ${roles.join(
          " or "
        )}`,
      });
    }

    next();
  };
};

export const isSuperAdmin = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  // Check if admin exists in request (protect middleware should be called first)
  if (!req.admin || (!req.admin.id && !req.admin._id)) {
    return res.status(401).json({
      error: true,
      message: "Authentication required. Please log in.",
    });
  }

  const adminId = req.admin.id || req.admin._id;

  try {
    const admin = await Admin.findById(adminId);
    if (!admin) {
      return res.status(401).json({
        error: true,
        message: "Admin account not found",
      });
    }

    if (admin.role !== "super_admin") {
      return res.status(403).json({
        error: true,
        message: "Access denied. Only super admins can perform this action.",
      });
    }

    next();
  } catch (error) {
    return res.status(500).json({
      error: true,
      message: "Internal server error",
    });
  }
};

// Helper function to get admin name for status changes
export const getAdminIdentifier = (
  req: AuthRequest
): { id: string; name: string } => {
  if (!req.admin) {
    return { id: "system", name: "System" };
  }

  return {
    id: req.admin._id || req.admin.id || "unknown",
    name: req.admin.userName || "Unknown Admin",
  };
};
