import express from "express";
import {
  createReview,
  getAllReviews,
  getReviewById,
  updateReview,
  deleteReview
} from "./reviewController";

const reviewRouter = express.Router();

// Get all reviews
reviewRouter.get("/reviews", getAllReviews);

// Get review by ID
reviewRouter.get("/reviews/:id", getReviewById);

// Create new review
reviewRouter.post("/reviews", createReview);

// Update existing review
reviewRouter.put("/reviews/:id", updateReview);

// Delete review
reviewRouter.delete("/reviews/:id", deleteReview);

export default reviewRouter;