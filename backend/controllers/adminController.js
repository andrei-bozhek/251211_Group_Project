const asyncHandler = require('express-async-handler');
const User = require('../models/userModel');

const listUsers = asyncHandler(async (_req, res) => {
    const users = await User.find().select('_id name email role isBlocked createdAt');
    return res.status(200).json(users);
});

const deleteUser = asyncHandler(async (req, res) => {
    if (req.params.id === req.user.id.toString()) {
        return res.status(400).json({ message: 'You cannot delete your own account' });
    }
    const user = await User.findById(req.params.id);
    if (!user) {
        return res.status(404).json({ message: 'User not found' });
    }
    await user.deleteOne();
    return res.status(200).json({ message: 'User deleted' });
});

const updateUserRole = asyncHandler(async (req, res) => {
    const { role } = req.body;
    if (!role || !['customer', 'admin'].includes(role)) {
        return res.status(400).json({ message: 'Invalid role' });
    }
    if (req.params.id === req.user.id.toString() && role !== 'admin') {
        return res.status(400).json({ message: 'You cannot change your own role' });
    }
    const user = await User.findById(req.params.id);
    if (!user) {
        return res.status(404).json({ message: 'User not found' });
    }
    user.role = role;
    await user.save();
    return res.status(200).json({
        message: 'Role updated',
        user: { id: user._id, name: user.name, email: user.email, role: user.role },
    });
});

const toggleUserBlock = asyncHandler(async (req, res) => {
    if (req.params.id === req.user.id.toString()) {
        return res.status(400).json({ message: 'You cannot block your own account' });
    }
    const user = await User.findById(req.params.id);
    if (!user) {
        return res.status(404).json({ message: 'User not found' });
    }
    user.isBlocked = !user.isBlocked;
    await user.save();
    return res.status(200).json({
        message: user.isBlocked ? 'User blocked' : 'User unblocked',
        user: { id: user._id, name: user.name, email: user.email, role: user.role, isBlocked: user.isBlocked },
    });
});

module.exports = {
    listUsers,
    deleteUser,
    updateUserRole,
    toggleUserBlock,
};
