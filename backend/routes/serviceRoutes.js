const express = require('express');
const router = express.Router();
const { serviceController: c } = require('../controllers/allControllers');
const { protect } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

router.get('/', c.getServices);
router.get('/my', protect, c.getMyServices);
router.get('/:id', c.getService);
router.post('/', protect, upload.array('images', 5), c.createService);
router.put('/:id', protect, c.updateService);
router.delete('/:id', protect, c.deleteService);
module.exports = router;
