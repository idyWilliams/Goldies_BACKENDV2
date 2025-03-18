import express from "express";
import { createReview, deleteReview, getProductReviews, getUserReviews, updateReview } from "../controllers/reviewController";
import { authenticateToken } from "../middleware/verifyJWT";

const router = express.Router();

router.post("/", authenticateToken, createReview); 
router.patch("/:reviewId", authenticateToken, updateReview); 
router.delete("/:reviewId", authenticateToken, deleteReview); 
router.get("/product/:productId", getProductReviews); 
router.get("/user/:userId", getUserReviews); 

export default router;
