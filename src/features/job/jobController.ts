import { Request, Response, NextFunction } from "express";
import Job from "./jobModel";

export const createJob = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const {
      title,
      description,
      responsibilities,
      educationalRequirements,
      experienceRequirements,
      additionalRequirements,
      location,
      vacancy,
      jobType,
      workMode,
      salary,
      applicationDeadline
    } = req.body;

    // Check for required fields
    if (!title || !description || !responsibilities || !educationalRequirements || 
        !experienceRequirements  || !location || 
        !vacancy || !jobType || !workMode || !applicationDeadline) {
      res.status(400).json({ message: "Missing required fields" });
      return;
    }

    const newJob = new Job({
      title,
      description,
      responsibilities,
      educationalRequirements,
      experienceRequirements,
      additionalRequirements,
      location,
      vacancy,
      jobType,
      workMode,
      salary,
      applicationDeadline: new Date(applicationDeadline)
    });

    await newJob.save();
    res.status(201).json({
      message: "Job created successfully",
      job: newJob
    });
  } catch (error) {
    next(error);
  }
};

export const getAllJobs = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const jobs = await Job.find({ isActive: true })
      .sort({ postDate: -1 });
    res.json(jobs);
  } catch (error) {
    next(error);
  }
};

export const getJobById = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const job = await Job.findById(req.params.id);
    
    if (!job) {
      res.status(404).json({ message: "Job not found" });
      return;
    }
    
    res.json(job);
  } catch (error) {
    next(error);
  }
};

export const updateJob = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const {
      title,
      description,
      responsibilities,
      educationalRequirements,
      experienceRequirements,
      additionalRequirements,
      location,
      vacancy,
      jobType,
      workMode,
      salary,
      applicationDeadline,
      isActive
    } = req.body;

    // Process the date properly if provided
    const updates: any = {
      title,
      description,
      responsibilities,
      educationalRequirements,
      experienceRequirements,
      additionalRequirements,
      location,
      vacancy,
      jobType,
      workMode,
      salary,
      isActive
    };

    if (applicationDeadline) {
      updates.applicationDeadline = new Date(applicationDeadline);
    }

    // Remove undefined properties
    Object.keys(updates).forEach(key => updates[key] === undefined && delete updates[key]);

    const updatedJob = await Job.findByIdAndUpdate(
      req.params.id,
      updates,
      { new: true, runValidators: true }
    );

    if (!updatedJob) {
      res.status(404).json({ message: "Job not found" });
      return;
    }

    res.json({
      message: "Job updated successfully",
      job: updatedJob
    });
  } catch (error) {
    next(error);
  }
};

export const deleteJob = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const deletedJob = await Job.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true }
    );

    if (!deletedJob) {
      res.status(404).json({ message: "Job not found" });
      return;
    }

    res.json({ message: "Job deleted successfully" });
  } catch (error) {
    next(error);
  }
};