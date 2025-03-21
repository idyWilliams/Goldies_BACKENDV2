import express from "express";
import dotenv from "dotenv";
dotenv.config();
const app = express();
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
import reviewRouter from "./routes/reviewRoute"
import mongoose from "mongoose";
import { Request, Response } from "express";
import cors from "cors";
import { Script } from "vm";
const PORT = process.env.PORT || 2030;


const allowedOrigins = ["https://goldies-frontend-v3.vercel.app", "http://localhost:7009"];
app.use(cors({
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
}));
const MONGO_URI = process.env.MONGO_URI;
app.use(express.json());
console.log("MongoDB URI:", process.env.MONGO_URI);
if (!MONGO_URI) {
  console.error("MONGO_URI is not defined");
  process.exit(1);
}
mongoose
  .connect(MONGO_URI as string)
  .then(() => console.log("MongoDB connected"))
  .catch((err: any) => console.error("MongoDB connection error:", err));

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


app.listen(PORT, () => console.log(`server listening on port ${PORT}`));




