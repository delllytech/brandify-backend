import express from "express";
import {
  createMessage,
  getAllMessages,
  getMessageById,
  markMessageAsRead,
  deleteMessage,
  getMessageStats
} from "./messageController";

const messageRouter = express.Router();

messageRouter.get("/messages", getAllMessages);

messageRouter.get("/messages/stats", getMessageStats);

messageRouter.get("/messages/:id", getMessageById);

messageRouter.post("/messages", createMessage);

messageRouter.patch("/messages/:id/read", markMessageAsRead);

messageRouter.delete("/messages/:id", deleteMessage);

export default messageRouter;