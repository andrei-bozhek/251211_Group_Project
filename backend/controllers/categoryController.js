const asyncHandler = require('express-async-handler');
const Category = require('../models/categoryModel');
const Product = require('../models/productModel');

const listCategories = asyncHandler(async (_req, res) => {
    const categories = await Category.find().sort({ name: 1 });
    return res.status(200).json(categories);
});

const createCategory = asyncHandler(async (req, res) => {
    const { name } = req.body;
    if (!name) {
        return res.status(400).json({ message: 'Name is required' });
    }
    const exists = await Category.findOne({ name: { $regex: `^${name}$`, $options: 'i' } });
    if (exists) {
        return res.status(400).json({ message: 'Category already exists' });
    }
    const category = await Category.create({ name });
    return res.status(201).json(category);
});

const updateCategory = asyncHandler(async (req, res) => {
    const { name } = req.body;
    if (!name) {
        return res.status(400).json({ message: 'Name is required' });
    }
    const category = await Category.findById(req.params.id);
    if (!category) {
        return res.status(404).json({ message: 'Category not found' });
    }
    const duplicate = await Category.findOne({
        _id: { $ne: category._id },
        name: { $regex: `^${name}$`, $options: 'i' },
    });
    if (duplicate) {
        return res.status(400).json({ message: 'Category already exists' });
    }
    category.name = name;
    await category.save();
    return res.status(200).json(category);
});

const deleteCategory = asyncHandler(async (req, res) => {
    const category = await Category.findById(req.params.id);
    if (!category) {
        return res.status(404).json({ message: 'Category not found' });
    }
    const productUsingCategory = await Product.findOne({ category: category._id });
    if (productUsingCategory) {
        return res.status(400).json({ message: 'Cannot delete a category that is used by products' });
    }
    await category.deleteOne();
    return res.status(200).json({ message: 'Category deleted' });
});

module.exports = {
    listCategories,
    createCategory,
    updateCategory,
    deleteCategory,
};
