// orderModel.ts
import mongoose from "mongoose";

const MessageSchema = new mongoose.Schema({
  text: {
    type: String,
    required: true
  },
  senderType: {
    type: String,
    enum: ['client', 'admin'],
    required: true
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
});

const OrderSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'in-progress', 'completed', 'cancelled'],
    default: 'pending'
  },
  deadline: {
    type: Date
  },
  representative: {
    type: String
  },
  scheduledCall: {
    type: Date
  },
  totalPrice: {
    type: Number,
    default: 0
  },
  paymentStatus: {
    type: String,
    default: 'due'
  },
  amountDue: {
    type: Number
  },
  client: {
    type: String,
    required: true,
  },
  clientId: {
    type: String,
    required: true,
  },
  messages: [MessageSchema],
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Pre-save middleware to update the updatedAt field
OrderSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

const Order = mongoose.model("Order", OrderSchema);
export default Order;