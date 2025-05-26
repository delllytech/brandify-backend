// orderRoutes.ts
import express from "express";
import {
  createOrder,
  getAllOrders,
  getOrderById,
  updateOrder,
  deleteOrder,
  addMessage,
  getOrderMessages,
  processPayment,
  getClientOrders,
  getClientCompletedOrCancelledOrders
} from "./orderController";

const orderRouter = express.Router();

// Order routes
orderRouter.post("/orders", createOrder);
orderRouter.get("/orders", getAllOrders);
orderRouter.get("/orders/:id", getOrderById);
orderRouter.put("/orders/:id", updateOrder);
orderRouter.delete("/orders/:id", deleteOrder);
orderRouter.get("/orders/client/my-orders", getClientOrders)
orderRouter.get("/orders/client/my-orders/history", getClientCompletedOrCancelledOrders)

// Message routes
orderRouter.post("/orders/:id/messages", addMessage);
orderRouter.get("/orders/:id/messages", getOrderMessages);

// Payment route
orderRouter.post("/orders/:id/pay", processPayment);

export default orderRouter;