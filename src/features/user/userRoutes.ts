import express from "express";
import {
  getUserProfile,
  updateUserProfile,
  getUserPackages,
  getUserMessages,
  getUserHistory,
  addToUserHistory
} from "./userController";

const router = express.Router();


router.get("/users/:id", getUserProfile);
router.put("/users/:id", updateUserProfile);
router.get("/users/:id/packages", getUserPackages);
router.get("/users/:id/messages", getUserMessages);
router.get("/users/:id/history", getUserHistory);
router.post("/users/:id/history", addToUserHistory);

export default router;