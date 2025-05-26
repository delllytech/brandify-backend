import { Request, Response, NextFunction } from "express";
import Review from "./reviewModel";

export const createReview = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { name, review, designation, stars, image } = req.body;

    if (!name || !review || !designation) {
      res.status(400).json({ message: "Name, review, and designation are required" });
      return;
    }

    const newReview = new Review({
      name,
      review,
      designation,
      stars: stars || 5,
      image: image || null
    });

    await newReview.save();
    res.status(201).json({
      message: "Review created successfully",
      review: newReview
    });
  } catch (error) {
    next(error);
  }
};

export const getAllReviews = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const reviews = await Review.find({ isActive: true })
      .sort({ createdAt: -1 });
    res.json(reviews);
  } catch (error) {
    next(error);
  }
};

export const getReviewById = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const review = await Review.findById(req.params.id);
    
    if (!review) {
      res.status(404).json({ message: "Review not found" });
      return;
    }
    res.json(review);
  } catch (error) {
    next(error);
  }
};

export const updateReview = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { name, review, designation, stars, image } = req.body;
    
    // Validate required fields
    if (!name || !review || !designation) {
      res.status(400).json({ message: "Name, review, and designation are required" });
      return;
    }
    
    // Find and update the review
    const updatedReview = await Review.findByIdAndUpdate(
      req.params.id,
      {
        name,
        review,
        designation,
        stars: stars || 5,
        image: image || null
      },
      { new: true, runValidators: true }
    );
    
    // Check if review exists
    if (!updatedReview) {
      res.status(404).json({ message: "Review not found" });
      return;
    }
    
    res.json({
      message: "Review updated successfully",
      review: updatedReview
    });
  } catch (error) {
    next(error);
  }
};

export const deleteReview = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const deletedReview = await Review.findByIdAndDelete(req.params.id);
    
    if (!deletedReview) {
      res.status(404).json({ message: "Review not found" });
      return;
    }
    
    res.json({ 
      message: "Review deleted successfully" 
    });
  } catch (error) {
    next(error);
  }
};