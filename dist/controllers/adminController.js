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
exports.adminLogout = exports.refreshAccessToken = exports.getAdminById = exports.getAllAdmins = exports.revokeAdminAccess = exports.unblockAdminAccess = exports.verifyAdmin = exports.deleteAdmin = exports.getUserOrderByUserId = exports.getAdmin = exports.updateProfile = exports.resetPassword = exports.forgotPassword = exports.adminLogin = exports.verifyOTP = exports.adminSignup = exports.inviteAdmin = exports.generateRefreshToken = void 0;
const Admin_model_1 = __importDefault(require("../models/Admin.model"));
const dotenv_1 = __importDefault(require("dotenv"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
dotenv_1.default.config();
const mongoose_1 = __importDefault(require("mongoose"));
const nodemailer_1 = __importDefault(require("nodemailer"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const Order_model_1 = __importDefault(require("../models/Order.model"));
const auth_middleware_1 = require("../middleware/auth.middleware");
const notificationService_1 = require("../service/notificationService");
// Configure transporter for sending emails
const configureTransporter = () => {
    return nodemailer_1.default.createTransport({
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
};
// Helper function to send admin action emails
const sendAdminActionEmail = (targetAdminEmail, action, performer, reason) => __awaiter(void 0, void 0, void 0, function* () {
    const transporter = configureTransporter();
    const isPerformerSelf = performer.id === targetAdminEmail;
    const performerText = isPerformerSelf ? "you" : performer.name;
    const emailTitle = {
        revoked: "🚫 Admin Access Revoked",
        unblocked: "✅ Admin Access Restored",
        deleted: "❌ Admin Account Deleted",
        verified: "✓ Admin Account Verified",
    }[action] || "Admin Account Update";
    const actionDescription = {
        revoked: "Your admin access to Cake App has been revoked",
        unblocked: "Your admin access to Cake App has been restored",
        deleted: "Your admin account in Cake App has been deleted",
        verified: "Your admin account in Cake App has been verified",
    }[action] || "Your admin account has been updated";
    const actionColor = {
        revoked: "#FF5757",
        unblocked: "#57C057",
        deleted: "#D12F2F",
        verified: "#3E8ED0",
    }[action] || "#D18237";
    const emailContent = `
    <div style="font-family: 'Helvetica Neue', Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #FFF9EE; border-radius: 10px; border: 5px solid #63340C;">
      <div style="text-align: center; padding: 15px 0;">
        <h1 style="color: #63340C; font-size: 28px; margin-bottom: 5px; font-family: 'Georgia', serif;">🧁 Cake App 🧁</h1>
        <h2 style="color: ${actionColor}; font-size: 22px; margin-top: 0;">${emailTitle}</h2>
      </div>

      <div style="background-color: #FFFFFF; border-radius: 8px; padding: 20px; margin: 20px 0; border-left: 4px solid ${actionColor};">
        <p style="color: #63340C; font-size: 16px; line-height: 1.6;">${actionDescription} by <strong style="color: #D18237;">${performerText}</strong>.</p>

        ${reason
        ? `<p style="color: #63340C; font-size: 16px; line-height: 1.6;"><strong>Reason:</strong> ${reason}</p>`
        : ""}

        <p style="color: #63340C; font-size: 16px; line-height: 1.6;">If you have any questions about this action, please contact your system administrator.</p>
      </div>

      <div style="background-color: #F9E7D2; padding: 15px; border-radius: 8px; margin-top: 20px; font-size: 14px; color: #63340C; text-align: center;">
        <p style="margin: 5px 0;">This is an automated notification from the Cake App admin system.</p>
        <p style="margin: 5px 0;">Please do not reply to this email.</p>
      </div>

      <div style="text-align: center; margin-top: 20px; padding-top: 15px; border-top: 2px dashed #D18237;">
        <p style="color: #63340C; font-size: 14px;">Cake App Admin Team</p>
        <p style="color: #8B5927; font-size: 12px;">Making every day a little sweeter 🍰</p>
      </div>
    </div>
  `;
    const mailOptions = {
        from: process.env.EMAIL,
        to: targetAdminEmail,
        subject: `${emailTitle} | Cake App`,
        text: `${actionDescription} by ${performerText}. ${reason ? `Reason: ${reason}` : ""}`,
        html: emailContent,
    };
    try {
        const info = yield transporter.sendMail(mailOptions);
        console.log(`Admin action email sent: ${info.messageId}`);
        return true;
    }
    catch (error) {
        console.error("Error sending admin action email:", error);
        return false;
    }
});
// Helper function to create and send notifications for admin actions
const notifyAdmins = (req, action, targetAdmin, performer, reason) => __awaiter(void 0, void 0, void 0, function* () {
    if (!req.io) {
        console.warn("Socket.io instance not available, skipping notifications");
        return;
    }
    const notificationService = new notificationService_1.NotificationService(req.io);
    const isPerformerSelf = performer.id === targetAdmin._id.toString();
    const performerText = isPerformerSelf ? "you" : performer.name;
    const actionVerb = {
        revoked: "revoked",
        unblocked: "restored",
        deleted: "deleted",
        verified: "verified",
    }[action] || "updated";
    const message = `Admin ${targetAdmin.userName}'s (${targetAdmin.role}) access has been ${actionVerb} by ${performerText}${reason ? `: ${reason}` : ""}`;
    // Notify all super admins except the target admin
    const adminNotification = {
        title: `Admin ${action.charAt(0).toUpperCase() + action.slice(1)}`,
        message,
        type: "admin",
        visibility: "super_admin",
        recipientId: "",
        relatedId: targetAdmin._id.toString(),
    };
    // Create notification for all admins
    //@ts-ignore
    yield notificationService.createNotification(adminNotification);
    console.log(`Admin action notification sent: ${action} on ${targetAdmin.userName}`);
});
const inviteAdmin = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { email, role } = req.body;
    try {
        const refCode = process.env.ADMINREFCODE;
        const maxAge = 60 * 15;
        const token = jsonwebtoken_1.default.sign({ email, role }, refCode, {
            expiresIn: maxAge,
        });
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
        const SignUpURL = `${process.env.FRONTEND_URL}/admin-signup?refCode=${token}&email=${email}&role=${role}`;
        const emailContent = `
    <div style="font-family: 'Helvetica Neue', Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #FFF9EE; border-radius: 10px; border: 5px solid #63340C;">
      <div style="text-align: center; padding: 15px 0;">
        <h1 style="color: #63340C; font-size: 28px; margin-bottom: 5px; font-family: 'Georgia', serif;">🧁 Cake App 🧁</h1>
        <h2 style="color: #D18237; font-size: 22px; margin-top: 0;">Admin Team Invitation</h2>
      </div>

      <div style="background-color: #FFFFFF; border-radius: 8px; padding: 20px; margin: 20px 0; border-left: 4px solid #D18237;">
        <p style="color: #63340C; font-size: 16px; line-height: 1.6;">Sweet news! You've been invited to join the Cake App team as a <strong style="color: #D18237;">${role}</strong>!</p>

        <p style="color: #63340C; font-size: 16px; line-height: 1.6;">Your expertise will help us create the perfect recipe for success. Together, we'll make Cake App the most delightful cake experience for our customers!</p>
      </div>

      <div style="text-align: center; margin: 25px 0;">
        <a href="${SignUpURL}" style="display: inline-block; padding: 12px 28px; background: linear-gradient(to right, #63340C, #D18237); color: #FFF9EE; text-decoration: none; border-radius: 25px; font-weight: bold; font-size: 16px; box-shadow: 0 4px 8px rgba(99, 52, 12, 0.2);">
          Join Our Sweet Team
        </a>
      </div>

      <div style="background-color: #F9E7D2; padding: 15px; border-radius: 8px; margin-top: 20px; font-size: 14px; color: #63340C; text-align: center;">
        <p style="margin: 5px 0;">This invitation expires in 15 minutes.</p>
        <p style="margin: 5px 0;">If you didn't expect this invitation, please ignore this email.</p>
      </div>

      <div style="text-align: center; margin-top: 20px; padding-top: 15px; border-top: 2px dashed #D18237;">
        <p style="color: #63340C; font-size: 14px;">With love from the Cake App Team</p>
        <p style="color: #8B5927; font-size: 12px;">Making every day a little sweeter 🍰</p>
      </div>
    </div>
  `;
        const mailOptions = {
            from: process.env.EMAIL,
            to: email,
            subject: "🧁 Join the Cake App Admin Team!",
            text: `Sweet news! You've been invited to join the Cake App team as a ${role}! Your expertise will help us create the perfect recipe for success. Together, we'll make Cake App the most delightful cake experience for our customers! To accept this invitation, please visit: ${SignUpURL} (This invitation expires in 15 minutes)`,
            html: emailContent,
        };
        const info = yield transporter.sendMail(mailOptions);
        console.log("Message sent: %s", info.messageId);
        return res.status(200).json({
            error: false,
            message: "Invitation sent successfully",
            info: info.messageId,
        });
    }
    catch (error) {
        return res.status(500).json({
            error: true,
            err: error,
            message: "Internal server error",
        });
    }
});
exports.inviteAdmin = inviteAdmin;
function generateOtp() {
    const digit = "0123456789";
    let otp = "";
    for (let i = 0; i < 6; i++) {
        otp += digit[Math.floor(Math.random() * digit.length)];
    }
    return otp;
}
const generateToken = (id) => {
    const maxAge = "30m";
    const secret = process.env.ACCESS_SECRET_TOKEN;
    if (!secret) {
        throw new Error("Secret key is not defined in environment variables.");
    }
    const token = jsonwebtoken_1.default.sign({ id }, secret, {
        expiresIn: maxAge,
    });
    return token;
};
// Generate refresh token (7d expiry)
const generateRefreshToken = (id) => {
    return jsonwebtoken_1.default.sign({ id }, process.env.REFRESH_SECRET_TOKEN, {
        expiresIn: "7d",
    });
};
exports.generateRefreshToken = generateRefreshToken;
const adminSignup = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { userName, email, password } = req.body;
    const { refCode } = req.query;
    if (!userName) {
        return res.status(400).json({
            error: true,
            message: "Username is required for this process",
        });
    }
    if (!email) {
        return res.status(400).json({
            error: true,
            message: "Email is required for this process",
        });
    }
    if (!password) {
        return res.status(400).json({
            error: true,
            message: "Password is required for this process",
        });
    }
    try {
        const user = yield Admin_model_1.default.findOne({ email });
        const OTP = generateOtp(); // Generates a 6-digit OTP
        // Create transporter for sending email
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
        // Function to send the verification email
        const sendVerificationEmail = () => __awaiter(void 0, void 0, void 0, function* () {
            const emailContent = `
      <div style="font-family: Arial, sans-serif; color: #333;">
        <h2 style="color: #007bff;">Email Verification</h2>
        <p>Do not share this with anyone.</p>
        <p>Verification code: <strong>${OTP}</strong></p>
        <p>If you did not request this, please ignore this email.</p>
      </div>
    `;
            const mailOptions = {
                from: process.env.EMAIL,
                to: email,
                subject: "Cake App Team - Email Verification",
                text: "Email verification.",
                html: emailContent,
            };
            try {
                const info = yield transporter.sendMail(mailOptions);
                console.log("Message sent: %s", info.messageId);
            }
            catch (err) {
                console.error("Error sending email: ", err);
                throw new Error("Failed to send verification email.");
            }
        });
        // If user does not exist, create new admin
        if (!user) {
            // Default role
            let role = "admin";
            // Verify JWT referral code and extract role if available
            if (refCode) {
                try {
                    const decodedToken = jsonwebtoken_1.default.verify(refCode, process.env.ADMINREFCODE);
                    // Check if the email in token matches the signup email
                    if (decodedToken.email === email) {
                        // Use the role from invitation
                        role = decodedToken.role;
                        console.log(`Using role from invitation: ${role}`);
                    }
                    else {
                        return res.status(403).json({
                            error: true,
                            message: "Email does not match the invitation.",
                        });
                    }
                }
                catch (err) {
                    return res.status(403).json({
                        error: true,
                        message: "Invalid or expired referral code.",
                    });
                }
            }
            else {
                // No refCode provided - this might be an unauthorized signup attempt
                return res.status(403).json({
                    error: true,
                    message: "Admin signup requires a valid invitation code.",
                });
            }
            const hashedPwd = bcryptjs_1.default.hashSync(password, 10);
            const admin = yield Admin_model_1.default.create({
                userName,
                email,
                password: hashedPwd,
                role, // Use the extracted role
                OTP,
            });
            console.log(`Admin created with role: ${role}`);
            // Send verification email
            yield sendVerificationEmail();
            if (req.io) {
                const notificationService = new notificationService_1.NotificationService(req.io);
                // Get all super admins
                const superAdmins = yield Admin_model_1.default.find({
                    role: "super_admin",
                    isDeleted: false,
                    isBlocked: false,
                }).select("_id");
                // Create and send notification to each super admin
                yield notificationService.createNotification({
                    title: "New Admin Registration",
                    message: `New admin registered: ${userName} (${email}) with role: ${role}`,
                    type: "user",
                    visibility: "super_admin", // Only super admins will see this
                    relatedId: admin === null || admin === void 0 ? void 0 : admin._id.toString(), // Link to the new admin's ID
                });
                console.log(`Notification sent to ${superAdmins.length} super admins`);
            }
            return res.status(201).json({
                error: false,
                message: `Admin created successfully with role: ${role}. A 6-digit code has been sent to ${email}`,
            });
        }
        else {
            // Verify the password
            const passwordMatch = yield bcryptjs_1.default.compare(password, user.password);
            if (!passwordMatch) {
                return res.status(400).json({
                    error: true,
                    message: "Password is incorrect",
                });
            }
            // Update OTP and send verification email
            user.OTP = OTP;
            yield user.save();
            yield sendVerificationEmail();
            return res.status(200).json({
                error: false,
                message: `A new 6-digit code has been sent to ${email}`,
            });
        }
    }
    catch (error) {
        console.error("Error in admin signup: ", error);
        return res.status(500).json({
            error: true,
            message: "Internal server error",
        });
    }
});
exports.adminSignup = adminSignup;
const verifyOTP = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { email, otp } = req.body;
    try {
        const admin = yield Admin_model_1.default.findOne({ email });
        if (!admin) {
            return res.status(404).json({
                error: true,
                message: "Admin not found",
            });
        }
        if (String(otp) !== String(admin.OTP)) {
            return res.status(401).json({
                error: true,
                message: "Wrong OTP",
            });
        }
        admin.isVerified = true;
        const refreshToken = (0, exports.generateRefreshToken)(admin._id.toString());
        // const hashedRefreshToken = await bcryptjs.hash(refreshToken, 10);
        // admin.refreshToken = hashedRefreshToken;
        // await admin.save();
        try {
            const hashedRefreshToken = yield bcryptjs_1.default.hash(refreshToken, 10);
            admin.refreshToken = hashedRefreshToken;
            yield admin.save();
        }
        catch (saveError) {
            console.error("Token Hashing/Save Error:", saveError);
            return res.status(500).json({
                error: true,
                message: "Failed to persist session",
            });
        }
        res.cookie("refreshToken", refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
            maxAge: 7 * 24 * 60 * 60 * 1000,
        });
        const token = generateToken(admin._id);
        return res.status(200).json({
            error: false,
            admin: {
                id: admin._id,
                userName: admin.userName,
                email: admin.email,
                role: admin.role,
                isVerified: admin.isVerified,
            },
            token,
            message: `Admin Signup successful`,
        });
    }
    catch (error) {
        console.error("VerifyOTP Error:", error);
        return res.status(500).json(Object.assign({ error: true, err: error, message: "Internal server error" }, (process.env.NODE_ENV === "development" && { debug: error })));
    }
});
exports.verifyOTP = verifyOTP;
const refreshAccessToken = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { refreshToken } = req.cookies;
    if (!refreshToken) {
        return res.status(401).json({ error: true, message: "No refresh token" });
    }
    try {
        // Decode the refresh token
        const decoded = jsonwebtoken_1.default.verify(refreshToken, process.env.REFRESH_SECRET_TOKEN);
        // Find the admin
        const admin = yield Admin_model_1.default.findById(decoded.id);
        if (!admin || !admin.refreshToken) {
            return res.status(403).json({ error: true, message: "Invalid token" });
        }
        // Compare the provided refresh token with the hashed one in the DB
        const isValid = yield bcryptjs_1.default.compare(refreshToken, admin.refreshToken);
        if (!isValid) {
            return res.status(403).json({ error: true, message: "Invalid token" });
        }
        // Generate new access token
        const newAccessToken = jsonwebtoken_1.default.sign({ id: admin._id }, process.env.ACCESS_SECRET_TOKEN, { expiresIn: "30m" });
        res.json({ accessToken: newAccessToken });
    }
    catch (error) {
        return res.status(403).json({ error: true, message: "Invalid token" });
    }
});
exports.refreshAccessToken = refreshAccessToken;
const adminLogin = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { email, password } = req.body;
    if (!email || !password) {
        return res.status(400).json({
            error: true,
            message: `${!email ? "Email" : "Password"} is required`,
        });
    }
    try {
        const admin = yield Admin_model_1.default.findOne({ email });
        const OTP = generateOtp(); // Generates a 6-digit OTP
        // Create transporter for sending email
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
        // Function to send the verification email
        const sendVerificationEmail = () => __awaiter(void 0, void 0, void 0, function* () {
            const emailContent = `
      <div style="font-family: Arial, sans-serif; color: #333;">
        <h2 style="color: #007bff;">Email Verification</h2>
        <p>Do not share this with anyone.</p>
        <p>Verification code: <strong>${OTP}</strong></p>
        <p>If you did not request this, please ignore this email.</p>
      </div>
    `;
            const mailOptions = {
                from: process.env.EMAIL,
                to: email,
                subject: "Cake App Team - Email Verification",
                text: "Email verification.",
                html: emailContent,
            };
            try {
                const info = yield transporter.sendMail(mailOptions);
                console.log("Message sent: %s", info.messageId, OTP);
            }
            catch (err) {
                console.error("Error sending email: ", err);
                throw new Error("Failed to send verification email.");
            }
        });
        if (!admin) {
            return res.status(404).json({
                error: true,
                message: "Admin not found",
            });
        }
        if (admin.isBlocked) {
            return res.status(403).json({
                error: true,
                message: "Your account has been blocked. Contact the super admin.",
            });
        }
        if (!admin.isVerified) {
            return res.status(401).json({
                error: true,
                message: "Please verify your email first",
            });
        }
        const isValidPassword = yield bcryptjs_1.default.compare(password, admin.password);
        if (!isValidPassword) {
            return res.status(401).json({
                error: true,
                message: "Incorrect Password",
            });
        }
        admin.OTP = OTP;
        yield admin.save();
        yield sendVerificationEmail();
        const token = generateToken(admin._id);
        return res.status(200).json({
            error: false,
            data: {
                id: admin._id,
                userName: admin.userName,
                email: admin.email,
                role: admin.role,
            },
            token,
            message: "Login successful",
        });
    }
    catch (error) {
        console.error("Login error:", error);
        return res.status(500).json({
            error: true,
            message: "Internal server error",
        });
    }
});
exports.adminLogin = adminLogin;
const adminLogout = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    const admin = yield Admin_model_1.default.findOne({ _id: id });
    if (admin) {
        admin.refreshToken = null;
        yield admin.save();
    }
    res.clearCookie("refreshToken");
    res.status(200).json({ message: "Logged out successfully" });
});
exports.adminLogout = adminLogout;
const forgotPassword = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { email } = req.body;
    if (!email) {
        return res.status(400).json({
            error: true,
            message: "Email is required",
        });
    }
    try {
        const admin = yield Admin_model_1.default.findOne({ email });
        if (!admin) {
            return res.status(404).json({
                error: true,
                message: "Admin not found",
            });
        }
        const resetToken = jsonwebtoken_1.default.sign({ id: admin._id }, process.env.RESET_SECRET_TOKEN, { expiresIn: "15m" });
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
        const resetURL = `${process.env.ADMIN_RESET_PASSWORD}?token=${resetToken}`;
        const emailContent = `
      <div style="font-family: Arial, sans-serif; color: #333;">
        <h2 style="color: #007bff;">Password Reset Request</h2>
        <p>Click the button below to reset your password. This link will expire in 15 minutes.</p>
        <a href="${resetURL}"
           style="display: inline-block; padding: 10px 20px; background-color: #007bff; color: #fff; text-decoration: none; border-radius: 5px;">
          Reset Password
        </a>
        <p>If you did not request this, please ignore this email.</p>
      </div>
    `;
        yield transporter.sendMail({
            from: process.env.EMAIL,
            to: email,
            subject: "Password Reset Request",
            html: emailContent,
        });
        return res.status(200).json({
            error: false,
            message: "Password reset link sent to email",
        });
    }
    catch (error) {
        console.error("Forgot password error:", error);
        return res.status(500).json({
            error: true,
            message: "Internal server error",
        });
    }
});
exports.forgotPassword = forgotPassword;
const resetPassword = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { token, newPassword } = req.body;
    if (!token || !newPassword) {
        return res.status(400).json({
            error: true,
            message: "Token and new password are required",
        });
    }
    try {
        const decoded = jsonwebtoken_1.default.verify(token, process.env.RESET_SECRET_TOKEN);
        const admin = yield Admin_model_1.default.findById(decoded.id);
        if (!admin) {
            return res.status(404).json({
                error: true,
                message: "Admin not found",
            });
        }
        const hashedPassword = yield bcryptjs_1.default.hash(newPassword, 10);
        admin.password = hashedPassword;
        yield admin.save();
        return res.status(200).json({
            error: false,
            message: "Password reset successful",
        });
    }
    catch (error) {
        if (error instanceof jsonwebtoken_1.default.TokenExpiredError) {
            return res.status(401).json({
                error: true,
                message: "Reset link has expired",
            });
        }
        console.error("Reset password error:", error);
        return res.status(500).json({
            error: true,
            message: "Internal server error",
        });
    }
});
exports.resetPassword = resetPassword;
const updateProfile = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    const { userName, currentPassword, newPassword } = req.body;
    try {
        const admin = yield Admin_model_1.default.findById(id);
        if (!admin) {
            return res.status(404).json({
                error: true,
                message: "Admin not found",
            });
        }
        // Update username if provided
        if (userName) {
            const existingAdmin = yield Admin_model_1.default.findOne({ userName, _id: { $ne: id } });
            if (existingAdmin) {
                return res.status(400).json({
                    error: true,
                    message: "Username already taken",
                });
            }
            admin.userName = userName;
        }
        // Update password if provided
        if (currentPassword && newPassword) {
            const isValidPassword = yield bcryptjs_1.default.compare(currentPassword, admin.password);
            if (!isValidPassword) {
                return res.status(401).json({
                    error: true,
                    message: "Current password is incorrect",
                });
            }
            admin.password = yield bcryptjs_1.default.hash(newPassword, 10);
        }
        yield admin.save();
        return res.status(200).json({
            error: false,
            data: {
                id: admin._id,
                userName: admin.userName,
                email: admin.email,
                role: admin.role,
            },
            message: "Profile updated successfully",
        });
    }
    catch (error) {
        console.error("Update profile error:", error);
        return res.status(500).json({
            error: true,
            message: "Internal server error",
        });
    }
});
exports.updateProfile = updateProfile;
const getAdmin = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    console.log(id);
    try {
        const admin = yield Admin_model_1.default.findOne({ _id: id });
        if (!admin) {
            return res.status(404).json({
                error: true,
                message: "Admin not found",
            });
        }
        return res.status(200).json({
            error: false,
            admin,
        });
    }
    catch (err) {
        return res.status(500).json({
            error: true,
            err,
            message: "Internal Server error",
        });
    }
});
exports.getAdmin = getAdmin;
const getAllAdmins = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Logging for debugging
        console.log("Full Query Parameters:", req.query);
        // Safely parse pagination and limit
        const page = Math.max(1, parseInt(req.query.page) || 1);
        const limit = Math.max(1, parseInt(req.query.limit) || 10);
        const sortField = req.query.sortField || "createdAt";
        const sortOrder = req.query.sortOrder === "asc" ? 1 : -1;
        const search = req.query.search;
        console.log("Parsed Parameters:", { page, limit, sortField, sortOrder });
        const skip = (page - 1) * limit;
        // Create a robust filter object
        const filter = {};
        // Add search conditions
        if (search) {
            filter.$or = [
                { userName: { $regex: search, $options: "i" } },
                { email: { $regex: search, $options: "i" } },
            ];
        }
        // Add additional filter conditions
        if (req.query.role) {
            filter.role = req.query.role;
        }
        if (req.query.status) {
            filter.status = req.query.status;
        }
        if (req.query.isActive !== undefined) {
            filter.isActive = req.query.isActive === "true";
        }
        // Date range filtering
        if (req.query.startDate || req.query.endDate) {
            filter.createdAt = {};
            if (req.query.startDate) {
                filter.createdAt.$gte = new Date(req.query.startDate);
            }
            if (req.query.endDate) {
                filter.createdAt.$lte = new Date(req.query.endDate);
            }
        }
        // Prepare sort object
        const sort = {};
        sort[sortField] = sortOrder;
        try {
            // Count total documents matching the filter
            const totalAdmins = yield Admin_model_1.default.countDocuments(filter);
            console.log("Total Admins Count:", totalAdmins);
            // Find admins with pagination and sorting
            const admins = yield Admin_model_1.default.find(filter)
                .select("-password -OTP") // Exclude sensitive fields
                .sort(sort)
                .skip(skip)
                .limit(limit);
            console.log("Fetched Admins Count:", admins.length);
            return res.status(200).json({
                error: false,
                admins,
                pagination: {
                    total: totalAdmins,
                    page,
                    limit,
                    pages: Math.ceil(totalAdmins / limit),
                },
            });
        }
        catch (findError) {
            if (findError instanceof Error) {
                console.error("Database Query Error:", findError.message);
                console.error("Full Error:", findError);
                return res.status(500).json({
                    error: true,
                    message: "Database query failed",
                    details: findError.message,
                });
            }
            else {
                console.error("Unknown Database Error:", findError);
                return res.status(500).json({
                    error: true,
                    message: "Unexpected database error",
                    details: String(findError),
                });
            }
        }
    }
    catch (error) {
        if (error instanceof Error) {
            console.error("Unexpected Server Error:", error.message);
            console.error("Full Error:", error);
            return res.status(500).json({
                error: true,
                message: "Internal server error",
                details: error.message,
            });
        }
        else {
            console.error("Unknown Server Error:", error);
            return res.status(500).json({
                error: true,
                message: "Unknown internal server error",
                details: String(error),
            });
        }
    }
});
exports.getAllAdmins = getAllAdmins;
const getAdminById = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    try {
        const admin = yield Admin_model_1.default.findById(id);
        if (!admin) {
            return res.status(404).json({
                error: true,
                message: "Admin not found",
            });
        }
        return res.status(200).json({
            error: false,
            admin,
        });
    }
    catch (error) {
        return res.status(500).json({
            error: true,
            message: "Internal server error",
        });
    }
});
exports.getAdminById = getAdminById;
const revokeAdminAccess = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    const { reason } = req.body;
    const performer = (0, auth_middleware_1.getAdminIdentifier)(req);
    try {
        const admin = yield Admin_model_1.default.findById(id);
        if (!admin) {
            return res.status(404).json({
                error: true,
                message: "Admin not found",
            });
        }
        // Prevent self-blocking
        if (performer.id === id) {
            return res.status(400).json({
                error: true,
                message: "You cannot block your own account",
            });
        }
        // Only update if not already blocked
        if (!admin.isBlocked) {
            admin.isBlocked = true;
            // Add status change record with admin name
            admin.statusChanges.push({
                status: "blocked",
                timestamp: new Date(),
                adminId: performer.id,
                adminName: performer.name,
                reason: reason || `Access revoked by ${performer.name}`,
            });
            yield admin.save();
            // Send notification to all super admins
            yield notifyAdmins(req, "revoked", admin, performer, reason);
            // Send email to the affected admin
            yield sendAdminActionEmail(admin.email, "revoked", performer, reason);
        }
        return res.status(200).json({
            error: false,
            message: "Admin access revoked successfully",
        });
    }
    catch (error) {
        console.error("Error in revokeAdminAccess:", error);
        return res.status(500).json({
            error: true,
            message: "Internal server error",
        });
    }
});
exports.revokeAdminAccess = revokeAdminAccess;
const unblockAdminAccess = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    const { reason } = req.body;
    const performer = (0, auth_middleware_1.getAdminIdentifier)(req);
    try {
        const admin = yield Admin_model_1.default.findById(id);
        if (!admin) {
            return res.status(404).json({
                error: true,
                message: "Admin not found",
            });
        }
        // Only update if currently blocked
        if (admin.isBlocked) {
            admin.isBlocked = false;
            // Add status change record with admin name
            admin.statusChanges.push({
                status: "unblocked",
                timestamp: new Date(),
                adminId: performer.id,
                adminName: performer.name,
                reason: reason || `Access restored by ${performer.name}`,
            });
            yield admin.save();
            // Send notification to all super admins
            yield notifyAdmins(req, "unblocked", admin, performer, reason);
            // Send email to the affected admin
            yield sendAdminActionEmail(admin.email, "unblocked", performer, reason);
        }
        return res.status(200).json({
            error: false,
            message: "Admin access unblocked successfully",
        });
    }
    catch (error) {
        console.error("Error in unblockAdminAccess:", error);
        return res.status(500).json({
            error: true,
            message: "Internal server error",
        });
    }
});
exports.unblockAdminAccess = unblockAdminAccess;
const deleteAdmin = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    const { reason } = req.body;
    const performer = (0, auth_middleware_1.getAdminIdentifier)(req);
    try {
        const admin = yield Admin_model_1.default.findById(id);
        if (!admin) {
            return res.status(404).json({
                error: true,
                message: "Admin not found",
            });
        }
        // Prevent self-deletion
        if (performer.id === id) {
            return res.status(400).json({
                error: true,
                message: "You cannot delete your own account",
            });
        }
        // Store admin information before changes for notifications
        const adminInfo = {
            _id: admin._id,
            userName: admin.userName,
            email: admin.email,
            role: admin.role,
        };
        // Instead of hard deleting, update the isDeleted flag
        admin.isDeleted = true;
        // Add status change record with admin name
        admin.statusChanges.push({
            status: "deleted",
            timestamp: new Date(),
            adminId: performer.id,
            adminName: performer.name,
            reason: reason || `Account deleted by ${performer.name}`,
        });
        yield admin.save();
        // Send notification to all super admins
        yield notifyAdmins(req, "deleted", adminInfo, performer, reason);
        // Send email to the affected admin
        yield sendAdminActionEmail(admin.email, "deleted", performer, reason);
        return res.status(200).json({
            error: false,
            message: "Admin deleted successfully",
        });
    }
    catch (error) {
        console.error("Error in deleteAdmin:", error);
        return res.status(500).json({
            error: true,
            message: "Internal server error",
        });
    }
});
exports.deleteAdmin = deleteAdmin;
const verifyAdmin = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    // Add validation for ID format
    if (!mongoose_1.default.Types.ObjectId.isValid(id)) {
        return res.status(400).json({
            error: true,
            message: "Invalid admin ID format",
        });
    }
    const performer = (0, auth_middleware_1.getAdminIdentifier)(req);
    try {
        const admin = yield Admin_model_1.default.findById(id);
        if (!admin) {
            return res.status(404).json({
                error: true,
                message: "Admin not found",
            });
        }
        // Prevent verification of already verified admins
        if (admin.isVerified) {
            return res.status(400).json({
                error: true,
                message: "Admin is already verified",
            });
        }
        // Only update if not already verified
        admin.isVerified = true;
        // Add status change record with admin name
        admin.statusChanges.push({
            status: "verified",
            timestamp: new Date(),
            adminId: performer.id,
            adminName: performer.name,
            reason: "Admin account verified",
        });
        yield admin.save();
        // Send notification to all super admins
        yield notifyAdmins(req, "verified", admin, performer);
        // Send email to the affected admin
        yield sendAdminActionEmail(admin.email, "verified", performer);
        return res.status(200).json({
            error: false,
            message: "Admin verified successfully",
            admin: {
                id: admin._id,
                userName: admin.userName,
                email: admin.email,
                isVerified: admin.isVerified,
            },
        });
    }
    catch (error) {
        console.error("Error in verifyAdmin:", error);
        return res.status(500).json({
            error: true,
            message: "Internal server error",
            details: error instanceof Error ? error.message : String(error),
        });
    }
});
exports.verifyAdmin = verifyAdmin;
const getUserOrderByUserId = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    try {
        const orders = yield Order_model_1.default.find({ user: id });
        if (!orders) {
            return res.status(404).json({
                error: true,
                message: "User orders not found",
            });
        }
        return res.status(200).json({
            error: false,
            orders,
        });
    }
    catch (err) {
        return res.status(500).json({
            error: true,
            err,
            message: "Internal Server error",
        });
    }
});
exports.getUserOrderByUserId = getUserOrderByUserId;
