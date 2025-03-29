import jwt from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config();
import { Request, Response, NextFunction } from "express";

export interface CustomRequest extends Request {
  id?: string;
}

// Require authentication
const authenticateToken = (
  req: CustomRequest,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers["authorization"];

  if (!authHeader) return res.sendStatus(401);
  const token1 = authHeader.split(" ")[1];

  const { token: token2 } = req.body;

  let token = token1 ? token1 : token2;

  if (!token1 && !token2) return res.sendStatus(401);

  jwt.verify(
    token,
    process.env.ACCESS_SECRET_TOKEN as string,
    (err: any, decoded: any) => {
      if (err) {
        console.error("Token verification error:", err);
        return res.sendStatus(403);
      }
      req.id = decoded.id;
      next();
    }
  );
};

// Optional authentication - request proceeds even without auth
const optionalAuthenticateToken = (
  req: CustomRequest,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers["authorization"];

  if (!authHeader) {
    // No authentication provided, but that's OK
    next();
    return;
  }

  const token1 = authHeader.split(" ")[1];
  const { token: token2 } = req.body;
  let token = token1 ? token1 : token2;

  if (!token1 && !token2) {
    // No token found, but that's OK
    next();
    return;
  }

  jwt.verify(
    token,
    process.env.ACCESS_SECRET_TOKEN as string,
    (err: any, decoded: any) => {
      if (err) {
        // Invalid token, but we still proceed
        console.error("Token verification error:", err);
        next();
        return;
      }

      // Valid token, set the user ID
      req.id = decoded.id;
      next();
    }
  );
};

export { authenticateToken, optionalAuthenticateToken };
