import { Request, Response } from "express";
import User from "../models/User.model";
import bcryptjs from "bcryptjs";
import dotenv from "dotenv";
import jwt from "jsonwebtoken";
dotenv.config();
import nodemailer from "nodemailer";
import { CustomRequest } from "../middleware/verifyJWT";

const create_acct = async (req: Request, res: Response) => {
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
    const isUser = await User.findOne({ email });

    if (isUser) {
      console.log(isUser);
      return res.json({
        error: true,
        message: "User already exists",
      });
    }

    const hashedPwd = bcryptjs.hashSync(password, 10);

    const user = new User({
      firstName,
      lastName,
      email,
      password: hashedPwd,
    });

    await user.save();

    return res.json({
      error: false,
      user: {
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        _id: user._id,
      },
      message: "Registration Successful",
    });
  } catch (e) {
    return res.json({
      error: true,
      e,
      message: "internal server error",
    });
  }
};

const login = async (req: Request, res: Response) => {
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
    const user = await User.findOne({ email });

    if (!user) {
      return res
        .status(404)
        .json({ error: true, message: "Account does not exist" });
    }

    const passwordMatch = await bcryptjs.compare(password, user.password);

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

    const token = jwt.sign({ id: user._id }, secret, {
      expiresIn: maxAge,
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
    });
  } catch (error) {
    console.error("Login Error:", error); // Log the error to console
    return res.status(500).json({
      error: true,
      message: "Something went wrong",
      err: error,
    });
  }
};

const forgottenPassword = async (req: Request, res: Response) => {
  console.log("Email:", process.env.EMAIL);
  console.log("Password:", process.env.PASSWORD);
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      return res
        .status(404)
        .json({ error: true, message: "Account does not exist" });
    }

    // Create a transporter with direct SMTP settings
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

    const maxAge = 60 * 15;
    const token = jwt.sign(
      { id: user._id },
      process.env.ACCESS_SECRET_TOKEN as string,
      {
        expiresIn: maxAge,
      }
    );

    const resetUrl = `https://goldies-frontend.vercel.app/reset_password/${token}`;

    const emailContent = `
    <div style="font-family: Arial, sans-serif; color: #333;">
      <h2 style="color: #007bff;">Password Reset Request</h2>
      <p>You requested a password reset. Please click the link below to reset your password:</p>
      <a 
        href="${resetUrl}" 
        style="display: inline-block; padding: 10px 20px; background-color: #007bff; color: #fff; text-decoration: none; border-radius: 5px;">
        Reset Password
      </a>
      <p>If you did not request this, please ignore this email.</p>
    </div>
  `;

    const mailOptions = {
      from: process.env.EMAIL,
      to: email,
      subject: "Forgotten Password",
      text: "You requested a password reset.",
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
    console.error("Error sending email:", error);
    return res.status(500).json({
      error: true,
      message: "Something went wrong",
      err: error,
    });
  }
};

const resetPassword = async (req: CustomRequest, res: Response) => {
  const user = req.id;
  const { password } = req.body;
  try {
    const isUser = await User.findOne({ _id: user });

    if (!isUser) {
      return res.sendStatus(401);
    }

    if (!password) {
      return res.status(404).json({
        error: true,
        message: "Please provide a pasword",
      });
    }

    const hashedPwd = bcryptjs.hashSync(password, 10);
    isUser.password = hashedPwd;
    await isUser.save();

    return res.status(200).json({
      error: false,
      message: "Password changed successfully",
    });
  } catch (error) {
    return res.status(500).json({
      error: true,
      err: error,
      message: "Internal server error",
    });
  }
};

export { create_acct, login, forgottenPassword, resetPassword };
