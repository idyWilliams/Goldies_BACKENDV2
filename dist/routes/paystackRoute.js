"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const verifyJWT_1 = require("../middleware/verifyJWT");
const paystackController_1 = require("../controllers/paystackController");
const router = express_1.default.Router();
router.post("/initialize_payment", verifyJWT_1.authenticateToken, paystackController_1.PaymentController.initializePayment);
router.post("/verify_payment/:reference", verifyJWT_1.authenticateToken, paystackController_1.PaymentController.verifyPayment);
exports.default = router;
