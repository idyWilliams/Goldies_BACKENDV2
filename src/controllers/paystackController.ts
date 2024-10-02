// src/controllers/PaymentController.ts

import { Request, Response } from 'express';
import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const paystackSecretKey = process.env.PAYSTACK_SECRET_KEY;

// Create an axios instance for Paystack API requests
const paystackInstance = axios.create({
  baseURL: 'https://api.paystack.co',
  headers: {
    Authorization: `Bearer ${paystackSecretKey}`,
    'Content-Type': 'application/json',
  },
});

export class PaymentController {
  // Initialize payment to get an authorization URL
  static async initializePayment(req: Request, res: Response): Promise<void> {
    const { email, amount, callbackUrl } = req.body;
    try {
      const response = await paystackInstance.post('/transaction/initialize', {
        email,
        amount: amount * 100,
        callback_url: callbackUrl,
      });

      res.status(200).json(response.data);
    } catch (error) {
      res.status(500).json({ error: 'Payment initialization failed' });
    }
  }

  static async verifyPayment(req: Request, res: Response): Promise<void> {
    const { reference } = req.params;
    try {
      const response = await paystackInstance.get(`/transaction/verify/${reference}`);
      res.status(200).json(response.data);
    } catch (error) {
      res.status(500).json({ error: 'Payment verification failed' });
    }
  }
}
