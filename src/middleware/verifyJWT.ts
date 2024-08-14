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
  const token1 = authHeader.split(" ")[1];

  const { token: token2 } = req.body;

  let token = token1 ? token1 : token2;

  if (!token1 && !token2) return res.sendStatus(401);

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
