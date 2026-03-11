const express = require('express');
const router = express.Router();
const analyticsController = require('../controllers/analyticsController');
const { authenticate } = require('../middleware/auth');
const { adminCheck } = require('../middleware/admin');

// All analytics routes require admin authentication
router.use(authenticate, adminCheck);

// Dashboard analytics
router.get('/dashboard', analyticsController.getDashboardStats);
router.get('/revenue', analyticsController.getRevenueAnalytics);
router.get('/orders', analyticsController.getOrderAnalytics);
router.get('/tasks', analyticsController.getTaskAnalytics);
router.get('/customers', analyticsController.getCustomerAnalytics);
router.get('/popular-services', analyticsController.getPopularServices);
router.get('/export', analyticsController.exportReport);

module.exports = router;