import mongoose from "mongoose";

const PackageSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  orderId: {
    type: String,
    required: true,
    unique: true
  },
  client: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  representative: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  status: {
    type: String,
    enum: ['Pending', 'In Progress', 'Completed'],
    default: 'Pending'
  },
  deadline: {
    type: Date,
    required: true
  },
  totalPrice: {
    type: Number,
    required: true
  },
  paymentStatus: {
    type: String,
    enum: ['Due', 'Paid'],
    default: 'Due'
  },
  amountDue: {
    type: Number
  },
  scheduledCall: {
    date: Date,
    time: String
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Generate a unique order ID before saving
PackageSchema.pre('save', function(next) {
  if (!this.orderId) {
    this.orderId = `R${Math.floor(10000 + Math.random() * 90000)}`;
  }
  next();
});

const Package = mongoose.model("Package", PackageSchema);
export default Package;