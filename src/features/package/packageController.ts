import { Request, Response, NextFunction } from "express";
import Package from "./packageModel";

export const createPackage = async (
  req: Request, 
  res: Response, 
  next: NextFunction
): Promise<void> => {
  try {
    const { title, subtitle, monthlyFee, features } = req.body;

    if (!title || !subtitle || !monthlyFee || !features) {
      res.status(400).json({ message: "All fields are required" });
      return;
    }

    const packageExists = await Package.findOne({ title });
    if (packageExists) {
      res.status(400).json({ message: "Package with this title already exists" });
      return;
    }

    const newPackage = new Package({
      title,
      subtitle,
      monthlyFee,
      features
    });

    await newPackage.save();
    res.status(201).json({ 
      message: "Package created successfully",
      package: newPackage
    });
  } catch (error) {
    next(error);
  }
};

export const getAllPackages = async (
  req: Request, 
  res: Response, 
  next: NextFunction
): Promise<void> => {
  try {
    const packages = await Package.find({ isActive: true });
    res.json(packages);
  } catch (error) {
    next(error);
  }
};

export const getPackageById = async (
  req: Request, 
  res: Response, 
  next: NextFunction
): Promise<void> => {
  try {
    const packageLocal = await Package.findById(req.params.id);
    if (!packageLocal) {
      res.status(404).json({ message: "Package not found" });
      return;
    }
    res.json(packageLocal);
  } catch (error) {
    next(error);
  }
};

export const updatePackage = async (
  req: Request, 
  res: Response, 
  next: NextFunction
): Promise<void> => {
  try {
    const { title, subtitle, monthlyFee, features } = req.body;
    
    const updatedPackage = await Package.findByIdAndUpdate(
      req.params.id,
      { title, subtitle, monthlyFee, features },
      { new: true, runValidators: true }
    );

    if (!updatedPackage) {
      res.status(404).json({ message: "Package not found" });
      return;
    }

    res.json({ 
      message: "Package updated successfully",
      package: updatedPackage
    });
  } catch (error) {
    next(error);
  }
};

export const deletePackage = async (
  req: Request, 
  res: Response, 
  next: NextFunction
): Promise<void> => {
  try {
    // Soft delete by setting isActive to false
    const deletedPackage = await Package.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true }
    );

    if (!deletedPackage) {
      res.status(404).json({ message: "Package not found" });
      return;
    }

    res.json({ message: "Package deleted successfully" });
  } catch (error) {
    next(error);
  }
};