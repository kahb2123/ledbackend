const express = require('express');
const router = express.Router();
const WorkingOrder = require('../models/WorkingOrder');
const Service = require('../models/Service');
const { authenticate } = require('../middleware/auth');
const { staffCheck } = require('../middleware/staff');
const { calculateTotalPrice } = require('../utils/helpers');

// Generate order number function
const generateOrderNumber = () => {
  const date = new Date();
  const year = date.getFullYear().toString().slice(-2);
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');
  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');
  const seconds = date.getSeconds().toString().padStart(2, '0');
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  return `ORD${year}${month}${day}${hours}${minutes}${seconds}${random}`;
};

// All routes require authentication
router.use(authenticate);

// ==================== CUSTOMER ROUTES ====================

// Create new order (customers only)
router.post('/', async (req, res) => {
  try {
    // Validate required fields
    const requiredFields = ['ledType', 'ledCategory', 'squareMeters', 'programType', 'programDate', 'duration', 'location'];
    const missingFields = requiredFields.filter(field => !req.body[field]);
    
    if (missingFields.length > 0) {
      return res.status(400).json({ 
        error: 'Missing required fields', 
        missingFields 
      });
    }

    // Validate nested objects
    if (!req.body.duration?.days) {
      return res.status(400).json({ error: 'Duration days is required' });
    }

    if (!req.body.location?.venue || !req.body.location?.city) {
      return res.status(400).json({ error: 'Venue and city are required' });
    }

    const service = await Service.findOne({ type: req.body.ledType });
    if (!service) {
      return res.status(400).json({ error: 'Invalid LED type' });
    }

    const totalPrice = calculateTotalPrice(
      service.pricePerDay,
      req.body.squareMeters,
      req.body.duration.days
    );

    const orderNumber = generateOrderNumber();

    const order = new WorkingOrder({
      ...req.body,
      orderNumber,
      customer: req.userId,
      pricePerDay: service.pricePerDay,
      totalPrice,
      timeline: [{
        status: 'pending',
        updatedBy: req.userId,
        note: 'Order created'
      }]
    });

    await order.save();

    res.status(201).json({
      success: true,
      message: 'Order created successfully',
      order: {
        id: order._id,
        orderNumber: order.orderNumber,
        totalPrice: order.totalPrice,
        status: order.status
      }
    });

  } catch (error) {
    // Send appropriate error message
    if (error.name === 'ValidationError') {
      return res.status(400).json({ 
        error: 'Validation error', 
        details: Object.values(error.errors).map(e => e.message)
      });
    }
    
    if (error.code === 11000) {
      return res.status(400).json({ error: 'Duplicate order number' });
    }
    
    res.status(500).json({ 
      error: 'Server error. Please try again later or contact support.',
      details: error.message 
    });
  }
});

// Get customer's own orders
router.get('/my-orders', async (req, res) => {
  try {
    const orders = await WorkingOrder.find({ customer: req.userId })
      .populate('customer', 'firstName lastName email')
      .sort({ createdAt: -1 })
      .lean();

    res.json(orders);
  } catch (error) {
    console.error('Error fetching customer orders:', error.message);
    res.status(500).json({ error: error.message });
  }
});

// Get single order by ID (customer can view their own orders)
router.get('/:id', async (req, res) => {
  try {
    const order = await WorkingOrder.findById(req.params.id)
      .populate('customer', 'firstName lastName email');
    
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    // Check if user is authorized to view this order
    if (order.customer._id.toString() !== req.userId) {
      return res.status(403).json({ error: 'Access denied' });
    }
    
    res.json(order);
  } catch (error) {
    console.error('Error fetching order:', error.message);
    res.status(500).json({ error: error.message });
  }
});

// Cancel order (customer can cancel their own orders)
router.post('/:id/cancel', async (req, res) => {
  try {
    const { reason } = req.body;
    const order = await WorkingOrder.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    // Check authorization - only the customer who owns the order can cancel
    if (order.customer.toString() !== req.userId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    order.status = 'cancelled';
    order.timeline.push({
      status: 'cancelled',
      updatedBy: req.userId,
      note: reason || 'Order cancelled by customer'
    });

    await order.save();

    res.json({ message: 'Order cancelled successfully', order });
  } catch (error) {
    console.error('Error cancelling order:', error.message);
    res.status(500).json({ error: error.message });
  }
});

// ==================== ADMIN/STAFF ROUTES ====================
// All routes below require staff or admin role

// Get all orders (admin/staff only)
router.get('/', staffCheck, async (req, res) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;
    const query = {};
    
    if (status) query.status = status;

    const skip = (page - 1) * limit;

    const orders = await WorkingOrder.find(query)
      .populate('customer', 'firstName lastName email phone')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await WorkingOrder.countDocuments(query);

    res.json({
      orders,
      pagination: {
        total,
        page: parseInt(page),
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching all orders:', error.message);
    res.status(500).json({ error: error.message });
  }
});

// Get single order by ID (admin/staff can view any order)
router.get('/admin/:id', staffCheck, async (req, res) => {
  try {
    const order = await WorkingOrder.findById(req.params.id)
      .populate('customer', 'firstName lastName email phone');
    
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }
    
    res.json(order);
  } catch (error) {
    console.error('Error fetching order:', error.message);
    res.status(500).json({ error: error.message });
  }
});

// Update order status (admin/staff only)
router.put('/:id/status', staffCheck, async (req, res) => {
  try {
    const { status, note } = req.body;
    const order = await WorkingOrder.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    order.status = status;
    order.timeline.push({
      status,
      updatedBy: req.userId,
      note: note || `Status updated to ${status} by admin`
    });

    await order.save();

    res.json(order);
  } catch (error) {
    console.error('Error updating order status:', error.message);
    res.status(500).json({ error: error.message });
  }
});

// Admin cancel any order
router.post('/admin/:id/cancel', staffCheck, async (req, res) => {
  try {
    const { reason } = req.body;
    const order = await WorkingOrder.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    order.status = 'cancelled';
    order.timeline.push({
      status: 'cancelled',
      updatedBy: req.userId,
      note: reason || 'Order cancelled by admin'
    });

    await order.save();

    res.json({ message: 'Order cancelled successfully', order });
  } catch (error) {
    console.error('Error cancelling order:', error.message);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
