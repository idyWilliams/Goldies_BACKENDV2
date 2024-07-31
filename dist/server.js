"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const app = (0, express_1.default)();
const authRoute_1 = __importDefault(require("./routes/authRoute"));
const userRoute_1 = __importDefault(require("./routes/userRoute"));
const mongoose_1 = __importDefault(require("mongoose"));
const cors_1 = __importDefault(require("cors"));
const PORT = process.env.PORT || 2030;
app.use((0, cors_1.default)());
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
app.listen(PORT, () => console.log(`server listening on port ${PORT}`));
