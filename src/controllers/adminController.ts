import Admin from "../models/Admin.model";
import { Request, Response } from "express";
import dotenv from "dotenv";
import jwt from "jsonwebtoken";
dotenv.config();
import mongoose from "mongoose";
import nodemailer from "nodemailer";
import bcryptjs from "bcryptjs";
import Order from "../models/Order.model";
import { AuthRequest, getAdminIdentifier } from "../middleware/auth.middleware";

const inviteAdmin = async (req: Request, res: Response) => {
  const { email } = req.body;
  try {
    const refCode = process.env.ADMINREFCODE;

    const maxAge = 60 * 15;
    const token = jwt.sign({ email }, refCode as string, {
      expiresIn: maxAge,
    });
    const transporter = nodemailer.createTransport({
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
        style="display: inline-block; padding: 10px 20px; background-color: black; color: #fff; text-decoration: none; border-radius: 5px;">
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

    const info = await transporter.sendMail(mailOptions);
    console.log("Message sent: %s", info.messageId);

    return res.status(200).json({
      error: false,
      message: "Message sent",
      info: info.messageId,
    });
  } catch (error) {
    return res.status(500).json({
      error: true,
      err: error,
      message: "Internal server error",
    });
  }
};

function generateOtp() {
  const digit = "0123456789";
  let otp = "";
  for (let i = 0; i < 6; i++) {
    otp += digit[Math.floor(Math.random() * digit.length)];
  }
  return otp;
}

const generateToken = (id: unknown) => {
  const maxAge = "30m";
  const secret = process.env.ACCESS_SECRET_TOKEN;

  if (!secret) {
    throw new Error("Secret key is not defined in environment variables.");
  }

  const token = jwt.sign({ id }, secret, {
    expiresIn: maxAge,
  });

  return token;
};

const adminSignup = async (req: Request, res: Response) => {
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
    const user = await Admin.findOne({ email });
    const OTP = generateOtp(); // Generates a 6-digit OTP

    // Create transporter for sending email
    const transporter = nodemailer.createTransport({
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
    const sendVerificationEmail = async () => {
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
        const info = await transporter.sendMail(mailOptions);
        console.log("Message sent: %s", info.messageId);
      } catch (err) {
        console.error("Error sending email: ", err);
        throw new Error("Failed to send verification email.");
      }
    };

    // If user does not exist, create new admin
    if (!user) {
      // Verify JWT referral code (optional step based on your logic)
      const { refCode } = req.query;
      if (refCode) {
        try {
          jwt.verify(refCode as string, process.env.ADMINREFCODE as string);
        } catch (err) {
          return res.status(403).json({
            error: true,
            message: "Invalid or expired referral code.",
          });
        }
      }

      const hashedPwd = bcryptjs.hashSync(password, 10);
      const admin = await Admin.create({
        userName,
        email,
        password: hashedPwd,
        OTP,
      });

      // Send verification email
      await sendVerificationEmail();

      return res.status(201).json({
        error: false,
        message: `Admin created successfully. A 6-digit code has been sent to ${email}`,
      });
    } else {
      // Verify the password
      const passwordMatch = await bcryptjs.compare(password, user.password);
      if (!passwordMatch) {
        return res.status(400).json({
          error: true,
          message: "Password is incorrect",
        });
      }

      // Update OTP and send verification email
      user.OTP = OTP;
      await user.save();
      await sendVerificationEmail();

      return res.status(200).json({
        error: false,
        message: `A new 6-digit code has been sent to ${email}`,
      });
    }
  } catch (error) {
    console.error("Error in admin signup: ", error);
    return res.status(500).json({
      error: true,
      message: "Internal server error",
    });
  }
};

const verifyOTP = async (req: Request, res: Response) => {
  const { email, otp } = req.body;
  try {
    const admin = await Admin.findOne({ email });

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
    await admin.save();

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
  } catch (error) {
    return res.status(500).json({
      error: true,
      err: error,
      message: "Internal server error",
    });
  }
};

const adminLogin = async (req: Request, res: Response) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({
      error: true,
      message: `${!email ? "Email" : "Password"} is required`,
    });
  }

  try {
    const admin = await Admin.findOne({ email });
    const OTP = generateOtp(); // Generates a 6-digit OTP

    // Create transporter for sending email
    const transporter = nodemailer.createTransport({
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
    const sendVerificationEmail = async () => {
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
        const info = await transporter.sendMail(mailOptions);
        console.log("Message sent: %s", info.messageId, OTP);
      } catch (err) {
        console.error("Error sending email: ", err);
        throw new Error("Failed to send verification email.");
      }
    };

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

    const isValidPassword = await bcryptjs.compare(password, admin.password);
    if (!isValidPassword) {
      return res.status(401).json({
        error: true,
        message: "Incorrect Password",
      });
    }

    admin.OTP = OTP;
    await admin.save();
    await sendVerificationEmail();

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
  } catch (error) {
    console.error("Login error:", error);
    return res.status(500).json({
      error: true,
      message: "Internal server error",
    });
  }
};

const forgotPassword = async (req: Request, res: Response) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({
      error: true,
      message: "Email is required",
    });
  }

  try {
    const admin = await Admin.findOne({ email });

    if (!admin) {
      return res.status(404).json({
        error: true,
        message: "Admin not found",
      });
    }

    const resetToken = jwt.sign(
      { id: admin._id },
      process.env.RESET_SECRET_TOKEN as string,
      { expiresIn: "15m" }
    );

    const transporter = nodemailer.createTransport({
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

    await transporter.sendMail({
      from: process.env.EMAIL,
      to: email,
      subject: "Password Reset Request",
      html: emailContent,
    });

    return res.status(200).json({
      error: false,
      message: "Password reset link sent to email",
    });
  } catch (error) {
    console.error("Forgot password error:", error);
    return res.status(500).json({
      error: true,
      message: "Internal server error",
    });
  }
};

const resetPassword = async (req: Request, res: Response) => {
  const { token, newPassword } = req.body;

  if (!token || !newPassword) {
    return res.status(400).json({
      error: true,
      message: "Token and new password are required",
    });
  }

  try {
    const decoded = jwt.verify(
      token,
      process.env.RESET_SECRET_TOKEN as string
    ) as { id: string };
    const admin = await Admin.findById(decoded.id);

    if (!admin) {
      return res.status(404).json({
        error: true,
        message: "Admin not found",
      });
    }

    const hashedPassword = await bcryptjs.hash(newPassword, 10);
    admin.password = hashedPassword;
    await admin.save();

    return res.status(200).json({
      error: false,
      message: "Password reset successful",
    });
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
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
};
const updateProfile = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { userName, currentPassword, newPassword } = req.body;

  try {
    const admin = await Admin.findById(id);

    if (!admin) {
      return res.status(404).json({
        error: true,
        message: "Admin not found",
      });
    }

    // Update username if provided
    if (userName) {
      const existingAdmin = await Admin.findOne({ userName, _id: { $ne: id } });
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
      const isValidPassword = await bcryptjs.compare(
        currentPassword,
        admin.password
      );
      if (!isValidPassword) {
        return res.status(401).json({
          error: true,
          message: "Current password is incorrect",
        });
      }
      admin.password = await bcryptjs.hash(newPassword, 10);
    }

    await admin.save();

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
  } catch (error) {
    console.error("Update profile error:", error);
    return res.status(500).json({
      error: true,
      message: "Internal server error",
    });
  }
};

const getAdmin = async (req: Request, res: Response) => {
  const { id } = req.params;

  console.log(id);
  try {
    const admin = await Admin.findOne({ _id: id });

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
  } catch (err) {
    return res.status(500).json({
      error: true,
      err,
      message: "Internal Server error",
    });
  }
};

const getAllAdmins = async (req: Request, res: Response) => {
  try {
    // Logging for debugging
    console.log("Full Query Parameters:", req.query);

    // Safely parse pagination and limit
    const page = Math.max(1, parseInt(req.query.page as string) || 1);
    const limit = Math.max(1, parseInt(req.query.limit as string) || 10);
    const sortField = (req.query.sortField as string) || "createdAt";
    const sortOrder = (req.query.sortOrder as string) === "asc" ? 1 : -1;
    const search = req.query.search as string;

    console.log("Parsed Parameters:", { page, limit, sortField, sortOrder });

    const skip = (page - 1) * limit;

    // Create a robust filter object
    const filter: any = {};

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
        filter.createdAt.$gte = new Date(req.query.startDate as string);
      }
      if (req.query.endDate) {
        filter.createdAt.$lte = new Date(req.query.endDate as string);
      }
    }

    // Prepare sort object
    const sort: any = {};
    sort[sortField] = sortOrder;

    try {
      // Count total documents matching the filter
      const totalAdmins = await Admin.countDocuments(filter);
      console.log("Total Admins Count:", totalAdmins);

      // Find admins with pagination and sorting
      const admins = await Admin.find(filter)
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
    } catch (findError: unknown) {
      if (findError instanceof Error) {
        console.error("Database Query Error:", findError.message);
        console.error("Full Error:", findError);
        return res.status(500).json({
          error: true,
          message: "Database query failed",
          details: findError.message,
        });
      } else {
        console.error("Unknown Database Error:", findError);
        return res.status(500).json({
          error: true,
          message: "Unexpected database error",
          details: String(findError),
        });
      }
    }
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error("Unexpected Server Error:", error.message);
      console.error("Full Error:", error);
      return res.status(500).json({
        error: true,
        message: "Internal server error",
        details: error.message,
      });
    } else {
      console.error("Unknown Server Error:", error);
      return res.status(500).json({
        error: true,
        message: "Unknown internal server error",
        details: String(error),
      });
    }
  }
};

