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
const mongoose_1 = __importDefault(require("mongoose"));
const cors_1 = __importDefault(require("cors"));
const http_1 = require("http");
const notificationRoute_1 = require("./routes/notificationRoute");
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
        methods: ["GET", "POST"],
        credentials: true,
    },
});
// Attach io to requests
app.use((req, _, next) => {
    req.io = io;
    next();
});
// Add authentication middleware for Socket.IO
io.use((socket, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c, _d;
    try {
        const token = socket.handshake.auth.token;
        // Verify token using your existing auth logic
        // const decoded = verifyToken(token);
        // socket.data.user = decoded;
        // If this is an admin user, we should join them to their user-specific room
        if (((_b = (_a = socket.data) === null || _a === void 0 ? void 0 : _a.user) === null || _b === void 0 ? void 0 : _b.role) === "admin" ||
            ((_d = (_c = socket.data) === null || _c === void 0 ? void 0 : _c.user) === null || _d === void 0 ? void 0 : _d.role) === "super_admin") {
            socket.join(socket.data.user._id);
        }
        next();
    }
    catch (err) {
        next(new Error("Authentication error"));
    }
}));
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
// mongoose
//   .connect(process.env.MONGO_URI as string)
//   .then(() => console.log("MongoDB connected"))
//   .catch((err) => console.error("MongoDB connection error:", err));
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
// Important: Use httpServer instead of app for listening
// This is critical for Socket.io to work properly
httpServer.listen(PORT, () => console.log(`server listening on port ${PORT}`));
