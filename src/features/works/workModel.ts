// workModel.ts
import mongoose from 'mongoose';

const workSchema = new mongoose.Schema({
  title: { type: String, required: true, unique: true },
  titleImage: { type: String, required: true },
  content: { type: String, required: true }, // HTML content from React Quill
  reviewId: { type: String, required: false }, // Optional review ID as a number
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

export default mongoose.model('Work', workSchema);