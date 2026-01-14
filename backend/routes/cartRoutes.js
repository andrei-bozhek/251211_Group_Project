const express = require('express');
const router = express.Router();
const { getCart, addToCart, removeFromCart, updateQuantity, clearCart } = require('../controllers/cartController');
const { protect } = require('../middleware/authMiddleware');

router.get('/', protect, getCart);
router.post('/add', protect, addToCart);
router.post('/remove', protect, removeFromCart);
router.patch('/update', protect, updateQuantity);
router.post('/clear', protect, clearCart);

module.exports = router;
