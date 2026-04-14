const Order = require('../models/Order');
const Task = require('../models/Task');
const User = require('../models/User');

const analyticsController = {
  // Get dashboard statistics
  async getDashboardStats(req, res) {
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const [
        totalOrders,
        pendingOrders,
        completedOrders,
        totalRevenue,
        totalCustomers,
        totalStaff,
        todayTasks,
        recentOrders
      ] = await Promise.all([
        Order.countDocuments(),
        Order.countDocuments({ status: 'pending' }),
        Order.countDocuments({ status: 'completed' }),
        Order.aggregate([{ $match: { status: 'completed' } }, { $group: { _id: null, total: { $sum: '$totalPrice' } } }]),
        User.countDocuments({ role: 'customer' }),
        User.countDocuments({ role: 'staff' }),
        Task.countDocuments({ 'schedule.startDate': { $gte: today } }),
        Order.find().sort({ createdAt: -1 }).limit(5).populate('customer', 'firstName lastName')
      ]);

      res.json({
        overview: {
          totalOrders,
          pendingOrders,
          completedOrders,
          totalRevenue: totalRevenue[0]?.total || 0,
          totalCustomers,
          totalStaff,
          todayTasks
        },
        recentOrders
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  // Get revenue analytics
  async getRevenueAnalytics(req, res) {
    try {
      const { period = 'month' } = req.query;
      const now = new Date();
      let startDate;

      switch (period) {
        case 'week':
          startDate = new Date(now.setDate(now.getDate() - 7));
          break;
        case 'month':
          startDate = new Date(now.setMonth(now.getMonth() - 1));
          break;
        case 'year':
          startDate = new Date(now.setFullYear(now.getFullYear() - 1));
          break;
        default:
          startDate = new Date(now.setMonth(now.getMonth() - 1));
      }

      const revenue = await Order.aggregate([
        { $match: { createdAt: { $gte: startDate }, status: 'completed' } },
        {
          $group: {
            _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
            total: { $sum: '$totalPrice' },
            count: { $sum: 1 }
          }
        },
        { $sort: { _id: 1 } }
      ]);

      res.json(revenue);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  // Get order analytics
  async getOrderAnalytics(req, res) {
    try {
      const [ordersByStatus, ordersByType] = await Promise.all([
        Order.aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }]),
        Order.aggregate([{ $group: { _id: '$ledType', count: { $sum: 1 } } }])
      ]);

      res.json({
        byStatus: ordersByStatus,
        byType: ordersByType
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  // Get task analytics
  async getTaskAnalytics(req, res) {
    try {
      const [tasksByStatus, tasksByPriority] = await Promise.all([
        Task.aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }]),
        Task.aggregate([{ $group: { _id: '$priority', count: { $sum: 1 } } }])
      ]);

      res.json({
        byStatus: tasksByStatus,
        byPriority: tasksByPriority
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  // Get customer analytics
  async getCustomerAnalytics(req, res) {
    try {
      const [newCustomers, topCustomers] = await Promise.all([
        User.countDocuments({ 
          role: 'customer',
          createdAt: { $gte: new Date(new Date().setMonth(new Date().getMonth() - 1)) }
        }),
        Order.aggregate([
          { $group: { _id: '$customer', totalSpent: { $sum: '$totalPrice' }, orderCount: { $sum: 1 } } },
          { $sort: { totalSpent: -1 } },
          { $limit: 10 },
          { $lookup: { from: 'users', localField: '_id', foreignField: '_id', as: 'customer' } }
        ])
      ]);

      res.json({
        newCustomers,
        topCustomers
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  // Get popular services
  async getPopularServices(req, res) {
    try {
      const popularServices = await Order.aggregate([
        { $group: { _id: '$ledType', count: { $sum: 1 }, revenue: { $sum: '$totalPrice' } } },
        { $sort: { count: -1 } }
      ]);

      res.json(popularServices);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  // Export report
  async exportReport(req, res) {
    try {
      const { type = 'orders', startDate, endDate } = req.query;
      let data;

      if (type === 'orders') {
        data = await Order.find({
          createdAt: {
            $gte: new Date(startDate || new Date().setMonth(new Date().getMonth() - 1)),
            $lte: new Date(endDate || new Date())
          }
        }).populate('customer', 'firstName lastName email');
      }

      res.json({
        type,
        generatedAt: new Date(),
        data
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
};

module.exports = analyticsController;