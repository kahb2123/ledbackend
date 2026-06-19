const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { authenticate } = require('../middleware/auth');
const { adminCheck } = require('../middleware/admin');
const { authLimiter } = require('../middleware/rateLimiter');

// Webhook endpoint (no auth required)
router.post('/webhook', express.raw({ type: 'application/json' }), authController.handleWebhook);

// Protected routes
router.get('/me', authenticate, authController.getCurrentUser);
router.put('/user/:userId/role', authenticate, adminCheck, authController.updateUserRole);

module.exports = router;