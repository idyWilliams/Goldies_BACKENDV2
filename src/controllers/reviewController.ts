import { Request, Response } from "express";
import Review from "../models/Review.model";
import Product from "../models/Product.model";
import { CustomRequest } from "../middleware/verifyJWT";

const createReview = async (req: CustomRequest, res: Response) => {
  const { productId, rating, comment } = req.body;
  const userId = req.id;

  try {
    if (!productId || !rating) {
      return res.status(400).json({ error: true, message: "Product ID and rating are required." });
    }

    // Validate that the product exists
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ error: true, message: "Product not found." });
    }

    // Create a new review
    const review = new Review({
      user: userId,
      product: productId,
      rating,
      comment,
    });

    await review.save();

    return res.status(201).json({
      error: false,
      message: "Review added successfully.",
      review,
    });
  } catch (error) {
    return res.status(500).json({
      error: true,
      message: "Internal server error.",
      err: error,
    });
  }
};




const updateReview = async (req: CustomRequest, res: Response) => {
    const { reviewId } = req.params;
    const { rating, comment } = req.body;
    const userId = req.id;
  
    try {
      const review = await Review.findById(reviewId);
      if (!review) {
        return res.status(404).json({ error: true, message: "Review not found." });
      }
  
      // Only the user who created the review can update it
      if (review.user.toString() !== userId) {
        return res.status(403).json({ error: true, message: "You cannot update someone else's review." });
      }
  
      if (rating) review.rating = rating;
      if (comment) review.comment = comment;
  
      await review.save();
  
      return res.status(200).json({
        error: false,
        message: "Review updated successfully.",
        review,
      });
    } catch (error) {
      return res.status(500).json({
        error: true,
        message: "Internal server error.",
        err: error,
      });
    }
  };

  
  const deleteReview = async (req: CustomRequest, res: Response) => {
    const { reviewId } = req.params;
    const userId = req.id;
  
    try {
      const review = await Review.findById(reviewId);
      if (!review) {
        return res.status(404).json({ error: true, message: "Review not found." });
      }
  
      // Only the user who created the review can delete it
      if (review.user.toString() !== userId) {
        return res.status(403).json({ error: true, message: "You cannot delete someone else's review." });
      }
  
      await Review.findByIdAndDelete(reviewId);
  
      return res.status(200).json({
        error: false,
        message: "Review deleted successfully.",
      });
    } catch (error) {
      return res.status(500).json({
        error: true,
        message: "Internal server error.",
        err: error,
      });
    }
  };

  
//   const getProductReviews = async (req: Request, res: Response) => {
//     const { productId } = req.params;
  
//     try {
//       const reviews = await Review.find({ product: productId })
//         .populate('user', 'firstName lastName')  // Populate user data (optional)
//         .sort({ createdAt: -1 });  // Sort by latest reviews first
  
//       if (!reviews || reviews.length === 0) {
//         return res.status(200).json({ error: false, message: "No reviews found for this product." });
//       }
  
//       return res.status(200).json({
//         error: false,
//         message: "Reviews retrieved successfully.",
//         reviews,
//       });
//     } catch (error) {
//       return res.status(500).json({
//         error: true,
//         message: "Internal server error.",
//         err: error,
//       });
//     }
//   };

const getProductReviews = async (req: Request, res: Response) => {
    const { productId } = req.params;
    const { page = 1, limit = 10 } = req.query;  // Get page and limit from query params
  
    try {
      // Convert page and limit to numbers and ensure they're valid
      const pageNumber = parseInt(page as string, 10);
      const limitNumber = parseInt(limit as string, 10);
  
      if (isNaN(pageNumber) || isNaN(limitNumber)) {
        return res.status(400).json({
          error: true,
          message: "Invalid pagination parameters.",
        });
      }
  
      // Calculate the skip value for pagination
      const skip = (pageNumber - 1) * limitNumber;
  
      // Get reviews with pagination
      const reviews = await Review.find({ product: productId })
        .skip(skip)
        .limit(limitNumber)
        .populate('user', 'firstName lastName')  // Populate user data (optional)
        .sort({ createdAt: -1 });  // Sort by latest reviews first
  
      if (!reviews || reviews.length === 0) {
        return res.status(200).json({ error: false, message: "No reviews found for this product." });
      }
  
      // Get the total count of reviews for pagination
      const totalReviews = await Review.countDocuments({ product: productId });
  
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
    } catch (error) {
      return res.status(500).json({
        error: true,
        message: "Internal server error.",
        err: error,
      });
    }
  };
  
  const getUserReviews = async (req: CustomRequest, res: Response) => {
    const userId = req.id;
  
    try {
      const reviews = await Review.find({ user: userId })
        .populate('product', 'name')
        .sort({ createdAt: -1 });  
  
      if (!reviews || reviews.length === 0) {
        return res.status(404).json({ error: true, message: "No reviews found for this user." });
      }
  
      return res.status(200).json({
        error: false,
        message: "User reviews retrieved successfully.",
        reviews,
      });
    } catch (error) {
      return res.status(500).json({
        error: true,
        message: "Internal server error.",
        err: error,
      });
    }
  };

 export { createReview, updateReview, getProductReviews, deleteReview, getUserReviews}