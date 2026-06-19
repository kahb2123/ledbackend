const express = require('express');
const router = express.Router();

// Import routes
const authRoutes = require('./authRoutes');
const taskRoutes = require('./taskRoutes');
const mediaRoutes = require('./mediaRoutes');
const serviceRoutes = require('./serviceRoutes');
const userRoutes = require('./userRoutes');
const analyticsRoutes = require('./analyticsRoutes');
const workingOrderRoutes = require('./workingOrderRoutes'); // This is the only orders route you need

// Register routes
router.use('/auth', authRoutes);
router.use('/working-orders', workingOrderRoutes); // All order operations go through this
router.use('/tasks', taskRoutes);
router.use('/media', mediaRoutes);
router.use('/services', serviceRoutes);
router.use('/users', userRoutes);
router.use('/analytics', analyticsRoutes);

module.exports = router;