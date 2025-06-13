"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
require("dotenv/config");
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
const http_1 = require("http");
const adminAnalytics_route_1 = __importDefault(require("./routes/adminAnalytics.route"));
// dotenv.config();
const app = (0, express_1.default)();
// const PORT = process.env.PORT || 2030;
const { MONGO_URI, PORT = "2030" } = process.env;
const httpServer = (0, http_1.createServer)(app);
const allowedOrigins = [
    "https://goldies-frontend-v3.vercel.app",
    "http://localhost:7009",
];
console.log("Environment Variables:", {
    MONGO_URI: MONGO_URI ? "Exists" : "Missing",
    PORT: PORT,
});
// Attach io to requests
app.use((req, _, next) => {
    // req.io = io;
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
if (!MONGO_URI) {
    console.error("Missing MONGO_URI environment variable");
    process.exit(1);
}
async function connectDB() {
    try {
        if (!process.env.MONGO_URI) {
            throw new Error("MongoDB URI is not defined in environment variables");
        }
        console.log("Connecting to MongoDB with URI:", process.env.MONGO_URI.replace(/:[^@]*@/, ":*****@"));
        await mongoose_1.default.connect(process.env.MONGO_URI, {
            serverSelectionTimeoutMS: 10000, // Increased timeout
            socketTimeoutMS: 45000,
            retryWrites: true,
            w: "majority",
        });
        console.log("✅ MongoDB connected successfully");
    }
    catch (error) {
        console.error("❌ MongoDB connection error:", error);
        // More detailed error handling
        if (error instanceof mongoose_1.default.Error.MongooseServerSelectionError) {
            console.error("Network-related error:");
            console.error("- Verify your IP is whitelisted in Atlas");
            console.error("- Check your internet connection");
            console.error("- Verify the MongoDB URI is correct");
        }
        process.exit(1);
    }
}
// Handle database connection events
mongoose_1.default.connection.on("connected", () => {
    console.log("Mongoose connected to DB");
});
mongoose_1.default.connection.on("error", (err) => {
    console.error("Mongoose connection error:", err);
});
mongoose_1.default.connection.on("disconnected", () => {
    console.log("Mongoose disconnected");
});
// Handle process termination
process.on("SIGINT", async () => {
    await mongoose_1.default.connection.close();
    console.log("Mongoose connection closed due to app termination");
    process.exit(0);
});
connectDB();
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
// app.use("/api/notifications", notificationRouter(io));
app.use("/api/analytics", analytics_route_1.default);
app.use("/api/admin-analytics", adminAnalytics_route_1.default);
httpServer.listen(PORT, () => console.log(`server listening on port ${PORT}`));
//# sourceMappingURL=server.js.map