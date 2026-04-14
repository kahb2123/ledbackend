const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const { authenticate } = require('../middleware/auth');
const { staffCheck } = require('../middleware/staff');
const { orderLimiter } = require('../middleware/rateLimiter');

// All order routes require authentication
router.use(authenticate);

// MAIN ORDER ROUTE - POST /api/orders
router.post('/', 
  orderLimiter,
  async (req, res, next) => {
    try {
      await orderController.createOrder(req, res);
    } catch (error) {
      next(error);
    }
  }
);

// Get customer's own orders
router.get('/my-orders', 
  async (req, res, next) => {
    try {
      await orderController.getCustomerOrders(req, res);
    } catch (error) {
      next(error);
    }
  }
);

// Get all orders (admin/staff only)
router.get('/', 
  staffCheck,
  async (req, res, next) => {
    try {
      await orderController.getAllOrders(req, res);
    } catch (error) {
      next(error);
    }
  }
);

// Get order by order number
router.get('/number/:number', 
  async (req, res, next) => {
    try {
      await orderController.getOrderByNumber(req, res);
    } catch (error) {
      next(error);
    }
  }
);

// Get single order by ID
router.get('/:id', 
  async (req, res, next) => {
    try {
      await orderController.getOrderById(req, res);
    } catch (error) {
      next(error);
    }
  }
);

// Update order status (admin/staff only)
router.put('/:id/status', 
  staffCheck,
  async (req, res, next) => {
    try {
      await orderController.updateOrderStatus(req, res);
    } catch (error) {
      next(error);
    }
  }
);

// Assign staff to order (admin only)
router.post('/:id/assign', 
  staffCheck,
  async (req, res, next) => {
    try {
      await orderController.assignStaff(req, res);
    } catch (error) {
      next(error);
    }
  }
);

// Cancel order
router.post('/:id/cancel', 
  async (req, res, next) => {
    try {
      await orderController.cancelOrder(req, res);
    } catch (error) {
      next(error);
    }
  }
);

// Error handling middleware
router.use((err, req, res, next) => {
  res.status(500).json({ error: err.message || 'Internal server error' });
});

module.exports = router;
