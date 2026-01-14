const asyncHandler = require('express-async-handler');
const mongoose = require('mongoose');
const Product = require('../models/productModel');
const Category = require('../models/categoryModel');

const findCategory = async (value) => {
    if (!value) return null;
    if (mongoose.Types.ObjectId.isValid(value)) {
        const byId = await Category.findById(value);
        if (byId) return byId;
    }
    return Category.findOne({ name: { $regex: `^${value}$`, $options: 'i' } });
};

const listProducts = asyncHandler(async (req, res) => {
    const { search, category, topSelling, offer } = req.query;
    const filter = {};
    if (search) {
        filter.name = { $regex: search, $options: 'i' };
    }
    if (category) {
        const categoryDoc = await findCategory(category);
        if (categoryDoc) {
            filter.category = categoryDoc._id;
        }
    }
    if (topSelling !== undefined) {
        filter.topSelling = topSelling === 'true' || topSelling === '1';
    }
    if (offer !== undefined) {
        if (offer === 'true' || offer === '1') {
            filter.offer = { $ne: '' };
        } else {
            filter.offer = { $regex: offer, $options: 'i' };
        }
    }
    const products = await Product.find(filter).populate('category');
    return res.status(200).json(products);
});

const getProduct = asyncHandler(async (req, res) => {
    const product = await Product.findById(req.params.id).populate('category');
    if (!product) {
        return res.status(404).json({ message: 'Product not found' });
    }
    return res.status(200).json(product);
});

const createProduct = asyncHandler(async (req, res) => {
    const { name, price, stock, rating, topSelling, offer, description, category } = req.body;
    if (!name || price === undefined || !category) {
        return res.status(400).json({ message: 'Name, price and category are required' });
    }
    const categoryDoc = await findCategory(category);
    if (!categoryDoc) {
        return res.status(400).json({ message: 'Category not found' });
    }
    const payload = {
        name,
        price: Number(price),
        stock: stock !== undefined ? Number(stock) : 0,
        rating: rating !== undefined ? Number(rating) : 0,
        topSelling: topSelling === true || topSelling === 'true' || topSelling === '1',
        offer: offer || '',
        description: description || '',
        category: categoryDoc._id,
    };
    if (req.file) {
        payload.image = `/uploads/${req.file.filename}`;
    }
    const product = await Product.create(payload);
    return res.status(201).json(product);
});

const updateProduct = asyncHandler(async (req, res) => {
    const product = await Product.findById(req.params.id);
    if (!product) {
        return res.status(404).json({ message: 'Product not found' });
    }
    const updates = { ...req.body };
    if (updates.price !== undefined) updates.price = Number(updates.price);
    if (updates.stock !== undefined) updates.stock = Number(updates.stock);
    if (updates.rating !== undefined) updates.rating = Number(updates.rating);
    if (updates.topSelling !== undefined) {
        updates.topSelling = updates.topSelling === true || updates.topSelling === 'true' || updates.topSelling === '1';
    }
    if (updates.category) {
        const categoryDoc = await findCategory(updates.category);
        if (!categoryDoc) {
            return res.status(400).json({ message: 'Category not found' });
        }
        updates.category = categoryDoc._id;
    }
    if (req.file) {
        updates.image = `/uploads/${req.file.filename}`;
    }
    Object.assign(product, updates);
    await product.save();
    const refreshed = await Product.findById(product._id).populate('category');
    return res.status(200).json(refreshed);
});

const deleteProduct = asyncHandler(async (req, res) => {
    const product = await Product.findById(req.params.id);
    if (!product) {
        return res.status(404).json({ message: 'Product not found' });
    }
    await product.deleteOne();
    return res.status(200).json({ message: 'Product deleted' });
});

module.exports = {
    listProducts,
    getProduct,
    createProduct,
    updateProduct,
    deleteProduct,
};
