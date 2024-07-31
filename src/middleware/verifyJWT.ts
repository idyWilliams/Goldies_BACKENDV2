import jwt from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config();
import { Request, Response, NextFunction } from "express";
export interface CustomRequest extends Request {
  id?: string;
}
const authenticateToken = (
  req: CustomRequest,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers["authorization"];

  if (!authHeader) return res.sendStatus(401);
  const token = authHeader.split(" ")[1];
  if (!token) return res.sendStatus(401);

  jwt.verify(
    token,
    process.env.ACCESS_SECRET_TOKEN as string,
    (err: any, decoded: any) => {
      if (err) return res.sendStatus(403);

      req.id = decoded.id;
      next();
    }
  );
};

export { authenticateToken };
