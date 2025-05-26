import { Request, Response, NextFunction } from "express";
import Landing from "./landingModel";

export const createLanding = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { 
      qualities, 
      totalTrustedUsers, 
      overallRating, 
      projectsCompleted, 
      clientsServed, 
      countriesReached
    } = req.body;

    if (!qualities || !totalTrustedUsers || !overallRating || !projectsCompleted || !clientsServed || !countriesReached) {
      res.status(400).json({ message: "All fields are required" });
      return;
    }

    // Delete all existing records first
    await Landing.deleteMany({});

    // Create new landing data
    const newLanding = new Landing({
      qualities,
      totalTrustedUsers,
      overallRating,
      projectsCompleted,
      clientsServed,
      countriesReached
    });

    await newLanding.save();
    res.status(201).json({
      message: "Landing page data created successfully",
      data: newLanding
    });
  } catch (error) {
    next(error);
  }
};

export const getLandingData = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // Get the most recent landing data
    const landingData = await Landing.findOne().sort({ updatedAt: -1 });
    
    if (!landingData) {
      res.status(404).json({ message: "Landing page data not found" });
      return;
    }
    
    res.json(landingData);
  } catch (error) {
    next(error);
  }
};