"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.logout = exports.resetPassword = exports.forgottenPassword = exports.login = exports.create_acct = void 0;
const User_model_1 = __importDefault(require("../models/User.model"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const dotenv_1 = __importDefault(require("dotenv"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
dotenv_1.default.config();
const nodemailer_1 = __importDefault(require("nodemailer"));
const create_acct = async (req, res) => {
    const { firstName, lastName, email, password, phoneNumber } = req.body;
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
    if (!phoneNumber) {
        return res
            .status(400)
            .json({ error: true, message: "Phone Number is required" });
    }
    try {
        const isUser = await User_model_1.default.findOne({ email });
        if (isUser) {
            console.log(isUser);
            return res.status(409).json({
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
            phoneNumber
        });
        await user.save();
        return res.json({
            error: false,
            user: {
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email,
                phoneNumber: user.phoneNumber,
                _id: user._id,
            },
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
};
exports.create_acct = create_acct;
const login = async (req, res) => {
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
        const user = await User_model_1.default.findOne({ email });
        if (!user) {
            return res
                .status(404)
                .json({ error: true, message: "Email or Password is incorrect" });
        }
        const passwordMatch = await bcryptjs_1.default.compare(password, user.password);
        if (!passwordMatch) {
            return res
                .status(400)
                .json({ error: true, message: "Email or Password is incorrect" });
        }
        const maxAge = 60 * 60 * 2;
        const secret = process.env.ACCESS_SECRET_TOKEN;
        if (!secret) {
            throw new Error("Secret key is not defined in environment variables.");
        }
        const token = jsonwebtoken_1.default.sign({ id: user._id }, secret, {
            expiresIn: maxAge,
        });
        const refreshToken = jsonwebtoken_1.default.sign({ id: user._id }, secret, {
            expiresIn: '7d',
        });
        return res.status(200).json({
            error: false,
            message: "Login successful",
            user: {
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email,
                _id: user._id,
            },
            token,
            refreshToken
        });
    }
    catch (error) {
        console.error("Login Error:", error); // Log the error to console
        return res.status(500).json({
            error: true,
            message: "Something went wrong",
            err: error,
        });
    }
};
exports.login = login;
const forgottenPassword = async (req, res) => {
    try {
        const { email } = req.body;
        const user = await User_model_1.default.findOne({ email }).select('+emailToken +emailTokenExpires');
        if (!user) {
            return res.status(404).json({
                error: true,
                message: "Account does not exist"
            });
        }
        // Generate 6-digit OTP
        const otp = generateOtp();
        const otpExpiry = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes expiry
        await User_model_1.default.updateOne({ _id: user._id }, {
            $set: {
                emailToken: otp,
                emailTokenExpires: otpExpiry
            }
        });
        const resetUrl = `${process.env.FRONTEND_URL}/reset_password/${otp}?email=${email}`;
        // Create email transporter
        const transporter = nodemailer_1.default.createTransport({
            host: "smtp.gmail.com",
            port: 465,
            secure: true,
            auth: {
                user: process.env.EMAIL,
                pass: process.env.PASSWORD,
            },
            tls: {
                rejectUnauthorized: false,
            },
        });
        const emailContent = `
    <div style="font-family: Arial, sans-serif; color: #333;">
      <h2 style="color: #007bff;">Password Reset Request</h2>
      <p>You requested a password reset. Please click the link below to reset your password:</p>
      <a 
        href="${resetUrl}" 
        style="display: inline-block; padding: 10px 20px; background-color: #007bff; color: #fff; text-decoration: none; border-radius: 5px;">
        Reset Password
      </a>
      <p>This link expires in 15 minutes</p>
      <p>If you did not request this, please ignore this email.</p>
    </div>
  `;
        const mailOptions = {
            from: process.env.EMAIL,
            to: email,
            subject: "Password Reset OTP",
            html: emailContent,
        };
        await transporter.sendMail(mailOptions);
        return res.status(200).json({
            error: false,
            message: "OTP sent to your email",
        });
    }
    catch (error) {
        console.error("Error in forgottenPassword:", error);
        return res.status(500).json({
            error: true,
            message: "Something went wrong",
        });
    }
};
exports.forgottenPassword = forgottenPassword;
const resetPassword = async (req, res) => {
    const { emailToken, password } = req.body;
    try {
        // Validate inputs
        if (!emailToken || !password) {
            return res.status(400).json({
                error: true,
                message: "Email token and new password are required"
            });
        }
        // Find user with valid OTP
        const user = await User_model_1.default.findOne({
            emailToken,
            emailTokenExpires: { $gt: new Date() }
        });
        if (!user) {
            return res.status(401).json({
                error: true,
                message: "Invalid OTP or OTP has expired"
            });
        }
        // Check if new password is different from current password
        const isSamePassword = bcryptjs_1.default.compareSync(password, user.password);
        if (isSamePassword) {
            return res.status(400).json({
                error: true,
                message: "New password cannot be the same as current password"
            });
        }
        // Update password and clear OTP fields
        const hashedPassword = bcryptjs_1.default.hashSync(password, 10);
        await User_model_1.default.updateOne({ _id: user._id }, {
            $set: { password: hashedPassword },
            $unset: { emailToken: "", emailTokenExpires: "" }
        });
        return res.status(200).json({
            error: false,
            message: "Password changed successfully",
        });
    }
    catch (error) {
        console.error("Error in resetPassword:", error);
        return res.status(500).json({
            error: true,
            message: "Internal server error",
        });
    }
};
exports.resetPassword = resetPassword;
// Generate 6-digit OTP
function generateOtp() {
    const digits = "0123456789";
    let otp = "";
    for (let i = 0; i < 6; i++) {
        otp += digits[Math.floor(Math.random() * 10)];
    }
    return otp;
}
const logout = async (req, res) => {
    try {
        const token = req.headers.authorization?.split(" ")[1];
        if (!token) {
            return res.status(400).json({
                error: true,
                message: "No token provided",
            });
        }
        return res.status(200).json({
            error: false,
            message: "Logout successful",
        });
    }
    catch (error) {
        return res.status(500).json({
            error: true,
            message: "Internal server error. Please try again.",
        });
    }
};
exports.logout = logout;
//# sourceMappingURL=authController.js.map