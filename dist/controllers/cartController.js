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
exports.deleteCart = exports.addToCart = void 0;
const Cart_model_1 = __importDefault(require("../models/Cart.model"));
const addToCart = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { size, toppings, dateNeeded, details, quantity } = req.body;
    try {
        if (!size) {
            return res.status(404).json({
                error: true,
                message: "To complete this action, cake size is needed"
            });
        }
        if (!toppings) {
            return res.status(404).json({
                error: true,
                message: "To complete this action, cake toppings is needed"
            });
        }
        if (!dateNeeded) {
            return res.status(404).json({
                error: true,
                message: "To complete this action, Let know when the cake is needed"
            });
        }
        if (!details) {
            return res.status(404).json({
                error: true,
                message: "To complete this action, cake details is needed"
            });
        }
        if (!quantity) {
            return res.status(404).json({
                error: true,
                message: "To complete this action, cake quantity is needed"
            });
        }
        const cart = yield Cart_model_1.default.create({ size, toppings, details, quantity, dateNeeded });
        return res.status(201).json({
            error: false,
            cart,
            message: "Added to cart successfully"
        });
    }
    catch (error) {
        return res.status(500).json({
            error: true,
            err: error,
            message: "Internal server error, Please try again"
        });
    }
});
exports.addToCart = addToCart;
const deleteCart = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    try {
        const cart = yield Cart_model_1.default.deleteOne({ _id: id });
        if (!cart) {
            return res.status(404).json({
                error: true,
                message: "Cart item not found, please provide the correct id"
            });
        }
        return res.status(200).json({
            error: false,
            message: "Cart item deleted successfully"
        });
    }
    catch (error) {
        return res.status(500).json({
            error: true,
            err: error,
            message: "Internal server error, Please try again"
        });
    }
});
exports.deleteCart = deleteCart;
