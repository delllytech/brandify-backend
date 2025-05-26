import express from "express";
import {
  createOrUpdateDashboard,
  getDashboard,
  deleteDashboard,
  getDashboardStats
} from "./dashboardController";

const dashboardRouter = express.Router();

// Get the dashboard
dashboardRouter.get("/dashboard", getDashboard);

// Get dashboard statistics
dashboardRouter.get("/dashboard/stats", getDashboardStats);

// Create or update dashboard (single endpoint for both operations)
dashboardRouter.post("/dashboard", createOrUpdateDashboard);

// Update dashboard (alternative endpoint)
dashboardRouter.put("/dashboard", createOrUpdateDashboard);

// Delete dashboard
dashboardRouter.delete("/dashboard", deleteDashboard);

export default dashboardRouter;