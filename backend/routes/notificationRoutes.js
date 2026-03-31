// notificationRoutes.js
const express = require('express');
const r1 = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { notificationController: c } = require('../controllers/allControllers');
r1.get('/', protect, c.getNotifications);
r1.put('/mark-read', protect, c.markRead);
module.exports = r1;
