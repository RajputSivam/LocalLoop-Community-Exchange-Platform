// borrowRoutes.js
const express = require('express');
const r1 = express.Router();
const { protect } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');
const { createBorrowRequest, respondToBorrowRequest, activateBorrow, uploadReturnProof, completeReturn, getMyBorrowRequests, getBorrowRequest } = require('../controllers/borrowController');
r1.post('/request', protect, createBorrowRequest);
r1.get('/my', protect, getMyBorrowRequests);
r1.get('/:id', protect, getBorrowRequest);
r1.put('/:id/respond', protect, respondToBorrowRequest);
r1.put('/:id/activate', protect, activateBorrow);
r1.put('/:id/return-proof', protect, upload.array('photos', 5), uploadReturnProof);
r1.put('/:id/complete', protect, completeReturn);
module.exports = r1;

// ─────────────────────────────────────────────
