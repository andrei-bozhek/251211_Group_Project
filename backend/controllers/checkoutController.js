const asyncHandler = require('express-async-handler');
const Cart = require('../models/cartModel');

const simulateCheckout = asyncHandler(async (req, res) => {
    const cart = await Cart.findOne({ user: req.user.id }).populate('items.product');
    if (!cart || cart.items.length === 0) {
        return res.status(400).json({ message: 'Cart is empty' });
    }
    const amount = cart.items.reduce((sum, item) => {
        const price = item.product ? item.product.price : 0;
        return sum + price * item.quantity;
    }, 0);
    cart.items = [];
    await cart.save();
    const orderId = `ORD${Date.now()}`;
    return res.status(200).json({ status: 'success', orderId, amount });
});

module.exports = {
    simulateCheckout,
};
