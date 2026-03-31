// walletRoutes.js
const express = require('express');
const r = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { getWallet, addFunds, confirmDeposit } = require('../controllers/walletController');
r.get('/', protect, getWallet);
r.post('/add-funds', protect, addFunds);
r.post('/confirm', protect, confirmDeposit);
module.exports = r;
