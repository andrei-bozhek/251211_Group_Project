const express = require('express');
const router = express.Router();
const { simulateCheckout } = require('../controllers/checkoutController');
const { protect } = require('../middleware/authMiddleware');

router.post('/', protect, simulateCheckout);

module.exports = router;
