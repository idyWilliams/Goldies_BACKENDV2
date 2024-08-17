import Admin from "../models/Admin.model";
import { Request, Response } from "express";
import dotenv from "dotenv";
dotenv.config();
import nodemailer from "nodemailer";

const inviteAdmin = async (req: Request, res: Response) => {
  const { email } = req.body;
  try {
    const refCode = process.env.ADMINREFCODE;
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

    const SignUpURL = `https://goldies-frontend.vercel.app/invite_admin?refCode=${refCode}&email=${email}`;

    const emailContent = `
    <div style="font-family: Arial, sans-serif; color: #333;">
      <h2 style="color: #007bff;">Password Reset Request</h2>
      <p>Goldies has invited you to be part of the administration team.</p>
      <a 
        href="${SignUpURL}" 
        style="display: inline-block; padding: 10px 20px; background-color: #007bff; color: #fff; text-decoration: none; border-radius: 5px;">
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

const adminSignup = async (req: Request, res: Response) => {
  const { email, password } = req.body;
  try {
    const { refCode } = req.params;

    if (refCode != process.env.ADMINREFCODE) {
      return res.status(401);
    }
    const OTP = generateOtp();

    const admin = await Admin.create({
      email,
      password,
    });

    admin.OTP = OTP;
    await admin.save();

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

    const emailContent = `
    <div style="font-family: Arial, sans-serif; color: #333;">
      <h2 style="color: #007bff;">Email Verification</h2>
      <p>Do not share this with anyone.</p>
      <p> Verification code <strong> ${OTP} </strong> </p>
      <p>If you did not request this, please ignore this email.</p>
    </div>
  `;

    const mailOptions = {
      from: process.env.EMAIL,
      to: email,
      subject: "Goldies Team",
      text: "Email verification.",
      html: emailContent,
    };
    const info = await transporter.sendMail(mailOptions);
    console.log("Message sent: %s", info.messageId);

    return res.status(200).json({
      error: false,
      message: `6 digit code as been sent to ${email}`,
    });
  } catch (error) {
    return res.status(500).json({
      error: true,
      err: error,
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

    return res.status(200).json({
      error: false,
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

export { inviteAdmin, adminSignup, verifyOTP };
