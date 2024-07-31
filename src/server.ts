import express from "express";
import dotenv from "dotenv";
dotenv.config();
const app = express();
import authRouter from "./routes/authRoute";
import userRouter from "./routes/userRoute";
import mongoose from "mongoose";

const PORT = process.env.PORT || 2030;

app.use(express.json());

mongoose
  .connect(process.env.connectionString as string)
  .then(() => console.log("MongoDB connected"))
  .catch((err: any) => console.log(err));

app.get("/", (req, res) => {
  res.send("backend connected successfully");
});

app.use("/api/auth", authRouter);
app.use("/api/user", userRouter);

app.listen(PORT, () => console.log(`server listening on port ${PORT}`));
