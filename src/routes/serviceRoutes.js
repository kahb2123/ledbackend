const express = require('express');
const router = express.Router();
const serviceController = require('../controllers/serviceController');
const { authenticate } = require('../middleware/auth');
const { adminCheck } = require('../middleware/admin');

// Public routes
router.get('/', serviceController.getAllServices);
router.get('/type/:type', serviceController.getServiceByType);
router.get('/:id', serviceController.getServiceById);
router.post('/calculate', serviceController.calculatePrice);

// Admin only routes
router.post('/', authenticate, adminCheck, serviceController.createService);
router.put('/:id', authenticate, adminCheck, serviceController.updateService);
router.delete('/:id', authenticate, adminCheck, serviceController.deleteService);

module.exports = router;