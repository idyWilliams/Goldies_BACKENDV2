"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const app = (0, express_1.default)();
const socket_io_1 = require("socket.io");
const authRoute_1 = __importDefault(require("./routes/authRoute"));
const userRoute_1 = __importDefault(require("./routes/userRoute"));
const productRoute_1 = __importDefault(require("./routes/productRoute"));
const categoryRoute_1 = __importDefault(require("./routes/categoryRoute"));
const subcategoryRoute_1 = __importDefault(require("./routes/subcategoryRoute"));
const adminRoute_1 = __importDefault(require("./routes/adminRoute"));
const cartRoute_1 = __importDefault(require("./routes/cartRoute"));
const orderRoute_1 = __importDefault(require("./routes/orderRoute"));
const paystackRoute_1 = __importDefault(require("./routes/paystackRoute"));
const mailRoute_1 = __importDefault(require("./routes/mailRoute"));
const userFavoritesRoute_1 = __importDefault(require("./routes/userFavoritesRoute"));
const reviewRoute_1 = __importDefault(require("./routes/reviewRoute"));
const analytics_route_1 = __importDefault(require("./routes/analytics.route"));
const mongoose_1 = __importDefault(require("mongoose"));
const cors_1 = __importDefault(require("cors"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
// import Admin from "./models/adminModel";
const http_1 = require("http");
const notificationRoute_1 = require("./routes/notificationRoute");
const Admin_model_1 = __importDefault(require("./models/Admin.model"));
const adminAnalytics_route_1 = __importDefault(require("./routes/adminAnalytics.route"));
const PORT = process.env.PORT || 2030;
// const app = express();
const httpServer = (0, http_1.createServer)(app);
const allowedOrigins = [
    "https://goldies-frontend-v3.vercel.app",
    "http://localhost:7009",
];
// Socket.IO setup with CORS
const io = new socket_io_1.Server(httpServer, {
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
io.use((socket, next) => __awaiter(void 0, void 0, void 0, function* () {
    console.log("New connection attempt:", socket.id);
    console.log("Client headers:", socket.handshake.headers);
    console.log("Auth token present:", !!socket.handshake.auth.token);
    try {
        const token = socket.handshake.auth.token;
        if (!token) {
            throw new Error("No token provided");
        }
        console.log("Verifying token length:", token.length);
        const decoded = jsonwebtoken_1.default.verify(token, process.env.ACCESS_SECRET_TOKEN);
        console.log("Token decoded, looking up admin:", decoded.id);
        const admin = yield Admin_model_1.default.findById(decoded.id).select('role isBlocked isDeleted');
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
    }
    catch (err) {
        console.error("Socket auth error:", err.message);
        console.error("Stack:", err.stack);
        next(new Error(`Authentication failed: ${err.message}`));
    }
}));
// Simplified connection handler with more logging
io.on("connection", (socket) => {
    var _a;
    console.log(`Client connected: ${socket.id}`);
    console.log("User data:", socket.data.user);
    // Join admin to their personal room for notifications
    if ((_a = socket.data.user) === null || _a === void 0 ? void 0 : _a._id) {
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
// Attach io to requests
app.use((req, _, next) => {
    req.io = io;
    next();
});
app.use((0, cors_1.default)({
    origin: function (origin, callback) {
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        }
        else {
            callback(new Error("Not allowed by CORS"));
        }
    },
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
}));
app.use(express_1.default.json());
mongoose_1.default
    .connect(process.env.connectionString)
    .then(() => console.log("MongoDB connected"))
    .catch((err) => console.log(err));
app.get("/", (req, res) => {
    res.send("backend connected successfully");
});
app.use("/api/auth", authRoute_1.default);
app.use("/api/user", userRoute_1.default);
app.use("/api/product", productRoute_1.default);
app.use("/api/category", categoryRoute_1.default);
app.use("/api/subcategory", subcategoryRoute_1.default);
app.use("/api/admin", adminRoute_1.default);
app.use("/api/cart", cartRoute_1.default);
app.use("/api/order", orderRoute_1.default);
app.use("/api/payments", paystackRoute_1.default);
app.use("/api/mail", mailRoute_1.default);
app.use("/api/favorites", userFavoritesRoute_1.default);
app.use("/api/reviews", reviewRoute_1.default);
app.use("/api/notifications", (0, notificationRoute_1.notificationRouter)(io));
app.use("/api/analytics", analytics_route_1.default);
app.use("/api/analytics", adminAnalytics_route_1.default);
httpServer.listen(PORT, () => console.log(`server listening on port ${PORT}`));
