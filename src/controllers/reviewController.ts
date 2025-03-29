import { Request, Response } from "express";
import Review from "../models/Review.model";
import Product from "../models/Product.model";
import { CustomRequest } from "../middleware/verifyJWT";
import mongoose from "mongoose";

// Helper function to update product statistics
const updateProductStats = async (productId: string) => {
  try {
    const reviews = await Review.find({ product: productId });

    // Calculate average rating
    const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
    const averageRating = reviews.length > 0 ? totalRating / reviews.length : 0;

    // Count ratings by star level
    const ratingsCount = {
      total: reviews.length,
      "5": reviews.filter((review) => review.rating === 5).length,
      "4": reviews.filter((review) => review.rating === 4).length,
      "3": reviews.filter((review) => review.rating === 3).length,
      "2": reviews.filter((review) => review.rating === 2).length,
      "1": reviews.filter((review) => review.rating === 1).length,
    };

    // Count total likes across all reviews
    const likesCount = reviews.reduce(
      (sum, review) => sum + review.likes.length,
      0
    );

    // Update product with new statistics
    await Product.findByIdAndUpdate(productId, {
      averageRating: Number(averageRating.toFixed(1)),
      ratingsCount,
      reviewsCount: reviews.length,
      likesCount,
    });
  } catch (error) {
    console.error("Error updating product stats:", error);
  }
};

const createReview = async (req: CustomRequest, res: Response) => {
  const { productId, rating, comment } = req.body;
  const userId = req.id;

  try {
    if (!productId || !rating) {
      return res
        .status(400)
        .json({ error: true, message: "Product ID and rating are required." });
    }

    // Validate that the product exists
    const product = await Product.findById(productId);
    if (!product) {
      return res
        .status(404)
        .json({ error: true, message: "Product not found." });
    }

    // Check if user already reviewed this product
    const existingReview = await Review.findOne({
      user: userId,
      product: productId,
    });
    if (existingReview) {
      return res.status(400).json({
        error: true,
        message:
          "You have already reviewed this product. Please update your existing review.",
      });
    }

    // Create a new review
    const review = new Review({
      user: userId,
      product: productId,
      rating,
      comment,
      likes: [],
    });

    await review.save();

    // Update product statistics
    await updateProductStats(productId);

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
      return res
        .status(404)
        .json({ error: true, message: "Review not found." });
    }

    // Only the user who created the review can update it
    if (review.user.toString() !== userId) {
      return res
        .status(403)
        .json({
          error: true,
          message: "You cannot update someone else's review.",
        });
    }

    if (rating) review.rating = rating;
    if (comment !== undefined) review.comment = comment;

    await review.save();

    // Update product statistics after review change
    await updateProductStats(review.product.toString());

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
      return res
        .status(404)
        .json({ error: true, message: "Review not found." });
    }

    // Only the user who created the review can delete it
    if (review.user.toString() !== userId) {
      return res
        .status(403)
        .json({
          error: true,
          message: "You cannot delete someone else's review.",
        });
    }

    const productId = review.product;

    await Review.findByIdAndDelete(reviewId);

    // Update product statistics after review deletion
    await updateProductStats(productId.toString());

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

