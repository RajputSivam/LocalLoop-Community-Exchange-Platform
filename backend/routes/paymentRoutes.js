const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { paymentController: c } = require('../controllers/allControllers');
router.get('/config', c.getConfig);
router.post('/create-intent', protect, c.createPaymentIntent);
module.exports = router;