const getAdminById = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const admin = await Admin.findById(id);
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
  } catch (error) {
    return res.status(500).json({
      error: true,
      message: "Internal server error",
    });
  }
};



const revokeAdminAccess = async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const { reason } = req.body; // Optional reason for blocking
  const performer = getAdminIdentifier(req);

  try {
    const admin = await Admin.findById(id);
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
        adminName: performer.name, // Add the admin's name
        reason: reason || `Access revoked by ${performer.name}`,
      });

      await admin.save();
    }

    return res.status(200).json({
      error: false,
      message: "Admin access revoked successfully",
    });
  } catch (error) {
    console.error("Error in revokeAdminAccess:", error);
    return res.status(500).json({
      error: true,
      message: "Internal server error",
    });
  }
};

const unblockAdminAccess = async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const { reason } = req.body; // Optional reason for unblocking
  const performer = getAdminIdentifier(req);

  try {
    const admin = await Admin.findById(id);
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
        adminName: performer.name, // Add the admin's name
        reason: reason || `Access restored by ${performer.name}`,
      });

      await admin.save();
    }

    return res.status(200).json({
      error: false,
      message: "Admin access unblocked successfully",
    });
  } catch (error) {
    console.error("Error in unblockAdminAccess:", error);
    return res.status(500).json({
      error: true,
      message: "Internal server error",
    });
  }
};

