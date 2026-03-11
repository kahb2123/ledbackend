const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { authenticate } = require('../middleware/auth');
const { adminCheck } = require('../middleware/admin');

// All user routes require authentication
router.use(authenticate);

// Profile routes
router.get('/profile', userController.getProfile);
router.put('/profile', userController.updateProfile);

// Staff routes - THIS MUST COME BEFORE /:id ROUTE
router.get('/staff', adminCheck, userController.getStaff);
router.post('/staff', adminCheck, userController.createStaff);

// Admin only routes (these must come AFTER specific routes)
router.get('/', adminCheck, userController.getAllUsers);
router.get('/:id', adminCheck, userController.getUserById);
router.put('/:id', adminCheck, userController.updateUser);
router.delete('/:id', adminCheck, userController.deleteUser);

module.exports = router;