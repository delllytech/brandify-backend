import mongoose from "mongoose";

const PackageSchema = new mongoose.Schema({
  title: { 
    type: String, 
    required: true, 
    unique: true 
  },
  subtitle: { 
    type: String, 
    required: true 
  },
  monthlyFee: { 
    type: Number, 
    required: true,
    min: 0 
  },
  features: [{ 
    type: String,
    required: true 
  }],
  createdAt: { 
    type: Date, 
    default: Date.now 
  },
  isActive: { 
    type: Boolean, 
    default: true 
  }
});

const Package = mongoose.model("Package", PackageSchema);
export default Package;