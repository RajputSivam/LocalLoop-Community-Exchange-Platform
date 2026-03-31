const express = require('express');
const router = express.Router();
const { protect, adminOnly } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');
const { fileDispute, respondToDispute, resolveDispute, getMyDisputes, getAllDisputes, getDispute } = require('../controllers/disputeController');

router.post('/', protect, upload.array('evidence', 5), fileDispute);
router.get('/my', protect, getMyDisputes);
router.get('/all', protect, adminOnly, getAllDisputes);
router.get('/:id', protect, getDispute);
router.put('/:id/respond', protect, upload.array('evidence', 5), respondToDispute);
router.put('/:id/resolve', protect, adminOnly, resolveDispute);
module.exports = router;
