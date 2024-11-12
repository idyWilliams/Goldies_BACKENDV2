import Admin from "../models/Admin.model";
import { Request, Response } from "express";
import dotenv from "dotenv";
import jwt from "jsonwebtoken";
dotenv.config();
import nodemailer from "nodemailer";
import bcryptjs from "bcryptjs";

const inviteAdmin = async (req: Request, res: Response) => {
  const { email } = req.body;

  const origin = req.get("origin");

  console.log(`origin: ${origin}`);
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

    const SignUpURL = `${origin}/admin-signup?refCode=${token}&email=${email}`;

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
  const maxAge = 60 * 60 * 24;
  const secret = process.env.ACCESS_SECRET_TOKEN;

  if (!secret) {
    throw new Error("Secret key is not defined in environment variables.");
  }

  const token = jwt.sign({ id }, secret, {
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

    const token = generateToken(admin._id);

    return res.status(200).json({
      error: false,
      admin,
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
        message: "Invalid credentials",
      });
    }

    admin.OTP = OTP;
    await admin.save();
    // Send verification email
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

    const resetURL = `http://localhost:3000/reset-password?token=${resetToken}`;

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

export {
  inviteAdmin,
  adminSignup,
  verifyOTP,
  adminLogin,
  forgotPassword,
  resetPassword,
  updateProfile,
};
