const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
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
    days: { type: Number, required: true },
    hours: { type: Number, default: 0 }
  },
  location: {
    venue: { type: String, required: true },
    city: { type: String, required: true },
    subcity: { type: String },
    address: { type: String },
    mapLink: { type: String }
  },
  requirements: {
    installation: { type: Boolean, default: true },
    technician: { type: Boolean, default: true },
    backup: { type: Boolean, default: false },
    specialInstructions: { type: String }
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'assigned', 'in-progress', 'completed', 'cancelled'],
    default: 'pending'
  },
  assignedStaff: [{
    staff: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    role: String,
    assignedAt: { type: Date, default: Date.now }
  }],
  payment: {
    method: String,
    status: { type: String, enum: ['pending', 'partial', 'paid'], default: 'pending' },
    amount: Number,
    transactionId: String,
    paidAt: Date
  },
  timeline: [{
    status: String,
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    note: String,
    timestamp: { type: Date, default: Date.now }
  }],
  notes: {
    customer: String,
    admin: String
  }
}, {
  timestamps: true
});

// SIMPLE PRE-SAVE HOOK - Generate order number
orderSchema.pre('save', function(next) {
  if (!this.orderNumber) {
    const date = new Date();
    const year = date.getFullYear().toString().slice(-2);
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    const seconds = date.getSeconds().toString().padStart(2, '0');
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    
    // Format: LED-YYMMDD-HHMMSS-RANDOM (guaranteed unique)
    this.orderNumber = `LED${year}${month}${day}${hours}${minutes}${seconds}${random}`;
    console.log('Generated order number:', this.orderNumber);
  }
  next();
});

// Add error handler for debugging (optional)
orderSchema.post('save', function(error, doc, next) {
  if (error) {
    console.error('Error saving order:', error);
    next(error);
  } else {
    next();
  }
});

console.log('📦 Order model loaded with simple pre-save hook');

module.exports = mongoose.model('Order', orderSchema);