"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const reviewController_1 = require("../controllers/reviewController");
const verifyJWT_1 = require("../middleware/verifyJWT");
const router = express_1.default.Router();
router.post("/", verifyJWT_1.authenticateToken, reviewController_1.createReview);
router.patch("/:reviewId", verifyJWT_1.authenticateToken, reviewController_1.updateReview);
router.delete("/:reviewId", verifyJWT_1.authenticateToken, reviewController_1.deleteReview);
router.get("/product/:productId", reviewController_1.getProductReviews);
router.get("/user/:userId", reviewController_1.getUserReviews);
exports.default = router;
