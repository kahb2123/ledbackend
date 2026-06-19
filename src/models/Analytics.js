const mongoose = require('mongoose');

const analyticsSchema = new mongoose.Schema({
  date: {
    type: Date,
    required: true,
    unique: true
  },
  metrics: {
    totalOrders: { type: Number, default: 0 },
    completedOrders: { type: Number, default: 0 },
    pendingOrders: { type: Number, default: 0 },
    cancelledOrders: { type: Number, default: 0 },
    totalRevenue: { type: Number, default: 0 },
    averageOrderValue: { type: Number, default: 0 }
  },
  ordersByType: {
    P2: { type: Number, default: 0 },
    P3: { type: Number, default: 0 },
    P4: { type: Number, default: 0 },
    P5: { type: Number, default: 0 },
    P10: { type: Number, default: 0 }
  },
  ordersByCategory: {
    indoor: { type: Number, default: 0 },
    outdoor: { type: Number, default: 0 }
  },
  revenueByType: {
    P2: { type: Number, default: 0 },
    P3: { type: Number, default: 0 },
    P4: { type: Number, default: 0 },
    P5: { type: Number, default: 0 },
    P10: { type: Number, default: 0 }
  },
  customerMetrics: {
    newCustomers: { type: Number, default: 0 },
    returningCustomers: { type: Number, default: 0 },
    totalCustomers: { type: Number, default: 0 }
  },
  staffMetrics: {
    totalTasks: { type: Number, default: 0 },
    completedTasks: { type: Number, default: 0 },
    pendingTasks: { type: Number, default: 0 }
  },
  popularLocations: [{
    city: String,
    count: { type: Number, default: 0 }
  }],
  peakHours: [{
    hour: Number,
    count: { type: Number, default: 0 }
  }]
}, {
  timestamps: true
});

module.exports = mongoose.model('Analytics', analyticsSchema);