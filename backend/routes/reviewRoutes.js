// reviewRoutes.js
const express = require('express');
const r1 = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { reviewController: c } = require('../controllers/allControllers');
r1.post('/', protect, c.createReview);
r1.get('/user/:userId', c.getUserReviews);
module.exports = r1;