const likeReview = async (req: Request, res: Response) => {
  const { reviewId } = req.params;
  const userId = (req as CustomRequest).id || null; // User may be authenticated or not

  try {
    const review = await Review.findById(reviewId);
    if (!review) {
      return res
        .status(404)
        .json({ error: true, message: "Review not found." });
    }

    // If user is authenticated, we can store their ID with the like
    if (userId) {
      // Check if user already liked this review
      const alreadyLiked = review.likes.some((id) => id.toString() === userId);

      if (alreadyLiked) {
        // Remove like (toggle)
        review.likes = review.likes.filter((id) => id.toString() !== userId);
      } else {
        // Add like
        review.likes.push(userId as any);
      }

      await review.save();

      // Update product statistics
      await updateProductStats(review.product.toString());

      return res.status(200).json({
        error: false,
        message: alreadyLiked
          ? "Review unliked successfully."
          : "Review liked successfully.",
        liked: !alreadyLiked,
        likesCount: review.likes.length,
      });
    } else {
      // For anonymous users, just increment likes but don't track who liked it
      return res.status(200).json({
        error: false,
        message: "Like registered (anonymous)",
        likesCount: review.likes.length,
      });
    }
  } catch (error) {
    return res.status(500).json({
      error: true,
      message: "Internal server error.",
      err: error,
    });
  }
};

 const getProductReviews = async (req: Request, res: Response) => {
  const { productId } = req.params;
  const { page = 1, limit = 10, sort = "newest" } = req.query;
  const userId = (req as CustomRequest).id || null;

  try {
    // Validate product exists
    const product = await Product.findById(productId);
    if (!product) {
      return res
        .status(404)
        .json({ error: true, message: "Product not found." });
    }

    // Convert page and limit to numbers
    const pageNumber = parseInt(page as string, 10);
    const limitNumber = parseInt(limit as string, 10);

    if (isNaN(pageNumber) || isNaN(limitNumber)) {
      return res.status(400).json({
        error: true,
        message: "Invalid pagination parameters.",
      });
    }

    // Calculate skip value for pagination
    const skip = (pageNumber - 1) * limitNumber;

    // Determine sort order - FIX: Use proper sort syntax for Mongoose
    let sortOption: any = { createdAt: -1 }; // Default: newest first

    if (sort === "highest") {
      sortOption = { rating: -1 };
    } else if (sort === "lowest") {
      sortOption = { rating: 1 };
    } else if (sort === "popular") {
      // Sort by likes count using the $size operator in aggregation
      const reviews = await Review.aggregate([
        { $match: { product: new mongoose.Types.ObjectId(productId) } },
        { $addFields: { likesCount: { $size: "$likes" } } },
        { $sort: { likesCount: -1 } },
        { $skip: skip },
        { $limit: limitNumber },
        {
          $lookup: {
            from: "users",
            localField: "user",
            foreignField: "_id",
            as: "userDetails",
          },
        },
        { $unwind: "$userDetails" },
        {
          $project: {
            _id: 1,
            rating: 1,
            comment: 1,
            likes: 1,
            createdAt: 1,
            updatedAt: 1,
            product: 1,
            user: 1,
            likesCount: 1,
            "userDetails.firstName": 1,
            "userDetails.lastName": 1,
          },
        },
      ]);

      // Get total reviews for pagination
      const totalReviews = await Review.countDocuments({ product: productId });
      const totalPages = Math.ceil(totalReviews / limitNumber);

      // If user is authenticated, check which reviews they've liked
      let userLikedReviews: string[] = [];
      if (userId) {
        userLikedReviews = reviews
          .filter((review) =>
            review.likes.some(
              (id: mongoose.Types.ObjectId) => id.toString() === userId
            )
          )
          .map((review) => review._id.toString());
      }

      // Format reviews to match the regular find() response structure
      const formattedReviews = reviews.map((review) => ({
        ...review,
        user: {
          _id: review.user,
          firstName: review.userDetails.firstName,
          lastName: review.userDetails.lastName,
        },
      }));

      // Get product statistics
      const productStats = {
        averageRating: product.averageRating,
        ratingsCount: product.ratingsCount,
        reviewsCount: product.reviewsCount,
        likesCount: product.likesCount,
      };

      return res.status(200).json({
        error: false,
        message: "Reviews retrieved successfully.",
        reviews: formattedReviews,
        totalPages,
        currentPage: pageNumber,
        totalReviews,
        productStats,
        userLikedReviews,
      });
    }

    // For other sort options, use the regular find query
    if (sort !== "popular") {
      const reviews = await Review.find({ product: productId })
        .skip(skip)
        .limit(limitNumber)
        .populate("user", "firstName lastName")
        .sort(sortOption);

      // Get total reviews for pagination
      const totalReviews = await Review.countDocuments({ product: productId });
      const totalPages = Math.ceil(totalReviews / limitNumber);

      // If user is authenticated, check which reviews they've liked
      let userLikedReviews: string[] = [];
      if (userId) {
        userLikedReviews = reviews
          .filter((review) =>
            review.likes.some((id) => id.toString() === userId)
          )
          .map((review: any) => review._id.toString());
      }

      // Get product statistics
      const productStats = {
        averageRating: product.averageRating,
        ratingsCount: product.ratingsCount,
        reviewsCount: product.reviewsCount,
        likesCount: product.likesCount,
      };

      return res.status(200).json({
        error: false,
        message: "Reviews retrieved successfully.",
        reviews,
        totalPages,
        currentPage: pageNumber,
        totalReviews,
        productStats,
        userLikedReviews,
      });
    }
  } catch (error) {
    return res.status(500).json({
      error: true,
      message: "Internal server error.",
      err: error,
    });
  }
};

