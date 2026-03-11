const mongoose = require('mongoose');

const serviceSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['P2', 'P3', 'P4', 'P5', 'P10'],
    required: true,
    unique: true
  },
  category: {
    type: String,
    enum: ['indoor', 'outdoor'],
    required: true
  },
  name: {
    en: { type: String, required: true },
    am: { type: String, required: true }
  },
  description: {
    en: { type: String, required: true },
    am: { type: String, required: true }
  },
  pricePerDay: {
    type: Number,
    required: true
  },
  specifications: {
    pixelPitch: String,
    brightness: String,
    resolution: String,
    weight: String,
    dimensions: String,
    powerConsumption: String,
    viewingAngle: String,
    lifespan: String,
    ipRating: String
  },
  features: [{
    en: String,
    am: String
  }],
  images: [{
    url: { type: String, required: true },
    publicId: String,
    isPrimary: { type: Boolean, default: false },
    caption: { en: String, am: String }
  }],
  applications: [{
    en: String,
    am: String
  }],
  isAvailable: {
    type: Boolean,
    default: true
  },
  minOrder: {
    type: Number,
    default: 1
  },
  maxOrder: {
    type: Number
  },
  stockQuantity: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Service', serviceSchema);