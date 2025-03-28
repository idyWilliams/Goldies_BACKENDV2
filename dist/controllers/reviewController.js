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
exports.getUserReviews = exports.deleteReview = exports.getProductReviews = exports.updateReview = exports.createReview = void 0;
const Review_model_1 = __importDefault(require("../models/Review.model"));
const Product_model_1 = __importDefault(require("../models/Product.model"));
const createReview = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { productId, rating, comment } = req.body;
    const userId = req.id;
    try {
        if (!productId || !rating) {
            return res.status(400).json({ error: true, message: "Product ID and rating are required." });
        }
        // Validate that the product exists
        const product = yield Product_model_1.default.findById(productId);
        if (!product) {
            return res.status(404).json({ error: true, message: "Product not found." });
        }
        // Create a new review
        const review = new Review_model_1.default({
            user: userId,
            product: productId,
            rating,
            comment,
        });
        yield review.save();
        return res.status(201).json({
            error: false,
            message: "Review added successfully.",
            review,
        });
    }
    catch (error) {
        return res.status(500).json({
            error: true,
            message: "Internal server error.",
            err: error,
        });
    }
});
exports.createReview = createReview;
const updateReview = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { reviewId } = req.params;
    const { rating, comment } = req.body;
    const userId = req.id;
    try {
        const review = yield Review_model_1.default.findById(reviewId);
        if (!review) {
            return res.status(404).json({ error: true, message: "Review not found." });
        }
        // Only the user who created the review can update it
        if (review.user.toString() !== userId) {
            return res.status(403).json({ error: true, message: "You cannot update someone else's review." });
        }
        if (rating)
            review.rating = rating;
        if (comment)
            review.comment = comment;
        yield review.save();
        return res.status(200).json({
            error: false,
            message: "Review updated successfully.",
            review,
        });
    }
    catch (error) {
        return res.status(500).json({
            error: true,
            message: "Internal server error.",
            err: error,
        });
    }
});
exports.updateReview = updateReview;
const deleteReview = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { reviewId } = req.params;
    const userId = req.id;
    try {
        const review = yield Review_model_1.default.findById(reviewId);
        if (!review) {
            return res.status(404).json({ error: true, message: "Review not found." });
        }
        // Only the user who created the review can delete it
        if (review.user.toString() !== userId) {
            return res.status(403).json({ error: true, message: "You cannot delete someone else's review." });
        }
        yield Review_model_1.default.findByIdAndDelete(reviewId);
        return res.status(200).json({
            error: false,
            message: "Review deleted successfully.",
        });
    }
    catch (error) {
        return res.status(500).json({
            error: true,
            message: "Internal server error.",
            err: error,
        });
    }
});
exports.deleteReview = deleteReview;
const getProductReviews = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { productId } = req.params;
    const { page = 1, limit = 10 } = req.query; // Get page and limit from query params
    try {
        // Convert page and limit to numbers and ensure they're valid
        const pageNumber = parseInt(page, 10);
        const limitNumber = parseInt(limit, 10);
        if (isNaN(pageNumber) || isNaN(limitNumber)) {
            return res.status(400).json({
                error: true,
                message: "Invalid pagination parameters.",
            });
        }
        // Calculate the skip value for pagination
        const skip = (pageNumber - 1) * limitNumber;
        // Get reviews with pagination
        const reviews = yield Review_model_1.default.find({ product: productId })
            .skip(skip)
            .limit(limitNumber)
            .populate('user', 'firstName lastName') // Populate user data (optional)
            .sort({ createdAt: -1 }); // Sort by latest reviews first
        // Get the total count of reviews for pagination
        const totalReviews = yield Review_model_1.default.countDocuments({ product: productId });
        // Calculate total pages
        const totalPages = Math.ceil(totalReviews / limitNumber);
        return res.status(200).json({
            error: false,
            message: "Reviews retrieved successfully.",
            reviews,
            totalPages,
            currentPage: pageNumber,
            totalReviews,
        });
    }
    catch (error) {
        return res.status(500).json({
            error: true,
            message: "Internal server error.",
            err: error,
        });
    }
});
exports.getProductReviews = getProductReviews;
const getUserReviews = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { userId } = req.params;
    try {
        const reviews = yield Review_model_1.default.find({ user: userId })
            .populate('product', 'name')
            .sort({ createdAt: -1 });
        return res.status(200).json({
            error: false,
            message: "User reviews retrieved successfully.",
            reviews,
        });
    }
    catch (error) {
        return res.status(500).json({
            error: true,
            message: "Internal server error.",
            err: error,
        });
    }
});
exports.getUserReviews = getUserReviews;
