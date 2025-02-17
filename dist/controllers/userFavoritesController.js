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
exports.getFavorites = exports.removeFavorite = exports.addFavorite = void 0;
const Product_model_1 = __importDefault(require("../models/Product.model"));
const User_model_1 = __importDefault(require("../models/User.model"));
const addFavorite = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { productId } = req.body;
    const user = req.id;
    try {
        // if (!mongoose.Types.ObjectId.isValid(productId)) {
        //   return res.status(400).json({
        //     error: true,
        //     message: "Invalid Product ID format.",
        //   });
        // }
        const userDetails = yield User_model_1.default.findOne({ _id: user });
        if (!userDetails) {
            return res.status(404).json({
                error: true,
                message: "User not found, please log in and try again."
            });
        }
        const product = yield Product_model_1.default.findById(productId);
        if (!product) {
            return res.status(404).json({
                error: true,
                message: "Product not found",
            });
        }
        if (userDetails.favorites.includes(productId)) {
            return res.status(400).json({
                error: false,
                message: "Products already in favorites"
            });
        }
        userDetails.favorites.push(productId);
        yield userDetails.save();
        yield userDetails.populate('favorites');
        return res.status(200).json({
            error: false,
            message: 'Product added to favorites',
            favorites: userDetails.favorites
        });
    }
    catch (error) {
        console.error("Error adding favorites", error);
        return res.status(500).json({
            error: true,
            err: error,
            message: "Internal server error, please try again"
        });
    }
});
exports.addFavorite = addFavorite;
const removeFavorite = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { productId } = req.params;
    const user = req.id;
    try {
        const userDetails = yield User_model_1.default.findOne({ _id: user });
        if (!userDetails) {
            return res.status(404).json({
                error: true,
                message: "User not found, please log in and try again."
            });
        }
        const product = yield Product_model_1.default.findOne({ _id: productId });
        if (!product) {
            return res.status(404).json({
                error: true,
                message: "Product not found"
            });
        }
        userDetails.favorites = userDetails.favorites.filter((id) => id.toString() !== productId);
        yield userDetails.save();
        yield userDetails.populate('favorites');
        return res.status(200).json({
            error: false,
            message: "Product removed from favorites successfully",
            favorites: userDetails.favorites
        });
    }
    catch (error) {
        console.error("Error removing favorite", error);
        return res.status(500).json({
            error: true,
            err: error,
            message: "Internal server error, please try again"
        });
    }
});
exports.removeFavorite = removeFavorite;
const getFavorites = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const user = req.id;
    try {
        const userDetails = yield User_model_1.default.findOne({ _id: user }).populate('favorites');
        if (!userDetails) {
            return res.status(404).json({
                error: true,
                message: "User not found, please log in and try again."
            });
        }
        return res.status(200).json({
            error: false,
            favorites: userDetails.favorites
        });
    }
    catch (error) {
        console.error("Error fetching favorite", error);
        return res.status(500).json({
            error: true,
            err: error,
            message: "Internal server error, please try again"
        });
    }
});
exports.getFavorites = getFavorites;
