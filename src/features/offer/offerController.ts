import { Request, Response, NextFunction } from "express";
import Offer from "./offerModel";
import dotenv from "dotenv";

dotenv.config();

import { v2 as cloudinary } from 'cloudinary';

// Configure Cloudinary (this should be in your config file)
cloudinary.config({
  cloud_name: process.env.Cloudinary_Name,
  api_key: process.env.Cloudinary_Api,
  api_secret: process.env.Cloudinary_Key,
});

// Function to extract public ID from Cloudinary URL
const extractPublicIdFromUrl = (imageUrl: string): string | null => {
  try {
    // Example URL: https://res.cloudinary.com/your-cloud-name/image/upload/v1234567890/folder/image-name.jpg
    const urlParts = imageUrl.split('/');
    const uploadIndex = urlParts.findIndex(part => part === 'upload');
    
    if (uploadIndex === -1) return null;
    
    // Get everything after 'upload' and the version (if exists)
    const pathAfterUpload = urlParts.slice(uploadIndex + 1);
    
    // Remove version if it exists (starts with 'v' followed by numbers)
    const pathWithoutVersion = pathAfterUpload[0].startsWith('v') && 
                              /^v\d+$/.test(pathAfterUpload[0])
                              ? pathAfterUpload.slice(1)
                              : pathAfterUpload;
    
    // Join the remaining parts and remove file extension
    const publicId = pathWithoutVersion.join('/').replace(/\.[^/.]+$/, "");
    
    return publicId;
  } catch (error) {
    console.error('Error extracting public ID from URL:', error);
    return null;
  }
};

export const createOffer = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { name, description, image } = req.body;

    if (!name || !description || !image) {
      res.status(400).json({ message: "All required fields must be provided" });
      return;
    }

    const offerExists = await Offer.findOne({ name });
    if (offerExists) {
      res.status(400).json({ message: "Offer with this name already exists" });
      return;
    }

    const newOffer = new Offer({
      name,
      description,
      image
    });

    await newOffer.save();
    res.status(201).json({
      message: "Offer created successfully",
      offer: newOffer
    });
  } catch (error) {
    next(error);
  }
};

export const getAllOffers = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const offers = await Offer.find()
      .sort({ createdAt: -1 });
    res.json(offers);
  } catch (error) {
    next(error);
  }
};

export const getOfferById = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const offer = await Offer.findById(req.params.id);
    
    if (!offer) {
      res.status(404).json({ message: "Offer not found" });
      return;
    }
    res.json(offer);
  } catch (error) {
    next(error);
  }
};

export const updateOffer = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { name, description, image } = req.body;
    
    const updatedOffer = await Offer.findByIdAndUpdate(
      req.params.id,
      { name, description, image },
      { new: true, runValidators: true }
    );

    if (!updatedOffer) {
      res.status(404).json({ message: "Offer not found" });
      return;
    }

    res.json({
      message: "Offer updated successfully",
      offer: updatedOffer
    });
  } catch (error) {
    next(error);
  }
};

export const deleteOffer = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // First, get the offer to access the image URL
    const offer = await Offer.findById(req.params.id);
    
    if (!offer) {
      res.status(404).json({ message: "Offer not found" });
      return;
    }

    // Extract public ID from the image URL
    const publicId = extractPublicIdFromUrl(offer.image);
    
    // Delete the image from Cloudinary
    if (publicId) {
      try {
        const result = await cloudinary.uploader.destroy(publicId);
        console.log('Cloudinary deletion result:', result);
        
        if (result.result !== 'ok' && result.result !== 'not found') {
          console.error('Failed to delete image from Cloudinary:', result);
          // You might want to handle this differently based on your requirements
          // For now, we'll continue with the database deletion
        }
      } catch (cloudinaryError) {
        console.error('Error deleting image from Cloudinary:', cloudinaryError);
        // Don't throw error here, continue with database deletion
        // You might want to log this for manual cleanup later
      }
    } else {
      console.warn('Could not extract public ID from image URL:', offer.image);
    }

    // Soft delete the offer (set isActive to false)
    await Offer.findByIdAndDelete(req.params.id);

    res.json({ 
      message: "Offer deleted successfully",
      imageDeleted: !!publicId 
    });
  } catch (error) {
    next(error);
  }
};