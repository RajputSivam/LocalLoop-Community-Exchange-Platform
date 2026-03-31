// userRoutes.js
const express = require('express');
const r1 = express.Router();
const { protect } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');
const { userController: c } = require('../controllers/allControllers');
// IMPORTANT: /profile must be before /:id to prevent route collision
r1.put('/profile', protect, upload.single('avatar'), c.updateProfile);
r1.get('/:id', c.getUserProfile);
module.exports = r1;
