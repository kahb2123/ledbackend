const mongoose = require('mongoose');

const workingOrderSchema = new mongoose.Schema({
  orderNumber: {
    type: String,
    required: true,
    unique: true
  },
  customer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  ledType: {
    type: String,
    enum: ['P2', 'P3', 'P4', 'P5', 'P10'],
    required: true
  },
  ledCategory: {
    type: String,
    enum: ['indoor', 'outdoor'],
    required: true
  },
  squareMeters: {
    type: Number,
    required: true,
    min: 1
  },
  pricePerDay: {
    type: Number,
    required: true
  },
  totalPrice: {
    type: Number,
    required: true
  },
  programType: {
    type: String,
    required: true
  },
  programDate: {
    type: Date,
    required: true
  },
  duration: {
    days: { type: Number, required: true, min: 1 },
    hours: { type: Number, default: 0 }
  },
  location: {
    venue: { type: String, required: true },
    city: { type: String, required: true },
    subcity: { type: String, default: '' },
    address: { type: String, default: '' },
    mapLink: { type: String, default: '' }
  },
  requirements: {
    installation: { type: Boolean, default: true },
    technician: { type: Boolean, default: true },
    backup: { type: Boolean, default: false },
    specialInstructions: { type: String, default: '' }
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'assigned', 'in-progress', 'completed', 'cancelled'],
    default: 'pending'
  },
  assignedStaff: [{
    staff: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    role: { type: String, default: 'technician' },
    assignedAt: { type: Date, default: Date.now }
  }],
  payment: {
    method: { type: String, default: '' },
    status: { type: String, enum: ['pending', 'partial', 'paid'], default: 'pending' },
    amount: { type: Number, default: 0 },
    transactionId: { type: String, default: '' },
    paidAt: { type: Date }
  },
  timeline: [{
    status: { type: String, required: true },
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    note: { type: String, default: '' },
    timestamp: { type: Date, default: Date.now }
  }],
  notes: {
    customer: { type: String, default: '' },
    admin: { type: String, default: '' }
  }
}, {
  timestamps: true
});

// Performance indexes (orderNumber already indexed via unique: true)
workingOrderSchema.index({ customer: 1 });
workingOrderSchema.index({ status: 1 });
workingOrderSchema.index({ createdAt: -1 });
workingOrderSchema.index({ programDate: 1 });
workingOrderSchema.index({ status: 1, createdAt: -1 });
workingOrderSchema.index({ customer: 1, status: 1 });

module.exports = mongoose.model('WorkingOrder', workingOrderSchema);
