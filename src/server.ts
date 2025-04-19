import express from "express";
import dotenv from "dotenv";
dotenv.config();
const app = express();
import { Server } from "socket.io";
import authRouter from "./routes/authRoute";
import userRouter from "./routes/userRoute";
import productRouter from "./routes/productRoute";
import categoryRouter from "./routes/categoryRoute";
import subcategoryRouter from "./routes/subcategoryRoute";
import adminRouter from "./routes/adminRoute";
import cartRouter from "./routes/cartRoute";
import orderRouter from "./routes/orderRoute";
import paystackRouter from "./routes/paystackRoute";
import mailRouter from "./routes/mailRoute";
import userFavoritesRouter from "./routes/userFavoritesRoute";
import reviewRouter from "./routes/reviewRoute";
import analyticsRoutes from "./routes/analytics.route";
import mongoose from "mongoose";
import { Request, Response } from "express";
import cors from "cors";
import jwt from "jsonwebtoken"
import { createServer } from "http";
import { notificationRouter } from "./routes/notificationRoute";
import AdminModel from "./models/Admin.model";
import adminAnalytics from "./routes/adminAnalytics.route";
const PORT = process.env.PORT || 2030;
const httpServer = createServer(app);
const allowedOrigins = [
  "https://goldies-frontend-v3.vercel.app",
  "http://localhost:7009",
];


const io = new Server(httpServer, {
  cors: {
    origin: allowedOrigins,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
    credentials: true,
  },
  path: "/socket.io",
  connectTimeout: 10000,
  pingTimeout: 30000,
  pingInterval: 25000,
});

// Add debug logs
io.engine.on("connection_error", (err) => {
  console.log("Connection error:", err);
});

io.use(async (socket, next) => {
  console.log("New connection attempt:", socket.id);
  console.log("Client headers:", socket.handshake.headers);
  console.log("Auth token present:", !!socket.handshake.auth.token);

  try {
    const token = socket.handshake.auth.token;
    if (!token) {
      throw new Error("No token provided");
    }

    console.log("Verifying token length:", token.length);
    const decoded = jwt.verify(
      token,
      process.env.ACCESS_SECRET_TOKEN as string
    ) as {
      id: string;
      role?: string;
    };

    console.log("Token decoded, looking up admin:", decoded.id);
    const admin = await AdminModel.findById(decoded.id).select(
      "role isBlocked isDeleted"
    );

    if (!admin) {
      console.log("Admin not found:", decoded.id);
      throw new Error("Admin not found");
    }

    if (admin.isBlocked || admin.isDeleted) {
      console.log(
        "Admin account issue - blocked:",
        admin.isBlocked,
        "deleted:",
        admin.isDeleted
      );
      throw new Error("Admin account is blocked or deleted");
    }

    socket.data.user = {
      _id: admin._id.toString(),
      role: admin.role,
    };

    console.log(`Authenticated admin ${admin._id} with role ${admin.role}`);
    next();
  } catch (err: any) {
    console.error("Socket auth error:", err.message);
    console.error("Stack:", err.stack);
    next(new Error(`Authentication failed: ${err.message}`));
  }
});

// Simplified connection handler with more logging
io.on("connection", (socket) => {
  console.log(`Client connected: ${socket.id}`);
  console.log("User data:", socket.data.user);

  // Join admin to their personal room for notifications
  if (socket.data.user?._id) {
    const roomId = socket.data.user._id.toString();
    socket.join(roomId);
    console.log(`Admin ${roomId} joined room: ${roomId}`);

    // Send a test notification to confirm room joining
    socket.emit("connection-success", {
      message: "Successfully connected to notification service",
      userId: roomId,
      timestamp: new Date(),
    });
  }

  socket.on("disconnect", (reason) => {
    console.log(`Client disconnected (${socket.id}): ${reason}`);
  });

  socket.on("error", (err) => {
    console.error(`Socket error (${socket.id}):`, err);
  });
});

// Add this after your existing middleware but before routes
declare global {
  namespace Express {
    interface Request {
      io?: Server;
      user?: {
        _id: string;
        id?: string;
        email: string;
        role: string;
        isAdmin: boolean;
        isBlocked?: boolean;
        isDeleted?: boolean;
        isVerified?: boolean;
      };
    }
  }
}

// Attach io to requests
app.use((req, _, next) => {
  req.io = io;
  next();
});

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);

app.use(express.json());

mongoose
  .connect(process.env.connectionString as string)
  .then(() => console.log("MongoDB connected"))
  .catch((err: any) => console.log(err));

app.get("/", (req: Request, res: Response) => {
  res.send("backend connected successfully");
});

app.use("/api/auth", authRouter);
app.use("/api/user", userRouter);
app.use("/api/product", productRouter);
app.use("/api/category", categoryRouter);
app.use("/api/subcategory", subcategoryRouter);
app.use("/api/admin", adminRouter);
app.use("/api/cart", cartRouter);
app.use("/api/order", orderRouter);
app.use("/api/payments", paystackRouter);
app.use("/api/mail", mailRouter);
app.use("/api/favorites", userFavoritesRouter);
app.use("/api/reviews", reviewRouter);
app.use("/api/notifications", notificationRouter(io));
app.use("/api/analytics", analyticsRoutes);
app.use("/api/admin-analytics", adminAnalytics);

httpServer.listen(PORT, () => console.log(`server listening on port ${PORT}`));
