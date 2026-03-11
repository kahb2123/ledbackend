const mongoose = require('mongoose');

const testimonialSchema = new mongoose.Schema({
  customerName: {
    en: { type: String, required: true },
    am: { type: String, required: true }
  },
  customerRole: {
    en: String,
    am: String
  },
  company: {
    en: String,
    am: String
  },
  content: {
    en: { type: String, required: true },
    am: { type: String, required: true }
  },
  rating: {
    type: Number,
    min: 1,
    max: 5,
    required: true
  },
  image: {
    url: String,
    publicId: String
  },
  order: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order'
  },
  isApproved: {
    type: Boolean,
    default: false
  },
  isFeatured: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Testimonial', testimonialSchema);