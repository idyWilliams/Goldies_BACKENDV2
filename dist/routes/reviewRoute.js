"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const reviewController_1 = require("../controllers/reviewController");
const verifyJWT_1 = require("../middleware/verifyJWT");
const router = express_1.default.Router();
// Create, update and delete reviews (requires authentication)
router.post("/", verifyJWT_1.authenticateToken, reviewController_1.createReview);
router.patch("/:reviewId", verifyJWT_1.authenticateToken, reviewController_1.updateReview);
router.delete("/:reviewId", verifyJWT_1.authenticateToken, reviewController_1.deleteReview);
// Like a review (works with or without authentication)
router.post("/:reviewId/like", verifyJWT_1.optionalAuthenticateToken, reviewController_1.likeReview);
// Get reviews (no authentication required)
router.get("/product/:productId", verifyJWT_1.optionalAuthenticateToken, reviewController_1.getProductReviews);
router.get("/user/:userId", reviewController_1.getUserReviews);
router.get("/stats", reviewController_1.getReviewStats);
exports.default = router;
