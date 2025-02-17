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
exports.getAdmin = exports.updateProfile = exports.resetPassword = exports.forgotPassword = exports.adminLogin = exports.verifyOTP = exports.adminSignup = exports.inviteAdmin = void 0;
const Admin_model_1 = __importDefault(require("../models/Admin.model"));
const dotenv_1 = __importDefault(require("dotenv"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
dotenv_1.default.config();
const nodemailer_1 = __importDefault(require("nodemailer"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const inviteAdmin = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { email } = req.body;
    try {
        const refCode = process.env.ADMINREFCODE;
        const maxAge = 60 * 15;
        const token = jsonwebtoken_1.default.sign({ email }, refCode, {
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
        const SignUpURL = `${process.env.FRONTEND_URL}/admin-signup?refCode=${token}&email=${email}`;
        const emailContent = `
    <div style="font-family: Arial, sans-serif; color: #333;">
      <h2 style="color: #007bff;">Goldies Admin Invitation</h2>
      <p>Goldies has invited you to be part of the administration team.</p>
      <a
        href="${SignUpURL}"
        style="display: inline-block; padding: 10px 20px; background-color: yellow; color: #fff; text-decoration: none; border-radius: 5px;">
        Join Now
      </a>
      <p>If you did not request this, please ignore this email.</p>
    </div>
  `;
        const mailOptions = {
            from: process.env.EMAIL,
            to: email,
            subject: "Goldies Admin Invitation",
            text: "Goldies has invited you to be part of the administration team.",
            html: emailContent,
        };
        const info = yield transporter.sendMail(mailOptions);
        console.log("Message sent: %s", info.messageId);
        return res.status(200).json({
            error: false,
            message: "Message sent",
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
    const maxAge = '7d';
    const secret = process.env.ACCESS_SECRET_TOKEN;
    if (!secret) {
        throw new Error("Secret key is not defined in environment variables.");
    }
    const token = jsonwebtoken_1.default.sign({ id }, secret, {
        expiresIn: maxAge,
    });
    return token;
};
// const adminSignup = async (req: Request, res: Response) => {
//   const { userName, email, password } = req.body;
//   // Validate input
//   if (!userName) {
//     return res.status(400).json({
//       error: true,
//       message: "Email is required for this process",
//     });
//   }
//   if (!email) {
//     return res.status(400).json({
//       error: true,
//       message: "Email is required for this process",
//     });
//   }
//   if (!password) {
//     return res.status(400).json({
//       error: true,
//       message: "Password is required for this process",
//     });
//   }
//   try {
//     const user = await Admin.findOne({ email });
//     const OTP = generateOtp(); // Assuming this function generates a 6-digit OTP
//     // Create transporter for sending email
//     const transporter = nodemailer.createTransport({
//       host: "smtp.gmail.com",
//       port: 465,
//       secure: true,
//       auth: {
//         user: process.env.EMAIL,
//         pass: process.env.PASSWORD,
//       },
//       tls: {
//         rejectUnauthorized: false,
//       },
//     });
//     // Function to send the verification email
//     const sendVerificationEmail = async () => {
//       const emailContent = `
//       <div style="font-family: Arial, sans-serif; color: #333;">
//         <h2 style="color: #007bff;">Email Verification</h2>
//         <p>Do not share this with anyone.</p>
//         <p> Verification code: <strong>${OTP}</strong> </p>
//         <p>If you did not request this, please ignore this email.</p>
//       </div>
//     `;
//       const mailOptions = {
//         from: process.env.EMAIL,
//         to: email,
//         subject: "Goldies Team - Email Verification",
//         text: "Email verification.",
//         html: emailContent,
//       };
//       try {
//         const info = await transporter.sendMail(mailOptions);
//         console.log("Message sent: %s", info.messageId);
//       } catch (err) {
//         console.error("Error sending email: ", err);
//         throw new Error("Failed to send verification email.");
//       }
//     };
//     // If user does not exist, create new admin
//     if (!user) {
//       // verify JWT
//       const { refCode } = req.query;
//       try {
//         jwt.verify(refCode as string, process.env.ADMINREFCODE as string);
//       } catch (err) {
//         return res.status(403).json({
//           error: true,
//           message: "Invalid or expired referral code.",
//         });
//       }
//       const hashedPwd = bcryptjs.hashSync(password, 10);
//       const admin = await Admin.create({
//         email,
//         fullName,
//         password: hashedPwd,
//         OTP,
//       });
//       // Send verification email
//       await sendVerificationEmail();
//       return res.status(200).json({
//         error: false,
//         message: `Admin created successfully. A 6-digit code has been sent to ${email}`,
//       });
//     } else {
//       // Verify the password
//       const passwordMatch = await bcryptjs.compare(password, user.password);
//       if (!passwordMatch) {
//         return res.status(400).json({
//           error: true,
//           message: "Password is incorrect",
//         });
//       }
//       // Update OTP and send verification email
//       user.OTP = OTP;
//       await user.save();
//       await sendVerificationEmail();
//       return res.status(200).json({
//         error: false,
//         message: `New 6-digit code has been sent to ${email}`,
//       });
//     }
//   } catch (error) {
//     console.error("Error in admin signup: ", error);
//     return res.status(500).json({
//       error: true,
//       message: "Internal server error",
//     });
//   }
// };
const adminSignup = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { userName, email, password } = req.body;
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
                subject: "Goldies Team - Email Verification",
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
            // Verify JWT referral code (optional step based on your logic)
            const { refCode } = req.query;
            if (refCode) {
                try {
                    jsonwebtoken_1.default.verify(refCode, process.env.ADMINREFCODE);
                }
                catch (err) {
                    return res.status(403).json({
                        error: true,
                        message: "Invalid or expired referral code.",
                    });
                }
            }
            const hashedPwd = bcryptjs_1.default.hashSync(password, 10);
            const admin = yield Admin_model_1.default.create({
                userName,
                email,
                password: hashedPwd,
                OTP,
            });
            // Send verification email
            yield sendVerificationEmail();
            return res.status(201).json({
                error: false,
                message: `Admin created successfully. A 6-digit code has been sent to ${email}`,
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
        if (otp != admin.OTP) {
            return res.status(401).json({
                error: true,
                message: "Wrong OTP",
            });
        }
        admin.isVerified = true;
        yield admin.save();
        const token = generateToken(admin._id);
        return res.status(200).json({
            error: false,
            admin,
            token,
            message: `Admin Signup successful`,
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
exports.verifyOTP = verifyOTP;
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
                subject: "Goldies Team - Email Verification",
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
        // Send verification email
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
            admin
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
