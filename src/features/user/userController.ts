import { Request, Response, NextFunction } from "express";
import User from "./userModel";
import Package from "./packageModel";
import Message from "./messageModel";

// Get user profile
export const getUserProfile = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.params.id;
    
    const user = await User.findById(userId)
      .select('-password')
      .populate('packages', 'title orderId status deadline totalPrice paymentStatus');

    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    res.json({ user });
  } catch (error) {
    next(error);
  }
};

// Update user profile
export const updateUserProfile = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.params.id;
    const { name, email } = req.body;

    const user = await User.findById(userId);
    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    // Update fields if provided
    if (name) user.name = name;
    if (email) user.email = email;

    // Add update to history
    user.history.push(`Profile updated at ${new Date().toISOString()}`);
    
    await user.save();

    res.json({
      message: "Profile updated successfully",
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    next(error);
  }
};

// Get user packages
export const getUserPackages = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.params.id;
    
    const packages = await Package.find({
      $or: [
        { client: userId },
        { representative: userId }
      ]
    })
    .populate('client', 'name email')
    .populate('representative', 'name email')
    .sort({ createdAt: -1 });

    res.json({ packages });
  } catch (error) {
    next(error);
  }
};

// Get user messages
export const getUserMessages = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.params.id;
    
    const messages = await Message.find({
      $or: [
        { sender: userId },
        { recipient: userId }
      ]
    })
    .populate('sender', 'name email')
    .populate('recipient', 'name email')
    .populate('packageId', 'title orderId')
    .sort({ timestamp: -1 });

    res.json({ messages });
  } catch (error) {
    next(error);
  }
};

// Get user history
export const getUserHistory = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.params.id;
    
    const user = await User.findById(userId).select('history');
    
    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    res.json({ history: user.history });
  } catch (error) {
    next(error);
  }
};

// Add to user history
export const addToUserHistory = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.params.id;
    const { event } = req.body;
    
    if (!event) {
      res.status(400).json({ message: "Event description is required" });
      return;
    }

    const user = await User.findById(userId);
    
    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    user.history.push(event);
    await user.save();

    res.json({
      message: "Event added to history",
      history: user.history
    });
  } catch (error) {
    next(error);
  }
};