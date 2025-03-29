import express from "express";
import {
  createReview,
  deleteReview,
  getProductReviews,
  getUserReviews,
  updateReview,
  likeReview,
  getReviewStats,
} from "../controllers/reviewController";
import {
  authenticateToken,
  optionalAuthenticateToken,
} from "../middleware/verifyJWT";

const router = express.Router();

// Create, update and delete reviews (requires authentication)
router.post("/", authenticateToken, createReview);
router.patch("/:reviewId", authenticateToken, updateReview);
router.delete("/:reviewId", authenticateToken, deleteReview);

// Like a review (works with or without authentication)
router.post("/:reviewId/like", optionalAuthenticateToken, likeReview);

// Get reviews (no authentication required)
router.get("/product/:productId", optionalAuthenticateToken, getProductReviews);
router.get("/user/:userId", getUserReviews);
router.get("/stats", getReviewStats);

export default router;
