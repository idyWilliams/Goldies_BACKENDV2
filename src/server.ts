import express from "express";
import "dotenv/config";
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
import jwt from "jsonwebtoken";
import { createServer } from "http";
import { notificationRouter } from "./routes/notificationRoute";
import AdminModel from "./models/Admin.model";
import adminAnalytics from "./routes/adminAnalytics.route";

// dotenv.config();
const app = express();

// const PORT = process.env.PORT || 2030;

const { MONGO_URI, PORT = "2030" } = process.env;
const httpServer = createServer(app);
const allowedOrigins = [
  "https://goldies-frontend-v3.vercel.app",
  "http://localhost:7009",
];

console.log("Environment Variables:", {
  MONGO_URI: MONGO_URI ? "Exists" : "Missing",
  PORT: PORT,
});

// const io = new Server(httpServer, {
//   cors: {
//     origin: allowedOrigins,
//     methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
//     credentials: true,
//   },
//   path: "/socket.io",
//   connectTimeout: 10000,
//   pingTimeout: 30000,
//   pingInterval: 25000,
// });

// Add debug logs
// io.engine.on("connection_error", (err) => {
//   console.log("Connection error:", err);
// });

// Updated Socket.IO authentication middleware with proper JWT error handling
// io.use(async (socket, next) => {
//   console.log("New connection attempt:", socket.id);
//   console.log("Client headers:", socket.handshake.headers);
//   console.log("Auth token present:", !!socket.handshake.auth.token);

//   try {
//     const token = socket.handshake.auth.token;
//     if (!token) {
//       throw new Error("No token provided");
//     }

//     console.log("Verifying token length:", token.length);

//     // Handle JWT verification with specific error handling
//     let decoded;
//     try {
//       decoded = jwt.verify(
//         token,
//         process.env.ACCESS_SECRET_TOKEN as string
//       ) as {
//         id: string;
//         role?: string;
//       };
//     } catch (jwtError: any) {
//       if (jwtError.name === "TokenExpiredError") {
//         console.log("Token expired, rejecting connection");
//         return next(new Error("Token expired. Please login again."));
//       } else if (jwtError.name === "JsonWebTokenError") {
//         console.log("Invalid token, rejecting connection");
//         return next(new Error("Invalid token. Please login again."));
//       } else if (jwtError.name === "NotBeforeError") {
//         console.log("Token not active yet, rejecting connection");
//         return next(new Error("Token not active yet. Please try again."));
//       } else {
//         console.log("Unknown JWT error:", jwtError.message);
//         throw jwtError;
//       }
//     }

//     console.log("Token decoded, looking up admin:", decoded.id);
//     const admin = await AdminModel.findById(decoded.id).select(
//       "role isBlocked isDeleted"
//     );

//     if (!admin) {
//       console.log("Admin not found:", decoded.id);
//       throw new Error("Admin not found");
//     }

//     if (admin.isBlocked || admin.isDeleted) {
//       console.log(
//         "Admin account issue - blocked:",
//         admin.isBlocked,
//         "deleted:",
//         admin.isDeleted
//       );
//       throw new Error("Admin account is blocked or deleted");
//     }

//     socket.data.user = {
//       _id: admin._id.toString(),
//       role: admin.role,
//     };

//     console.log(`✅ Authenticated admin ${admin._id} with role ${admin.role}`);
//     next();
//   } catch (err: any) {
//     console.error("❌ Socket auth error:", err.message);
//     console.error("Stack:", err.stack);
//     next(new Error(`Authentication failed: ${err.message}`));
//   }
// });

// Enhanced connection handler with better error handling
// io.on("connection", (socket) => {
//   console.log(`✅ Client connected: ${socket.id}`);
//   console.log("User data:", socket.data.user);

//   // Join admin to their personal room for notifications
//   if (socket.data.user?._id) {
//     const roomId = socket.data.user._id.toString();
//     socket.join(roomId);
//     console.log(`Admin ${roomId} joined room: ${roomId}`);

//     socket.emit("connection-success", {
//       message: "Successfully connected to notification service",
//       userId: roomId,
//       timestamp: new Date(),
//     });
//   }

//   socket.on("disconnect", (reason) => {
//     console.log(`❌ Client disconnected (${socket.id}): ${reason}`);
//   });

//   socket.on("error", (err) => {
//     console.error(`❌ Socket error (${socket.id}):`, err);
//   });

  // Handle connection errors gracefully
//   socket.on("connect_error", (err) => {
//     console.error(`❌ Connection error (${socket.id}):`, err.message);
//     if (err.message.includes("Token expired")) {
//       socket.emit("auth-error", {
//         message: "Your session has expired. Please login again.",
//         code: "TOKEN_EXPIRED",
//       });
//     }
//   });
// });

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
  // req.io = io;
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

if (!MONGO_URI) {
  console.error("Missing MONGO_URI environment variable");
  process.exit(1);
}

async function connectDB() {
  try {
    if (!process.env.MONGO_URI) {
      throw new Error("MongoDB URI is not defined in environment variables");
    }

    console.log(
      "Connecting to MongoDB with URI:",
      process.env.MONGO_URI.replace(/:[^@]*@/, ":*****@")
    );

    await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 10000, // Increased timeout
      socketTimeoutMS: 45000,
      retryWrites: true,
      w: "majority",
    });

    console.log("✅ MongoDB connected successfully");
  } catch (error) {
    console.error("❌ MongoDB connection error:", error);
    // More detailed error handling
    if (error instanceof mongoose.Error.MongooseServerSelectionError) {
      console.error("Network-related error:");
      console.error("- Verify your IP is whitelisted in Atlas");
      console.error("- Check your internet connection");
      console.error("- Verify the MongoDB URI is correct");
    }
    process.exit(1);
  }
}

// Handle database connection events
mongoose.connection.on("connected", () => {
  console.log("Mongoose connected to DB");
});

mongoose.connection.on("error", (err) => {
  console.error("Mongoose connection error:", err);
});

mongoose.connection.on("disconnected", () => {
  console.log("Mongoose disconnected");
});

// Handle process termination
process.on("SIGINT", async () => {
  await mongoose.connection.close();
  console.log("Mongoose connection closed due to app termination");
  process.exit(0);
});

connectDB();
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
// app.use("/api/notifications", notificationRouter(io));
app.use("/api/analytics", analyticsRoutes);
app.use("/api/admin-analytics", adminAnalytics);

httpServer.listen(PORT, () => console.log(`server listening on port ${PORT}`));
