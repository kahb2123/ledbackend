const express = require('express');
const router = express.Router();
const taskController = require('../controllers/taskController');
const { authenticate } = require('../middleware/auth');
const { staffCheck } = require('../middleware/staff');
const { uploadMultiple } = require('../middleware/upload');

// All routes require authentication
router.use(authenticate);

// Staff routes
router.get('/my-tasks', taskController.getMyTasks);
router.get('/today', staffCheck, taskController.getTodaysTasks);
router.put('/:id/status', staffCheck, taskController.updateTaskStatus);
router.post('/:id/photos', staffCheck, uploadMultiple, taskController.uploadCompletionPhotos);
router.post('/:id/issues', staffCheck, taskController.reportIssue);
router.put('/:id/issues/resolve', staffCheck, taskController.resolveIssue);

// Admin/Staff routes
router.get('/', staffCheck, taskController.getAllTasks);
router.post('/', staffCheck, taskController.createTask);
router.get('/:id', staffCheck, taskController.getTaskById);

module.exports = router;