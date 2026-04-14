const express = require('express');
const router = express.Router();
const mediaController = require('../controllers/mediaController');
const { authenticate } = require('../middleware/auth');
const { adminCheck } = require('../middleware/admin');
const { uploadImage, uploadVideo, uploadMultiple } = require('../middleware/upload');

// Public routes
router.get('/', mediaController.getAllMedia);
router.get('/:id', mediaController.getMediaById);
router.get('/category/:category', mediaController.getMediaByCategory);

// Protected routes (require authentication)
router.use(authenticate);

// Image upload
router.post('/image', adminCheck, uploadImage.single('image'), mediaController.uploadImage);
router.post('/images', adminCheck, uploadMultiple, mediaController.uploadMultiple);

// Video upload
router.post('/video', adminCheck, uploadVideo.single('video'), mediaController.uploadVideo);

// Update and delete
router.put('/:id', adminCheck, mediaController.updateMedia);
router.delete('/:id', adminCheck, mediaController.deleteMedia);

// Reorder
router.post('/reorder', adminCheck, mediaController.reorderMedia);

module.exports = router;