import { Request, Response } from "express";
import nodemailer from "nodemailer";

const newsLetterSubscription = async (req: Request, res: Response) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(404).json({
        error: true,
        message: "Please provide a valid email address",
      });
    }

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

    const subscriberEmailContent = `
      <div style="font-family: Arial, sans-serif; color: #333; line-height: 1.6; padding: 20px;">
        <div style="text-align: center;">
          <h2 style="color: #D4AF37;">🍰 Welcome to Cake App 🍰</h2>
        </div>

        <p>Hi there,</p>

        <p>Thank you for subscribing to Goldies' newsletter! We're thrilled to have you with us, and we're excited to share the sweetest updates, exclusive cake designs, and special offers straight from our oven to your inbox.</p>

        <p style="color: #555;">
          Whether you're a cake enthusiast or looking for the perfect cake for your next event, we've got something for everyone!
        </p>

        <p>Here's what you can look forward to from Goldies:</p>
        <ul style="color: #555; padding-left: 20px;">
          <li>🎂 Beautiful cake inspirations for your next celebration</li>
          <li>🍰 Early access to exclusive promotions and discounts</li>
          <li>🧁 New flavors, designs, and seasonal specials</li>
          <li>🎉 Invitations to cake-tasting events and workshops</li>
        </ul>

        <p>If you ever want to stop receiving our updates, simply <a href="#" style="color: #D4AF37;">unsubscribe here</a>.</p>

        <p>Thank you for being part of our Goldies family, where every cake tells a story!</p>

        <p style="text-align: center; font-weight: bold; margin-top: 30px; color: #D4AF37;">Stay Sweet!</p>

        <p style="font-size: 12px; color: #888; text-align: center; margin-top: 20px;">
          © 2024 Goldies Cake Shop. All rights reserved.<br />
          For any questions, feel free to contact us at <a href="mailto:i.sentryhub@gmail.com" style="color: #D4AF37;">support@goldiescakes.com</a>.
        </p>
      </div>
    `;

    const companyEmailContent = `
      <div style="font-family: Arial, sans-serif; color: #333; line-height: 1.6; padding: 20px;">
        <h2 style="color: #D4AF37;">New Newsletter Subscriber</h2>
        <p>A new user has subscribed to the Goldies newsletter:</p>
        <p><strong>Email:</strong> ${email}</p>
      </div>
    `;

    // Send email to the subscriber
    const subscriberMailOptions = {
      from: `Goldies <${process.env.EMAIL}>`,
      to: email,
      subject: "🍰 Welcome to Cake App",
      text: "🍰 Welcome to Cake App 🍰",
      html: subscriberEmailContent,
    };

    await transporter.sendMail(subscriberMailOptions);

    // Send email to the company
    const companyMailOptions = {
      from: `Goldies <${process.env.EMAIL}>`,
      to: process.env.EMAIL,
      subject: "New Newsletter Subscriber",
      text: `A new subscriber has joined the Goldies newsletter: ${email}`,
      html: companyEmailContent,
    };

    await transporter.sendMail(companyMailOptions);

    // Respond with success
    return res
      .status(200)
      .json({
        message: "Subscription email sent to both subscriber and company.",
      });
  } catch (error) {
    console.error("Error sending email:", error);
    return res
      .status(500)
      .json({
        error: "Failed to send subscription email. Please try again later.",
      });
  }
};

const contactUs = async (req: Request, res: Response) => {
  try {
    const { fullName, email, phoneNumber, message } = req.body;

    if (!fullName || !email || !phoneNumber || !message) {
      return res.status(400).json({ error: "All fields are required." });
    }
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: "Invalid email format." });
    }

    // Send email to the company
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
        <div style="font-family: Arial, sans-serif; color: #333; line-height: 1.6; padding: 20px;">
          <h2 style="color: #D4AF37;">New Contact Us Message</h2>
          <p>A new message has been received from the Goldies website:</p>
          <p><strong>Full Name:</strong> ${fullName}</p>
          <p><strong>Email:</strong> ${email}</p>
          <strong>Phone Number:</strong> ${phoneNumber}</p>
          <p><strong>Message:</strong> ${message}</p>
          <p style="font-size: 12px; color: #888; text-align: center; margin-top: 20px;">
          © 2024 Goldies Cake Shop. All rights reserved.<br />
          For any questions, feel free to contact us at <a href="mailto:i.sentryhub@gmail.com" style="color: #D4AF37;">support@goldiescakes.com</a>.
          </p>
        </div>
      `;

    const mailOptions = {
      from: `Goldies <${process.env.EMAIL}>`,
      to: process.env.EMAIL,
      subject: "New Message From Goldies Website",
      text: `A new contact us message has been received: ${fullName} - ${email} - ${phoneNumber} - ${message}`,
      html: emailContent,
    };

    await transporter.sendMail(mailOptions);

    // Respond with success
    return res
      .status(200)
      .json({ message: "Contact us message sent to the company." });
  } catch (error) {
    console.error("Error sending email:", error);
    return res
      .status(500)
      .json({
        error: "Failed to send contact us message. Please try again later.",
      });
  }
};

export { newsLetterSubscription, contactUs };
