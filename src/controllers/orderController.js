const Order = require('../models/Order');
const Task = require('../models/Task');
const Service = require('../models/Service');
const User = require('../models/User');
const { generateOrderNumber, calculateTotalPrice } = require('../utils/helpers');
const { sendOrderConfirmation, sendOrderStatusUpdate } = require('../services/emailService');

const orderController = {
  // Create new order
  async createOrder(req, res) {
    try {
      console.log('📝 Creating order...');
      console.log('User ID:', req.userId);
      console.log('Order data:', req.body);

      const orderData = req.body;
      
      // Get service price
      const service = await Service.findOne({ type: orderData.ledType });
      if (!service) {
        return res.status(400).json({ error: 'Invalid LED type' });
      }

      // Calculate total price
      const totalPrice = calculateTotalPrice(
        service.pricePerDay,
        orderData.squareMeters,
        orderData.duration.days
      );

      // Generate order number (no await needed - it's synchronous)
      const orderNumber = generateOrderNumber();

      // Create order
      const order = new Order({
        ...orderData,
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
      console.log('✅ Order saved:', order._id);

      // Send confirmation email (optional - may fail in development)
      try {
        if (req.user?.email) {
          await sendOrderConfirmation(req.user.email, order);
        }
      } catch (emailError) {
        console.log('Email sending failed:', emailError.message);
      }

      res.status(201).json(order);
    } catch (error) {
      console.error('❌ Error creating order:', error);
      res.status(500).json({ error: error.message });
    }
  },

  // Get all orders (with filters)
  async getAllOrders(req, res) {
    try {
      const { status, startDate, endDate, page = 1, limit = 10 } = req.query;
      const query = {};

      if (status) query.status = status;
      if (startDate || endDate) {
        query.programDate = {};
        if (startDate) query.programDate.$gte = new Date(startDate);
        if (endDate) query.programDate.$lte = new Date(endDate);
      }

      // Role-based filtering
      if (req.user.role === 'customer') {
        query.customer = req.userId;
      }

      const skip = (page - 1) * limit;

      const orders = await Order.find(query)
        .populate('customer', 'firstName lastName email phone')
        .populate('assignedStaff.staff', 'firstName lastName')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit));

      const total = await Order.countDocuments(query);

      res.json({
        orders,
        pagination: {
          total,
          page: parseInt(page),
          pages: Math.ceil(total / limit)
        }
      });
    } catch (error) {
      console.error('❌ Error getting orders:', error);
      res.status(500).json({ error: error.message });
    }
  },

  // Get single order
  async getOrderById(req, res) {
    try {
      const order = await Order.findById(req.params.id)
        .populate('customer', 'firstName lastName email phone companyName')
        .populate('assignedStaff.staff', 'firstName lastName email phone')
        .populate('timeline.updatedBy', 'firstName lastName');

      if (!order) {
        return res.status(404).json({ error: 'Order not found' });
      }

      // Check authorization
      if (req.user.role === 'customer' && order.customer._id.toString() !== req.userId) {
        return res.status(403).json({ error: 'Access denied' });
      }

      res.json(order);
    } catch (error) {
      console.error('❌ Error getting order:', error);
      res.status(500).json({ error: error.message });
    }
  },

  // Get order by order number
  async getOrderByNumber(req, res) {
    try {
      const order = await Order.findOne({ orderNumber: req.params.number })
        .populate('customer', 'firstName lastName email phone');

      if (!order) {
        return res.status(404).json({ error: 'Order not found' });
      }

      res.json(order);
    } catch (error) {
      console.error('❌ Error getting order by number:', error);
      res.status(500).json({ error: error.message });
    }
  },

  // Update order status
  async updateOrderStatus(req, res) {
    try {
      const { status, note } = req.body;
      const order = await Order.findById(req.params.id);

      if (!order) {
        return res.status(404).json({ error: 'Order not found' });
      }

      order.status = status;
      order.timeline.push({
        status,
        updatedBy: req.userId,
        note: note || `Status updated to ${status}`
      });

      await order.save();

      // Send status update email
      const customer = await User.findById(order.customer);
      if (customer && customer.email) {
        try {
          await sendOrderStatusUpdate(customer.email, order);
        } catch (emailError) {
          console.log('Email sending failed:', emailError.message);
        }
      }

      res.json(order);
    } catch (error) {
      console.error('❌ Error updating order status:', error);
      res.status(500).json({ error: error.message });
    }
  },

  // Assign staff to order
  async assignStaff(req, res) {
    try {
      const { staffId, role } = req.body;
      const order = await Order.findById(req.params.id);

      if (!order) {
        return res.status(404).json({ error: 'Order not found' });
      }

      // Check if staff is already assigned
      const alreadyAssigned = order.assignedStaff.find(
        s => s.staff.toString() === staffId
      );

      if (!alreadyAssigned) {
        order.assignedStaff.push({
          staff: staffId,
          role: role || 'technician'
        });

        // Create task for staff
        const task = new Task({
          order: order._id,
          assignedTo: staffId,
          assignedBy: req.userId,
          taskType: 'installation',
          title: `Installation for Order ${order.orderNumber}`,
          description: `Install ${order.squareMeters} sqm ${order.ledType} LED screen at ${order.location.venue}`,
          customerDetails: {
            name: order.customer?.name || 'N/A',
            phone: order.customer?.phone || 'N/A',
            address: order.location.address
          },
          ledDetails: {
            type: order.ledType,
            squareMeters: order.squareMeters
          },
          schedule: {
            startDate: order.programDate,
            endDate: new Date(order.programDate.getTime() + order.duration.days * 24 * 60 * 60 * 1000)
          },
          location: order.location
        });

        await task.save();
      }

      await order.save();
      res.json(order);
    } catch (error) {
      console.error('❌ Error assigning staff:', error);
      res.status(500).json({ error: error.message });
    }
  },

  // Cancel order
  async cancelOrder(req, res) {
    try {
      const { reason } = req.body;
      const order = await Order.findById(req.params.id);

      if (!order) {
        return res.status(404).json({ error: 'Order not found' });
      }

      order.status = 'cancelled';
      order.timeline.push({
        status: 'cancelled',
        updatedBy: req.userId,
        note: reason || 'Order cancelled'
      });

      await order.save();

      res.json({ message: 'Order cancelled successfully', order });
    } catch (error) {
      console.error('❌ Error cancelling order:', error);
      res.status(500).json({ error: error.message });
    }
  },

  // Get customer order history
  async getCustomerOrders(req, res) {
    try {
      const orders = await Order.find({ customer: req.userId })
        .sort({ createdAt: -1 })
        .select('orderNumber ledType squareMeters programDate status totalPrice');

      res.json(orders);
    } catch (error) {
      console.error('❌ Error getting customer orders:', error);
      res.status(500).json({ error: error.message });
    }
  }
};

module.exports = orderController;