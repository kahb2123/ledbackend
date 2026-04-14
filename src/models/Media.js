const mongoose = require('mongoose');

const mediaSchema = new mongoose.Schema({
  title: {
    en: { type: String, required: true },
    am: { type: String, required: true }
  },
  description: {
    en: String,
    am: String
  },
  type: {
    type: String,
    enum: ['image', 'video'],
    required: true
  },
  category: {
    type: String,
    enum: ['service', 'gallery', 'testimonial', 'event', 'installation', 'hero-video'],
    required: true
  },
  url: {
    type: String,
    required: true
  },
  publicId: {
    type: String,
    required: true
  },
  thumbnail: {
    type: String
  },
  format: String,
  size: Number,
  dimensions: {
    width: Number,
    height: Number
  },
  duration: Number,
  uploadedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  tags: [String],
  isPublic: {
    type: Boolean,
    default: true
  },
  order: {
    type: Number,
    default: 0
  },
  relatedTo: {
    model: {
      type: String,
      enum: ['Service', 'Order', 'Task', 'Testimonial']
    },
    id: {
      type: mongoose.Schema.Types.ObjectId
    }
  },
  metadata: {
    type: Map,
    of: String
  }
}, {
  timestamps: true
});

// Performance indexes
mediaSchema.index({ category: 1, order: 1 });
mediaSchema.index({ type: 1 });
mediaSchema.index({ isPublic: 1 });
mediaSchema.index({ uploadedBy: 1 });

module.exports = mongoose.model('Media', mediaSchema);
