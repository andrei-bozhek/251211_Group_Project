const asyncHandler = require('express-async-handler');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/userModel');

const generateToken = (id) => jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '5d' });

const register = asyncHandler(async (req, res) => {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
        return res.status(400).json({ message: 'Name, email and password are required' });
    }
    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) {
        return res.status(400).json({ message: 'Email is already registered' });
    }
    const userCount = await User.countDocuments();
    const hashedPassword = await bcrypt.hash(password, 10);
    const role = (process.env.ADMIN_EMAIL && email === process.env.ADMIN_EMAIL) || userCount === 0 ? 'admin' : 'customer';
    const user = await User.create({ name, email, password: hashedPassword, role });
    const token = generateToken(user._id);
    return res.status(201).json({
        message: 'Registration successful',
        user: { id: user._id, name: user.name, role: user.role },
        token,
    });
});

const login = asyncHandler(async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
        return res.status(400).json({ message: 'Email and password are required' });
    }
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
        return res.status(400).json({ message: 'Invalid credentials' });
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
        return res.status(400).json({ message: 'Invalid credentials' });
    }
    if (user.isBlocked) {
        return res.status(403).json({ message: 'Account is blocked. Login is not allowed.' });
    }
    const token = generateToken(user._id);
    return res.status(200).json({
        message: 'Login successful',
        user: { id: user._id, name: user.name, role: user.role },
        token,
    });
});

const getProfile = asyncHandler(async (req, res) => {
    const current = await User.findById(req.user.id).select('_id name email role');
    if (!current) {
        return res.status(404).json({ message: 'User not found' });
    }
    return res.status(200).json({
        id: current._id,
        name: current.name,
        email: current.email,
        role: current.role,
    });
});

module.exports = {
    register,
    login,
    getProfile,
};
