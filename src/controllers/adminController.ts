import Admin from "../models/Admin.model";
import { Request, Response } from "express";
import dotenv from "dotenv";
import jwt from "jsonwebtoken";
dotenv.config();
import nodemailer from "nodemailer";
import bcryptjs from "bcryptjs";

const inviteAdmin = async (req: Request, res: Response) => {
  const { email } = req.body;
  try {

    const refCode = process.env.ADMINREFCODE;

    const maxAge = 60 * 15;
    const token = jwt.sign({ email }, refCode as string, {
      expiresIn: maxAge,
    })
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

    const SignUpURL = `http://localhost:3000/admin-signup?refCode=${token}&email=${email}`;

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
   const maxAge = 60 * 60 * 2;
      const secret = process.env.ACCESS_SECRET_TOKEN;

      if (!secret) {
        throw new Error("Secret key is not defined in environment variables.");
      }

      const token = jwt.sign({ id }, secret, {
        expiresIn: maxAge,
      });

      return token
}

const adminSignup = async (req: Request, res: Response) => {
  const { email, password } = req.body;
  try {
  if(!email){
    return res.status(404).json({
      error: true,
      message: "email is required for this process"
    })
  }
    const user = await Admin.findOne({ email });
    const OTP = generateOtp();
    
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

    if(!password){
      return res.status(404).json({
        error: true,
        message: "password is required for this process"
      })
    }
    if (!user) {
      const hashedPwd = bcryptjs.hashSync(password, 10);
      const admin = await Admin.create({
        email,
        password: hashedPwd,
        OTP
      });
      
      console.log(admin);
      return res.status(200).json({
        error: false,
        message: `Admin created successfully, 6 digit code as been sent to ${email}`,
      });
    } else {
      const { refCode } = req.query;

      jwt.verify(refCode as string, process.env.ACCESS_SECRET_TOKEN as string, (err: any, decoded: any) => {
          if (err) return res.sendStatus(403)
        }
      );
      const passwordMatch = await bcryptjs.compare(password, user.password);
      if (!passwordMatch) {
        return res
          .status(400)
          .json({ error: true, message: "Password is incorrect" });
      }

      if (OTP) user.OTP = OTP
      await user.save()

      return res.status(200).json({
        error: false,
        message: `New 6 digit code as been sent to ${email}`,
      });
    }

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

    const token = generateToken(admin._id)

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

export { inviteAdmin, adminSignup, verifyOTP };
