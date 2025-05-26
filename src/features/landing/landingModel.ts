import mongoose from "mongoose";

const LandingSchema = new mongoose.Schema({
  qualities: {
    type: [String],
    required: true
  },
  totalTrustedUsers: {
    type: Number,
    required: true
  },
  overallRating: {
    type: Number,
    required: true
  },
  projectsCompleted: {
    type: Number,
    required: true
  },
  clientsServed: {
    type: Number,
    required: true
  },
  countriesReached: {
    type: Number,
    required: true
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

const Landing = mongoose.model("Landing", LandingSchema);
export default Landing;