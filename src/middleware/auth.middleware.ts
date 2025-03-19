// middleware/auth.middleware.ts

import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import Admin from "../models/Admin.model";

interface AuthRequest extends Request {
  admin?: any;
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

      // Get admin from token
      req.admin = await Admin.findById(decoded.id).select("-password");

      next();
    } catch (error) {
      console.error("Auth middleware error:", error);
      res.status(401).json({
        error: true,
        message: "Not authorized",
      });
    }
  }

  if (!token) {
    res.status(401).json({
      error: true,
      message: "Not authorized, no token",
    });
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
        message: "Not authorized for this action",
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
  const adminId = req.admin?.id;

  try {
    const admin = await Admin.findById(adminId);
    if (!admin || admin.role !== "super_admin") {
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
