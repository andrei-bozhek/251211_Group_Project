const asyncHandler = require('express-async-handler');
const Cart = require('../models/cartModel');
const Product = require('../models/productModel');

const populateCart = async (cart) => {
    if (!cart) return null;
    const populated = await cart.populate('items.product');
    const total = populated.items.reduce((sum, item) => {
        const price = item.product ? item.product.price : 0;
        return sum + price * item.quantity;
    }, 0);
    return { ...populated.toObject(), total };
};

const getCart = asyncHandler(async (req, res) => {
    const cart = await Cart.findOne({ user: req.user.id });
    const data = await populateCart(cart) || { items: [], total: 0 };
    return res.status(200).json(data);
});

const addToCart = asyncHandler(async (req, res) => {
    const { productId, quantity } = req.body;
    if (!productId) {
        return res.status(400).json({ message: 'Product is required' });
    }
    const product = await Product.findById(productId);
    if (!product) {
        return res.status(404).json({ message: 'Product not found' });
    }
    const qty = quantity ? Number(quantity) : 1;
    if (Number.isNaN(qty) || qty <= 0) {
        return res.status(400).json({ message: 'Quantity must be at least 1' });
    }
    let cart = await Cart.findOne({ user: req.user.id });
    if (!cart) {
        if (qty > product.stock) {
            return res.status(400).json({ message: 'Not enough stock' });
        }
        cart = await Cart.create({
            user: req.user.id,
            items: [{ product: product._id, quantity: qty }],
        });
    } else {
        const existingItem = cart.items.find((item) => item.product.toString() === productId);
        if (existingItem) {
            if (existingItem.quantity + qty > product.stock) {
                return res.status(400).json({ message: 'Not enough stock' });
            }
            existingItem.quantity += qty;
        } else {
            if (qty > product.stock) {
                return res.status(400).json({ message: 'Not enough stock' });
            }
            cart.items.push({ product: product._id, quantity: qty });
        }
        await cart.save();
    }
    const data = await populateCart(cart);
    return res.status(200).json(data);
});

const removeFromCart = asyncHandler(async (req, res) => {
    const { productId } = req.body;
    if (!productId) {
        return res.status(400).json({ message: 'Product is required' });
    }
    const cart = await Cart.findOne({ user: req.user.id });
    if (!cart) {
        return res.status(200).json({ items: [], total: 0 });
    }
    cart.items = cart.items.filter((item) => item.product.toString() !== productId);
    await cart.save();
    const data = await populateCart(cart);
    return res.status(200).json(data);
});

const updateQuantity = asyncHandler(async (req, res) => {
    const { productId, quantity } = req.body;
    if (!productId) {
        return res.status(400).json({ message: 'Product is required' });
    }
    const qty = Number(quantity);
    if (Number.isNaN(qty) || qty < 1) {
        return res.status(400).json({ message: 'Quantity must be at least 1' });
    }
    const product = await Product.findById(productId);
    if (!product) {
        return res.status(404).json({ message: 'Product not found' });
    }
    if (qty > product.stock) {
        return res.status(400).json({ message: 'Not enough stock' });
    }
    const cart = await Cart.findOne({ user: req.user.id });
    if (!cart) {
        return res.status(200).json({ items: [], total: 0 });
    }
    const item = cart.items.find((entry) => entry.product.toString() === productId);
    if (!item) {
        return res.status(404).json({ message: 'Item not in cart' });
    }
    item.quantity = qty;
    await cart.save();
    const data = await populateCart(cart);
    return res.status(200).json(data);
});

const clearCart = asyncHandler(async (req, res) => {
    const cart = await Cart.findOne({ user: req.user.id });
    if (!cart) {
        return res.status(200).json({ items: [], total: 0 });
    }
    cart.items = [];
    await cart.save();
    const data = await populateCart(cart);
    return res.status(200).json(data);
});

module.exports = {
    getCart,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
};
