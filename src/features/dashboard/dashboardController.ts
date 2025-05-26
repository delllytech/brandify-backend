import { Request, Response, NextFunction } from "express";
import Dashboard from "./dashboardModel";

export const createOrUpdateDashboard = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const {
      pageTitle,
      pageSubtitle,
      happyClientNumber,
      successRate,
      trustMessage,
      clientNumber,
      projectNumber,
      countriesNumber,
      companyImages,
      whatMakesUsDifferent
    } = req.body;

    // Validate required fields
    if (!pageTitle || !pageSubtitle || !trustMessage) {
      res.status(400).json({ message: "Page title, subtitle, and trust message are required" });
      return;
    }

    // Validate success rate
    if (successRate !== undefined && (successRate < 0 || successRate > 100)) {
      res.status(400).json({ message: "Success rate must be between 0 and 100" });
      return;
    }

    // Check if dashboard already exists
    const existingDashboard = await Dashboard.findOne();

    const dashboardData = {
      pageTitle,
      pageSubtitle,
      happyClientNumber: happyClientNumber || 0,
      successRate: successRate || 0,
      trustMessage,
      clientNumber: clientNumber || 0,
      projectNumber: projectNumber || 0,
      countriesNumber: countriesNumber || 0,
      companyImages: companyImages || [],
      whatMakesUsDifferent: whatMakesUsDifferent || [],
      updatedAt: new Date()
    };

    let dashboard;
    let message;

    if (existingDashboard) {
      // Update existing dashboard
      dashboard = await Dashboard.findByIdAndUpdate(
        existingDashboard._id,
        dashboardData,
        { new: true, runValidators: true }
      );
      message = "Dashboard updated successfully";
    } else {
      // Create new dashboard
      dashboard = new Dashboard(dashboardData);
      await dashboard.save();
      message = "Dashboard created successfully";
    }

    res.status(existingDashboard ? 200 : 201).json({
      message,
      data: dashboard
    });
  } catch (error) {
    next(error);
  }
};

export const getDashboard = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // Get the single dashboard
    const dashboard = await Dashboard.findOne();
    
    if (!dashboard) {
      res.status(404).json({ message: "Dashboard not found" });
      return;
    }

    res.json(dashboard);
  } catch (error) {
    next(error);
  }
};

export const deleteDashboard = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const dashboard = await Dashboard.findOne();

    if (!dashboard) {
      res.status(404).json({ message: "Dashboard not found" });
      return;
    }

    await Dashboard.findByIdAndDelete(dashboard._id);

    res.json({
      message: "Dashboard deleted successfully"
    });
  } catch (error) {
    next(error);
  }
};

export const getDashboardStats = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const dashboard = await Dashboard.findOne();
    
    if (!dashboard) {
      res.json({
        exists: false,
        keyMetrics: null
      });
      return;
    }

    const stats = {
      exists: true,
      keyMetrics: {
        happyClients: dashboard.happyClientNumber,
        successRate: dashboard.successRate,
        totalClients: dashboard.clientNumber,
        totalProjects: dashboard.projectNumber,
        countriesServed: dashboard.countriesNumber
      },
      lastUpdated: dashboard.updatedAt
    };

    res.json(stats);
  } catch (error) {
    next(error);
  }
};