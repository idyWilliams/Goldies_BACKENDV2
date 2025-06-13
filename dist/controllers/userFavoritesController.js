"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getFavorites = exports.removeFavorite = exports.addFavorite = void 0;
const Product_model_1 = __importDefault(require("../models/Product.model"));
const User_model_1 = __importDefault(require("../models/User.model"));
const addFavorite = async (req, res) => {
    const { productId } = req.body;
    const user = req.id;
    try {
        // if (!mongoose.Types.ObjectId.isValid(productId)) {
        //   return res.status(400).json({
        //     error: true,
        //     message: "Invalid Product ID format.",
        //   });
        // }
        const userDetails = await User_model_1.default.findOne({ _id: user });
        if (!userDetails) {
            return res.status(404).json({
                error: true,
                message: "User not found, please log in and try again."
            });
        }
        const product = await Product_model_1.default.findById(productId);
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
        await userDetails.save();
        await userDetails.populate('favorites');
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
};
exports.addFavorite = addFavorite;
const removeFavorite = async (req, res) => {
    const { productId } = req.params;
    const user = req.id;
    try {
        const userDetails = await User_model_1.default.findOne({ _id: user });
        if (!userDetails) {
            return res.status(404).json({
                error: true,
                message: "User not found, please log in and try again."
            });
        }
        const product = await Product_model_1.default.findOne({ _id: productId });
        if (!product) {
            return res.status(404).json({
                error: true,
                message: "Product not found"
            });
        }
        userDetails.favorites = userDetails.favorites.filter((id) => id.toString() !== productId);
        await userDetails.save();
        await userDetails.populate('favorites');
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
};
exports.removeFavorite = removeFavorite;
const getFavorites = async (req, res) => {
    const user = req.id;
    try {
        const userDetails = await User_model_1.default.findOne({ _id: user }).populate('favorites');
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
};
exports.getFavorites = getFavorites;
//# sourceMappingURL=userFavoritesController.js.map