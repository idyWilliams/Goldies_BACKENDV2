"use strict";
// src/controllers/PaymentController.ts
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaymentController = void 0;
const axios_1 = __importDefault(require("axios"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const paystackSecretKey = process.env.PAYSTACK_SECRET_KEY;
// Create an axios instance for Paystack API requests
const paystackInstance = axios_1.default.create({
    baseURL: 'https://api.paystack.co',
    headers: {
        Authorization: `Bearer ${paystackSecretKey}`,
        'Content-Type': 'application/json',
    },
});
class PaymentController {
    // Initialize payment to get an authorization URL
    static async initializePayment(req, res) {
        const { first_name, last_name, email, amount, callbackUrl } = req.body;
        try {
            const response = await paystackInstance.post('/transaction/initialize', {
                first_name,
                last_name,
                email,
                amount: amount * 100,
                callback_url: callbackUrl,
            });
            res.status(200).json(response.data);
        }
        catch (error) {
            res.status(500).json({ error: 'Payment initialization failed' });
        }
    }
    static async verifyPayment(req, res) {
        const { reference } = req.params;
        try {
            const response = await paystackInstance.get(`/transaction/verify/${reference}`);
            res.status(200).json(response.data);
        }
        catch (error) {
            res.status(500).json({ error: 'Payment verification failed' });
        }
    }
}
exports.PaymentController = PaymentController;
//# sourceMappingURL=paystackController.js.map