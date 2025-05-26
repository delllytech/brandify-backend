import mongoose from "mongoose";

const JobSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  responsibilities: {
    type: [String],
    required: true
  },
  educationalRequirements: {
    type: [String],
    required: true
  },
  experienceRequirements: {
    type: [String],
    required: true
  },
  additionalRequirements: {
    type: [String],
  },
  location: {
    type: String,
    required: true
  },
  vacancy: {
    type: Number,
    required: true
  },
  jobType: {
    type: String,
    required: true,
    enum: ['Full-time', 'Part-time', 'Contract', 'Freelance', 'Internship']
  },
  workMode: {
    type: String,
    required: true,
    enum: ['Remote', 'On-site', 'Hybrid']
  },
  salary: {
    type: String,
    
  },
  applicationDeadline: {
    type: Date,
    required: true
  },
  postDate: {
    type: Date,
    default: Date.now
  },
  isActive: {
    type: Boolean,
    default: true
  }
});

const Job = mongoose.model("Job", JobSchema);
export default Job;