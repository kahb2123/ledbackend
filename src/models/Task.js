const mongoose = require('mongoose');

// Helper function to generate task number
const generateTaskNumber = () => {
  const date = new Date();
  const year = date.getFullYear().toString().slice(-2);
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');
  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');
  const seconds = date.getSeconds().toString().padStart(2, '0');
  const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
  return `TSK${year}${month}${day}${hours}${minutes}${seconds}${random}`;
};

const taskSchema = new mongoose.Schema({
  taskNumber: {
    type: String,
    required: true,
    unique: true,
    default: generateTaskNumber // Default value set here
  },
  order: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'WorkingOrder',
    required: true
  },
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  assignedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  taskType: {
    type: String,
    enum: ['installation', 'maintenance', 'pickup', 'delivery', 'support', 'other'],
    required: true
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  },
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  customerDetails: {
    name: { type: String, default: '' },
    phone: { type: String, default: '' },
    email: { type: String, default: '' },
    address: { type: String, default: '' }
  },
  ledDetails: {
    type: { type: String, default: '' },
    squareMeters: { type: Number, default: 0 },
    quantity: { type: Number, default: 1 }
  },
  schedule: {
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    startTime: { type: String, default: '09:00' },
    endTime: { type: String, default: '17:00' }
  },
  location: {
    venue: { type: String, default: '' },
    city: { type: String, default: '' },
    subcity: { type: String, default: '' },
    address: { type: String, default: '' },
    instructions: { type: String, default: '' }
  },
  status: {
    type: String,
    enum: ['pending', 'in-progress', 'completed', 'cancelled'],
    default: 'pending'
  },
  progress: {
    type: Number,
    min: 0,
    max: 100,
    default: 0
  },
  completionPhotos: [{
    url: String,
    publicId: String,
    uploadedAt: { type: Date, default: Date.now },
    caption: String
  }],
  completionNotes: {
    type: String
  },
  completedAt: {
    type: Date
  },
  materials: [{
    item: String,
    quantity: Number,
    used: { type: Boolean, default: false }
  }],
  issues: [{
    reportedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    description: String,
    severity: { type: String, enum: ['low', 'medium', 'high'], default: 'medium' },
    status: { type: String, enum: ['open', 'resolved'], default: 'open' },
    resolvedAt: Date,
    resolution: String
  }]
}, {
  timestamps: true
});

// Performance indexes
taskSchema.index({ assignedTo: 1 });
taskSchema.index({ order: 1 });
taskSchema.index({ status: 1 });
taskSchema.index({ 'schedule.startDate': 1 });
taskSchema.index({ assignedTo: 1, status: 1 });
taskSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Task', taskSchema);
