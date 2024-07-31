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
exports.login = exports.create_acct = void 0;
const User_model_1 = __importDefault(require("../models/User.model"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const dotenv_1 = __importDefault(require("dotenv"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
dotenv_1.default.config();
const create_acct = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { firstName, lastName, email, password } = req.body;
    if (!firstName) {
        return res
            .status(400)
            .json({ error: true, message: "Full Name is required" });
    }
    if (!lastName) {
        return res
            .status(400)
            .json({ error: true, message: "Full Name is required" });
    }
    if (!email) {
        return res.status(400).json({
            error: true,
            message: "User email is required for registration",
        });
    }
    if (!password) {
        return res
            .status(400)
            .json({ error: true, message: "Please provide a valid password" });
    }
    try {
        const isUser = yield User_model_1.default.findOne({ email });
        if (isUser) {
            console.log(isUser);
            return res.json({
                error: true,
                message: "User already exists",
            });
        }
        const hashedPwd = bcryptjs_1.default.hashSync(password, 10);
        const user = new User_model_1.default({
            firstName,
            lastName,
            email,
            password: hashedPwd,
        });
        yield user.save();
        return res.json({
            error: false,
            user,
            message: "Registration Successful",
        });
    }
    catch (e) {
        return res.json({
            error: true,
            e,
            message: "internal server error",
        });
    }
});
exports.create_acct = create_acct;
const login = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { email, password } = req.body;
    if (!email) {
        return res.status(400).json({
            error: true,
            message: "User email is required for registration",
        });
    }
    if (!password) {
        return res
            .status(400)
            .json({ error: true, message: "Please provide a valid password" });
    }
    console.log("Access Token Secret:", process.env.ACCESS_SECRET_TOKEN);
    try {
        const user = yield User_model_1.default.findOne({ email });
        if (!user) {
            return res
                .status(404)
                .json({ error: true, message: "Account does not exist" });
        }
        const passwordMatch = yield bcryptjs_1.default.compare(password, user.password);
        if (!passwordMatch) {
            return res
                .status(400)
                .json({ error: true, message: "Password is incorrect" });
        }
        const maxAge = 60 * 60 * 2;
        const secret = process.env.ACCESS_SECRET_TOKEN;
        if (!secret) {
            throw new Error("Secret key is not defined in environment variables.");
        }
        const token = jsonwebtoken_1.default.sign({ id: user._id }, secret, {
            expiresIn: maxAge,
        });
        return res
            .status(200)
            .json({ error: false, message: "Login successful", user, token });
    }
    catch (error) {
        console.error("Login Error:", error); // Log the error to console
        return res.status(500).json({
            error: true,
            message: "Something went wrong",
            err: error,
        });
    }
});
exports.login = login;
