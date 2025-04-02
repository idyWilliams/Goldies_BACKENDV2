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
import jwt from "jsonwebtoken";
// import Admin from "./models/adminModel";
import { createServer } from "http";
import { notificationRouter } from "./routes/notificationRoute";
import AdminModel from "./models/Admin.model";
const PORT = process.env.PORT || 2030;
// const app = express();
const httpServer = createServer(app);
const allowedOrigins = [
  "https://goldies-frontend-v3.vercel.app",
  "http://localhost:7009",
];

// Socket.IO setup with CORS
// server.ts
// const io = new Server(httpServer, {
//   cors: {
//     origin: allowedOrigins,
//     methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
//     credentials: true,
//   },
//   allowEIO3: true,
//   path: "/socket.io", // This is the default path
//   connectTimeout: 5000,
//   pingTimeout: 20000,
//   pingInterval: 25000,
// });

// // Improved authentication middleware
// io.use(async (socket, next) => {
//   console.log("New connection attempt:", socket.id);

//   try {
//     const token = socket.handshake.auth.token;
//     if (!token) {
//       throw new Error("No token provided");
//     }

//     console.log("Verifying token:", token);
//     const decoded = jwt.verify(token, process.env.ACCESS_SECRET_TOKEN as string) as {
//       id: string;
//       role?: string;
//     };

//     const admin = await AdminModel.findById(decoded.id).select('role isBlocked isDeleted');
//     if (!admin || admin.isBlocked || admin.isDeleted) {
//       throw new Error("Invalid admin credentials");
//     }

//     socket.data.user = {
//       _id: admin._id.toString(),
//       role: admin.role,
//     };

//     console.log(`Authenticated admin ${admin._id} with role ${admin.role}`);
//     next();
//   } catch (err) {
//     console.error("Socket auth error:", err);
//     next(new Error("Authentication failed"));
//   }
// });

// io.on("connection", (socket) => {
//   console.log(`Client connected: ${socket.id}`);
//   console.log("User data:", socket.data.user);

//   // Handle admin-specific room joining
//   if (socket.data.user?.role) {
//     socket.join(socket.data.user._id);
//     console.log(`Admin ${socket.data.user._id} joined their room`);
//   }

//   socket.on("disconnect", (reason) => {
//     console.log(`Client disconnected (${socket.id}): ${reason}`);
//   });

//   socket.on("error", (err) => {
//     console.error(`Socket error (${socket.id}):`, err);
//   });
// });

// Socket.IO setup with CORS
const io = new Server(httpServer, {
  cors: {
    origin: allowedOrigins,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
    credentials: true,
  },
  path: "/socket.io", // Make sure path matches client
  connectTimeout: 10000, // Increase timeout
  pingTimeout: 30000,
  pingInterval: 25000,
});

// Add debug logs
io.engine.on("connection_error", (err) => {
  console.log("Connection error:", err);
});

// Improved authentication middleware with better error handling
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
    const decoded = jwt.verify(token, process.env.ACCESS_SECRET_TOKEN as string) as {
      id: string;
      role?: string;
    };

    console.log("Token decoded, looking up admin:", decoded.id);
    const admin = await AdminModel.findById(decoded.id).select('role isBlocked isDeleted');
    
    if (!admin) {
      console.log("Admin not found:", decoded.id);
      throw new Error("Admin not found");
    }
    
    if (admin.isBlocked || admin.isDeleted) {
      console.log("Admin account issue - blocked:", admin.isBlocked, "deleted:", admin.isDeleted);
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
      timestamp: new Date()
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

// Add authentication middleware for Socket.IO
// io.use(async (socket, next) => {
//   try {
//     const token = socket.handshake.auth.token;

//     console.log(token)
//     // Verify token using your existing auth logic
//     // const decoded = verifyToken(token);
//     // socket.data.user = decoded;

//     // If this is an admin user, we should join them to their user-specific room
//     if (
//       socket.data?.user?.role === "admin" ||
//       socket.data?.user?.role === "super_admin"
//     ) {
//       socket.join(socket.data.user._id);
//     }

//     next();
//   } catch (err) {
//     next(new Error("Authentication error"));
//   }
// });

// Update the Socket.IO middleware in server.ts
// io.use(async (socket, next) => {
//     console.log(`Client connected: ${socket.id}`);
//     console.log("Auth:", socket.handshake.auth);
//   try {
//     const token = socket.handshake.auth.token;

//     if (!token) {
//       throw new Error('Authentication error: No token provided');
//     }

//     // Use your existing token verification logic
//     const decoded = jwt.verify(token, process.env.ACCESS_SECRET_TOKEN as string) as {
//       id: string;
//       role?: string;
//     };

//     // Fetch the admin/user from database to verify
//     const admin = await AdminModel.findById(decoded.id).select('role isBlocked isDeleted');

//     if (!admin || admin.isBlocked || admin.isDeleted) {
//       throw new Error('Authentication error: Invalid admin');
//     }

//     // Attach user data to socket
//     socket.data.user = {
//       _id: admin._id.toString(),
//       role: admin.role,
//     };

//     // Join admin to their personal room
//     if (admin.role === 'admin' || admin.role === 'super_admin') {
//       socket.join(admin._id.toString());
//       console.log(`Admin ${admin._id} joined their room`);
//     }

//     next();
//   } catch (err) {
//     console.error('Socket authentication error:', err);
//     next(new Error('Authentication error'));
//   }
// });

// // Socket.IO connection handler
// io.on("connection", (socket) => {
//   console.log("Client connected:", socket.id);

//   // Join user-specific room
//   socket.on("join-user-room", (userId) => {
//     socket.join(userId);
//     console.log(`User ${userId} joined their room`);
//   });

//   socket.on("disconnect", () => {
//     console.log("Client disconnected:", socket.id);
//   });
// });

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
