// orderController.ts
import { Request, Response, NextFunction } from "express";
import Order from "./orderModel";
import jwt from 'jsonwebtoken';
import { Resend } from "resend";

// Create a new order
export const createOrder = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const resend = new Resend(process.env.RESEND_API_KEY);
  try {
    // Check authentication first
    let token = req.header('Authorization')?.replace('Bearer ', '');
    
    // If no token in header, try to get it from cookies
    if (!token) {
      token = req.cookies.token;
    }

    if (!token) {
      res.status(401).json({ message: 'No token provided' });
      return;
    }

    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET!) as {username: string, userId: string};
    } catch (error) {
      res.status(401).json({ message: 'Invalid token' });
      return;
    }

    // Extract order data from request body
    const {
      title,
      description,
      status,
      deadline,
      representative,
      scheduledCall,
      totalPrice,
      paymentStatus,
      amountDue
    } = req.body;

    if (!title || !description) {
      res.status(400).json({ message: "Title and description are required" });
      return;
    }

    const newOrder = new Order({
      title,
      description,
      status,
      deadline,
      representative,
      scheduledCall,
      totalPrice,
      paymentStatus,
      amountDue,
      client: decoded.username, 
      clientId: decoded.userId,
      messages: []
    });

    await newOrder.save();
    res.status(201).json({
      message: "Order created successfully",
      order: newOrder
    });

    const { data, error } = await resend.emails.send({
      from: "Acme <onboarding@resend.dev>",
      to: ["zubairahmedrafi37@gmail.com"],
      subject: "hello world",
      html: "<strong>it works!</strong>",
    });
  } catch (error) {
    next(error);
  }
};

// Get all orders
export const getAllOrders = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const orders = await Order.find()
      .sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    next(error);
  }
};


export const getOrderById = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const order = await Order.findById(req.params.id);
    
    if (!order) {
      res.status(404).json({ message: "Order not found" });
      return;
    }
    res.json(order);
  } catch (error) {
    next(error);
  }
};

// Update order
export const updateOrder = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const {
      title,
      description,
      status,
      deadline,
      representative,
      scheduledCall,
      totalPrice,
      paymentStatus,
      amountDue
    } = req.body;
    
    const updatedOrder = await Order.findByIdAndUpdate(
      req.params.id,
      {
        title,
        description,
        status,
        deadline,
        representative,
        scheduledCall,
        totalPrice,
        paymentStatus,
        amountDue
      },
      { new: true, runValidators: true }
    );
    
    if (!updatedOrder) {
      res.status(404).json({ message: "Order not found" });
      return;
    }
    
    res.json({
      message: "Order updated successfully",
      order: updatedOrder
    });
  } catch (error) {
    next(error);
  }
};

// Delete order
export const deleteOrder = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const deletedOrder = await Order.findByIdAndDelete(req.params.id);
    
    if (!deletedOrder) {
      res.status(404).json({ message: "Order not found" });
      return;
    }
    
    res.json({ 
      message: "Order deleted successfully" 
    });
  } catch (error) {
    next(error);
  }
};

// Add a message to an order conversation
export const addMessage = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { text, senderType } = req.body;
    
    if (!text || !senderType) {
      res.status(400).json({ message: "Text and sender type are required" });
      return;
    }
    
    if (!['client', 'admin'].includes(senderType)) {
      res.status(400).json({ message: "Sender type must be 'client' or 'admin'" });
      return;
    }
    
    const order = await Order.findById(req.params.id);
    
    if (!order) {
      res.status(404).json({ message: "Order not found" });
      return;
    }
    
    const newMessage = {
      text,
      senderType,
      timestamp: new Date()
    };
    
    order.messages.push(newMessage);
    await order.save();
    
    res.status(201).json({
      message: "Message added successfully",
      orderMessages: order.messages
    });
  } catch (error) {
    next(error);
  }
};

// Get all messages for an order
export const getOrderMessages = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const order = await Order.findById(req.params.id);
    
    if (!order) {
      res.status(404).json({ message: "Order not found" });
      return;
    }
    
    res.json(order.messages);
  } catch (error) {
    next(error);
  }
};

// Process payment for an order
export const processPayment = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { amount } = req.body;
    
    if (!amount || amount <= 0) {
      res.status(400).json({ message: "Valid payment amount is required" });
      return;
    }
    
    const order = await Order.findById(req.params.id);
    
    if (!order) {
      res.status(404).json({ message: "Order not found" });
      return;
    }
    
    // Calculate new amount due
    const newAmountDue = (order.amountDue || 0) - amount;
    
    // Update payment status based on new amount due
    let newPaymentStatus = 'due';
    if (newAmountDue <= 0) {
      newPaymentStatus = 'paid';
    } else if (newAmountDue < order.totalPrice) {
      newPaymentStatus = 'partial';
    }
    
    order.amountDue = Math.max(0, newAmountDue);
    order.paymentStatus = newPaymentStatus;
    
    await order.save();
    
    res.json({
      message: "Payment processed successfully",
      order: {
        id: order._id,
        totalPrice: order.totalPrice,
        amountDue: order.amountDue,
        paymentStatus: order.paymentStatus
      }
    });
  } catch (error) {
    next(error);
  }
};


export const getClientOrders = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    let token = req.header('Authorization')?.replace('Bearer ', '');
    
  
    if (!token) {
      token = req.cookies.token;
    }

    if (!token) {
      res.status(401).json({ message: 'No token provided' });
      return;
    }

    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET!) as {username: string, userId: string};
    } catch (error) {
      res.status(401).json({ message: 'Invalid token' });
      return;
    }

    const orders = await Order.find({ clientId: decoded.userId })
      .sort({ createdAt: -1 });
    
    res.json({
      message: "Client orders retrieved successfully",
      count: orders.length,
      orders: orders
    });
  } catch (error) {
    next(error);
  }
};

// Get completed or cancelled orders for a specific client (authenticated user)
export const getClientCompletedOrCancelledOrders = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // Check authentication first
    let token = req.header('Authorization')?.replace('Bearer ', '');
    
    // If no token in header, try to get it from cookies
    if (!token) {
      token = req.cookies.token;
    }

    if (!token) {
      res.status(401).json({ message: 'No token provided' });
      return;
    }

    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET!) as {username: string, userId: string};
    } catch (error) {
      res.status(401).json({ message: 'Invalid token' });
      return;
    }

    // Find orders for this client that are either completed or cancelled
    const orders = await Order.find({ 
      clientId: decoded.userId,
      status: { $in: ['completed', 'cancelled'] }
    })
    .sort({ createdAt: -1 });
    
    res.json({
      message: "Client completed/cancelled orders retrieved successfully",
      count: orders.length,
      orders: orders
    });
  } catch (error) {
    next(error);
  }
};