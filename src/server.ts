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

import mongoose from "mongoose";
import { Request, Response } from "express";
import cors from "cors";
import { Script } from "vm";
import { createServer } from "http";
import { notificationRouter } from "./routes/notificationRoute";
const PORT = process.env.PORT || 2030;
// const app = express();
const httpServer = createServer(app);
const allowedOrigins = [
  "https://goldies-frontend-v3.vercel.app",
  "http://localhost:7009",
];

// Socket.IO setup with CORS
const io = new Server(httpServer, {
  cors: {
    origin: allowedOrigins,
    methods: ["GET", "POST"],
    credentials: true,
  },
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

// Add authentication middleware for Socket.IO
io.use(async (socket, next) => {
  try {
    const token = socket.handshake.auth.token;
    // Verify token using your existing auth logic
    // const decoded = verifyToken(token);
    // socket.data.user = decoded;

    // If this is an admin user, we should join them to their user-specific room
    if (
      socket.data?.user?.role === "admin" ||
      socket.data?.user?.role === "super_admin"
    ) {
      socket.join(socket.data.user._id);
    }

    next();
  } catch (err) {
    next(new Error("Authentication error"));
  }
});

// Socket.IO connection handler
io.on("connection", (socket) => {
  console.log("Client connected:", socket.id);

  // Join user-specific room
  socket.on("join-user-room", (userId) => {
    socket.join(userId);
    console.log(`User ${userId} joined their room`);
  });

  socket.on("disconnect", () => {
    console.log("Client disconnected:", socket.id);
  });
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

// Important: Use httpServer instead of app for listening
// This is critical for Socket.io to work properly
httpServer.listen(PORT, () => console.log(`server listening on port ${PORT}`));