const getUserReviews = async (req: Request, res: Response) => {
  const { userId } = req.params;
  const { page = 1, limit = 10 } = req.query;

  try {
    // Convert page and limit to numbers
    const pageNumber = parseInt(page as string, 10);
    const limitNumber = parseInt(limit as string, 10);

    if (isNaN(pageNumber) || isNaN(limitNumber)) {
      return res.status(400).json({
        error: true,
        message: "Invalid pagination parameters.",
      });
    }


    const skip = (pageNumber - 1) * limitNumber;


    const reviews = await Review.find({ user: userId })
      .skip(skip)
      .limit(limitNumber)
      .populate("product", "name images")
      .sort({ createdAt: -1 });


    const totalReviews = await Review.countDocuments({ user: userId });
    const totalPages = Math.ceil(totalReviews / limitNumber);


    const userStats = {
      totalReviews,
      averageRating:
        reviews.length > 0
          ? reviews.reduce((sum, review) => sum + review.rating, 0) /
            reviews.length
          : 0,
      totalLikesReceived: reviews.reduce(
        (sum, review) => sum + review.likes.length,
        0
      ),
    };

    return res.status(200).json({
      error: false,
      message: "User reviews retrieved successfully.",
      reviews,
      totalPages,
      currentPage: pageNumber,
      totalReviews,
      userStats,
    });
  } catch (error) {
    return res.status(500).json({
      error: true,
      message: "Internal server error.",
      err: error,
    });
  }
};

const getReviewStats = async (req: Request, res: Response) => {
  try {

    const totalReviews = await Review.countDocuments();


    const allReviews = await Review.find();
    const averageGlobalRating =
      allReviews.length > 0
        ? allReviews.reduce((sum, review) => sum + review.rating, 0) /
          allReviews.length
        : 0;


    const totalLikes = allReviews.reduce(
      (sum, review) => sum + review.likes.length,
      0
    );

    // Distribution of ratings
    const ratingDistribution = {
      "5": await Review.countDocuments({ rating: 5 }),
      "4": await Review.countDocuments({ rating: 4 }),
      "3": await Review.countDocuments({ rating: 3 }),
      "2": await Review.countDocuments({ rating: 2 }),
      "1": await Review.countDocuments({ rating: 1 }),
    };

    // Number of products with reviews
    const productsWithReviews = await Product.countDocuments({
      reviewsCount: { $gt: 0 },
    });

    return res.status(200).json({
      error: false,
      message: "Review statistics retrieved successfully.",
      stats: {
        totalReviews,
        averageGlobalRating: Number(averageGlobalRating.toFixed(1)),
        totalLikes,
        ratingDistribution,
        productsWithReviews,
      },
    });
  } catch (error) {
    return res.status(500).json({
      error: true,
      message: "Internal server error.",
      err: error,
    });
  }
};

export {
  createReview,
  updateReview,
  deleteReview,
  likeReview,
  getProductReviews,
  getUserReviews,
  getReviewStats,
};
