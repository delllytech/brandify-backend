import { Request, Response, NextFunction } from "express";
import FAQ from "./faqModel";

export const createFAQ = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { question, answer } = req.body;

    if (!question || !answer) {
      res.status(400).json({ message: "Question and answer are required" });
      return;
    }

    const faqExists = await FAQ.findOne({ question });
    if (faqExists) {
      res.status(400).json({ message: "FAQ with this question already exists" });
      return;
    }

    const newFAQ = new FAQ({
      question,
      answer
    });

    await newFAQ.save();
    res.status(201).json({
      message: "FAQ created successfully",
      faq: newFAQ
    });
  } catch (error) {
    next(error);
  }
};

export const getAllFAQs = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const faqs = await FAQ.find({ isActive: true })
      .sort({ createdAt: -1 });
    res.json(faqs);
  } catch (error) {
    next(error);
  }
};

export const getFAQById = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const faq = await FAQ.findById(req.params.id);
    
    if (!faq) {
      res.status(404).json({ message: "FAQ not found" });
      return;
    }
    res.json(faq);
  } catch (error) {
    next(error);
  }
};

export const updateFAQ = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { question, answer } = req.body;
    
    if (!question || !answer) {
      res.status(400).json({ message: "Question and answer are required" });
      return;
    }
    
    const duplicateFAQ = await FAQ.findOne({ 
      question, 
      _id: { $ne: req.params.id } 
    });
    
    if (duplicateFAQ) {
      res.status(400).json({ message: "Another FAQ with this question already exists" });
      return;
    } 
    
    const updatedFAQ = await FAQ.findByIdAndUpdate(
      req.params.id,
      {
        question,
        answer
      },
      { new: true, runValidators: true }
    );
    
    if (!updatedFAQ) {
      res.status(404).json({ message: "FAQ not found" });
      return;
    }
    
    res.json({
      message: "FAQ updated successfully",
      faq: updatedFAQ
    });
  } catch (error) {
    next(error);
  }
};

export const deleteFAQ = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const deletedFAQ = await FAQ.findByIdAndDelete(req.params.id);
    
    if (!deletedFAQ) {
      res.status(404).json({ message: "FAQ not found" });
      return;
    }
    
    res.json({ 
      message: "FAQ deleted successfully" 
    });
  } catch (error) {
    next(error);
  }
};