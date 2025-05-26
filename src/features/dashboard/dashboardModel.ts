import mongoose from "mongoose";

// Schema for what makes us different items
const WhatMakesUsDifferentSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  smallIcon: {
    type: String,
    required: false
  }
});

const DashboardSchema = new mongoose.Schema({
  pageTitle: {
    type: String,
    required: true
  },
  pageSubtitle: {
    type: String,
    required: true
  },
  happyClientNumber: {
    type: Number,
    required: true,
    default: 0
  },
  successRate: {
    type: Number,
    required: true,
    default: 0,
    min: 0,
    max: 100
  },
  trustMessage: {
    type: String,
    required: true
  },
  clientNumber: {
    type: Number,
    required: true,
    default: 0
  },
  projectNumber: {
    type: Number,
    required: true,
    default: 0
  },
  countriesNumber: {
    type: Number,
    required: true,
    default: 0
  },
  companyImages: [{
    type: String,
    required: false
  }],
  whatMakesUsDifferent: [WhatMakesUsDifferentSchema],
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update the updatedAt field before saving
DashboardSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

const Dashboard = mongoose.model("Dashboard", DashboardSchema);
export default Dashboard;