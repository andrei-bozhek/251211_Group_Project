const express = require('express');
const router = express.Router();
const { listUsers, deleteUser, updateUserRole, toggleUserBlock } = require('../controllers/adminController');
const { protect, requireAdmin } = require('../middleware/authMiddleware');

router.get('/users', protect, requireAdmin, listUsers);
router.delete('/users/:id', protect, requireAdmin, deleteUser);
router.patch('/users/:id/role', protect, requireAdmin, updateUserRole);
router.patch('/users/:id/block', protect, requireAdmin, toggleUserBlock);

module.exports = router;
