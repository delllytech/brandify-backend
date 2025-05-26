import { Request, Response, NextFunction } from "express";
import Work from "./workModel";
import dotenv from "dotenv";

dotenv.config();

import { v2 as cloudinary } from 'cloudinary';

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.Cloudinary_Name,
  api_key: process.env.Cloudinary_Api,
  api_secret: process.env.Cloudinary_Key,
});

// Function to extract public ID from Cloudinary URL
const extractPublicIdFromUrl = (imageUrl: string): string | null => {
  try {
    if (!imageUrl || typeof imageUrl !== 'string') return null;
    
    const urlParts = imageUrl.split('/');
    const uploadIndex = urlParts.findIndex(part => part === 'upload');
    
    if (uploadIndex === -1) return null;
    
    const pathAfterUpload = urlParts.slice(uploadIndex + 1);
    
    const pathWithoutVersion = pathAfterUpload[0].startsWith('v') && 
                              /^v\d+$/.test(pathAfterUpload[0])
                              ? pathAfterUpload.slice(1)
                              : pathAfterUpload;
    
    const publicId = pathWithoutVersion.join('/').replace(/\.[^/.]+$/, "");
    
    return publicId;
  } catch (error) {
    console.error('Error extracting public ID from URL:', error);
    return null;
  }
};

export const createWork = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { title, titleImage, content, reviewId } = req.body;

    if (!title || !titleImage || !content) {
      res.status(400).json({ message: "Title, titleImage, and content fields are required" });
      return;
    }

    // No need to validate reviewId as a number since it's now a string

    const workExists = await Work.findOne({ title });
    if (workExists) {
      res.status(400).json({ message: "Work with this title already exists" });
      return;
    }

    const newWork = new Work({
      title,
      titleImage,
      content,
      reviewId
    });

    await newWork.save();
    res.status(201).json({
      message: "Work created successfully",
      work: newWork
    });
  } catch (error) {
    console.error('Error in createWork:', error);
    if (error instanceof Error && error.message.includes('payload')) {
      res.status(413).json({ 
        message: "Request entity too large. Please reduce the size of your images or content.",
        details: error.message
      });
      return;
    }
    next(error);
  }
};

export const getAllWorks = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const works = await Work.find({ isActive: true })
      .sort({ createdAt: -1 });
    res.json(works);
  } catch (error) {
    next(error);
  }
};

export const getWorkById = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const work = await Work.findById(req.params.id);
    
    if (!work || !work.isActive) {
      res.status(404).json({ message: "Work not found" });
      return;
    }
    res.json(work);
  } catch (error) {
    next(error);
  }
};

export const updateWork = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { title, titleImage, content, reviewId } = req.body;
    
    // No need to validate reviewId as a number since it's now a string
    
    // Find the work first
    const work = await Work.findById(req.params.id);
    if (!work) {
      res.status(404).json({ message: "Work not found" });
      return;
    }
    
    // If titleImage is being updated, delete the old image from Cloudinary
    if (titleImage && work.titleImage && work.titleImage !== titleImage) {
      const publicId = extractPublicIdFromUrl(work.titleImage);
      if (publicId) {
        try {
          const result = await cloudinary.uploader.destroy(publicId);
          console.log('Cloudinary deletion result for old image:', result);
        } catch (cloudinaryError) {
          console.error('Error deleting old image from Cloudinary:', cloudinaryError);
          // Continue with the update even if Cloudinary deletion fails
        }
      }
    }
    
    const updatedWork = await Work.findByIdAndUpdate(
      req.params.id,
      { 
        title, 
        titleImage, 
        content,
        // If reviewId is undefined, keep the existing one; if it's null or a value, use the new one
        reviewId: reviewId === undefined ? work.reviewId : reviewId,
        updatedAt: new Date()
      },
      { new: true, runValidators: true }
    );

    if (!updatedWork) {
      res.status(404).json({ message: "Work not found" });
      return;
    }

    res.json({
      message: "Work updated successfully",
      work: updatedWork
    });
  } catch (error) {
    console.error('Error in updateWork:', error);
    if (error instanceof Error && error.message.includes('payload')) {
      res.status(413).json({ 
        message: "Request entity too large. Please reduce the size of your images or content.",
        details: error.message
      });
      return;
    }
    next(error);
  }
};

export const deleteWork = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // First, get the work to access the image URL
    const work = await Work.findById(req.params.id);
    
    if (!work) {
      res.status(404).json({ message: "Work not found" });
      return;
    }

    // Extract public ID from the titleImage URL
    const publicId = extractPublicIdFromUrl(work.titleImage);
    let imageDeleted = false;
    
    // Delete the image from Cloudinary
    if (publicId) {
      try {
        const result = await cloudinary.uploader.destroy(publicId);
        console.log('Cloudinary deletion result:', result);
        
        imageDeleted = result.result === 'ok';
        
        if (result.result !== 'ok' && result.result !== 'not found') {
          console.error('Failed to delete image from Cloudinary:', result);
          // Continue with the database update even if Cloudinary deletion fails
        }
      } catch (cloudinaryError) {
        console.error('Error deleting image from Cloudinary:', cloudinaryError);
        // Continue with the database update even if Cloudinary deletion fails
      }
    } else {
      console.warn('Could not extract public ID from image URL:', work.titleImage);
    }

    // Check for content images and delete them as well
    if (work.content) {
      // Assume content might contain multiple Cloudinary images in HTML or JSON format
      // This is a simplified version - you may need to adjust based on how content is structured
      try {
        const contentString = JSON.stringify(work.content);
        const imageUrlRegex = /https:\/\/res\.cloudinary\.com\/[^"'\s]+/g;
        const contentImageUrls = contentString.match(imageUrlRegex) || [];
        
        for (const imageUrl of contentImageUrls) {
          const contentPublicId = extractPublicIdFromUrl(imageUrl);
          if (contentPublicId) {
            try {
              await cloudinary.uploader.destroy(contentPublicId);
              console.log(`Deleted content image: ${contentPublicId}`);
            } catch (err) {
              console.error(`Failed to delete content image: ${contentPublicId}`, err);
            }
          }
        }
      } catch (err) {
        console.error('Error processing content images:', err);
      }
    }

    // Hard delete the work
    await Work.findByIdAndDelete(req.params.id);

    res.json({ 
      message: "Work deleted successfully",
      imageDeleted 
    });
  } catch (error) {
    next(error);
  }
};

// New function to find works by reviewId
export const getWorksByReviewId = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { reviewId } = req.params;
    
    // No need to validate or convert reviewId since it's a string
    
    const works = await Work.find({ 
      reviewId,
      isActive: true 
    }).sort({ createdAt: -1 });
    
    res.json(works);
  } catch (error) {
    next(error);
  }
};