const deleteAdmin = async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const { reason } = req.body; // Optional reason for deletion
  const performer = getAdminIdentifier(req);

  try {
    // First find the admin to add status change before deletion
    const admin = await Admin.findById(id);
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

    // Instead of hard deleting, update the isDeleted flag
    admin.isDeleted = true;

    // Add status change record with admin name
    admin.statusChanges.push({
      status: "deleted",
      timestamp: new Date(),
      adminId: performer.id,
      adminName: performer.name, // Add the admin's name
      reason: reason || `Account deleted by ${performer.name}`,
    });

    await admin.save();

    return res.status(200).json({
      error: false,
      message: "Admin deleted successfully",
    });
  } catch (error) {
    console.error("Error in deleteAdmin:", error);
    return res.status(500).json({
      error: true,
      message: "Internal server error",
    });
  }
};

// const verifyAdmin = async (req: AuthRequest, res: Response) => {
//   const { id } = req.params;
//   const performer = getAdminIdentifier(req);

//   try {
//     const admin = await Admin.findById(id);
//     if (!admin) {
//       return res.status(404).json({
//         error: true,
//         message: "Admin not found",
//       });
//     }

//     // Only update if not already verified
//     if (!admin.isVerified) {
//       admin.isVerified = true;

//       // Add status change record with admin name
//       admin.statusChanges.push({
//         status: "verified",
//         timestamp: new Date(),
//         adminId: performer.id,
//         adminName: performer.name, // Add the admin's name
//         reason: "Admin account verified",
//       });

//       await admin.save();
//     }

//     return res.status(200).json({
//       error: false,
//       message: "Admin verified successfully",
//     });
//   } catch (error) {
//     console.error("Error in verifyAdmin:", error);
//     return res.status(500).json({
//       error: true,
//       message: "Internal server error",
//     });
//   }
// };

const verifyAdmin = async (req: AuthRequest, res: Response) => {
  const { id } = req.params;

  // Add validation for ID format
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({
      error: true,
      message: "Invalid admin ID format",
    });
  }

  const performer = getAdminIdentifier(req);

  try {
    const admin = await Admin.findById(id);
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

    await admin.save();

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
  } catch (error) {
    console.error("Error in verifyAdmin:", error);
    return res.status(500).json({
      error: true,
      message: "Internal server error",
      details: error instanceof Error ? error.message : String(error),
    });
  }
};

const getUserOrderByUserId = async (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    const orders = await Order.find({ user: id });

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
  } catch (err) {
    return res.status(500).json({
      error: true,
      err,
      message: "Internal Server error",
    });
  }
};

export {
  inviteAdmin,
  adminSignup,
  verifyOTP,
  adminLogin,
  forgotPassword,
  resetPassword,
  updateProfile,
  getAdmin,
  getUserOrderByUserId,
  deleteAdmin,
  verifyAdmin,
  unblockAdminAccess,
  revokeAdminAccess,
  getAllAdmins,
  getAdminById,
};
