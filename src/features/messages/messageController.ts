import { Request, Response, NextFunction } from "express";
import Message from "./messageModel";

export const createMessage = async (
  req: Request, 
  res: Response, 
  next: NextFunction
): Promise<void> => {
  try {
    const { name, email, message, type } = req.body;

    if (!name || !email || !message || !type) {
      res.status(400).json({ message: "All fields are required" });
      return;
    }

    const newMessage = new Message({
      name,
      email,
      message,
      type
    });

    await newMessage.save();
    res.status(201).json({ 
      message: "Message sent successfully",
      data: newMessage
    });
  } catch (error) {
    next(error);
  }
};

export const getAllMessages = async (
  req: Request, 
  res: Response, 
  next: NextFunction
): Promise<void> => {
  try {
    const { type, isRead, page = 1, limit = 10 } = req.query;
    
    // Build filter object
    const filter: any = {};
    
    if (type) filter.type = type;
    if (isRead !== undefined) filter.isRead = isRead === 'true';
    
    // Calculate pagination
    const skip = (Number(page) - 1) * Number(limit);
    
    // Execute query with pagination
    const messages = await Message.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));
    
    // Get total count for pagination
    const total = await Message.countDocuments(filter);
    
    res.json({
      messages,
      pagination: {
        total,
        page: Number(page),
        limit: Number(limit),
        pages: Math.ceil(total / Number(limit))
      }
    });
  } catch (error) {
    next(error);
  }
};

export const getMessageById = async (
  req: Request, 
  res: Response, 
  next: NextFunction
): Promise<void> => {
  try {
    const message = await Message.findById(req.params.id);
    if (!message) {
      res.status(404).json({ message: "Message not found" });
      return;
    }
    res.json(message);
  } catch (error) {
    next(error);
  }
};

export const markMessageAsRead = async (
  req: Request, 
  res: Response, 
  next: NextFunction
): Promise<void> => {
  try {
    const updatedMessage = await Message.findByIdAndUpdate(
      req.params.id,
      { isRead: true },
      { new: true }
    );

    if (!updatedMessage) {
      res.status(404).json({ message: "Message not found" });
      return;
    }

    res.json({ 
      message: "Message marked as read",
      data: updatedMessage
    });
  } catch (error) {
    next(error);
  }
};

export const deleteMessage = async (
  req: Request, 
  res: Response, 
  next: NextFunction
): Promise<void> => {
  try {
    const deletedMessage = await Message.findByIdAndDelete(req.params.id);

    if (!deletedMessage) {
      res.status(404).json({ message: "Message not found" });
      return;
    }

    res.json({ 
      message: "Message deleted successfully"
    });
  } catch (error) {
    next(error);
  }
};

export const getMessageStats = async (
  req: Request, 
  res: Response, 
  next: NextFunction
): Promise<void> => {
  try {
    const totalMessages = await Message.countDocuments();
    const unreadMessages = await Message.countDocuments({ isRead: false });
    const messagesByType = await Message.aggregate([
      { $group: { _id: "$type", count: { $sum: 1 } } }
    ]);

    res.json({
      totalMessages,
      unreadMessages,
      messagesByType: messagesByType.map(item => ({
        type: item._id,
        count: item.count
      }))
    });
  } catch (error) {
    next(error);
  }
};