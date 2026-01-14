const express = require('express');
const multer = require('multer');
const path = require('path');
const router = express.Router();
const {
    listProducts,
    getProduct,
    createProduct,
    updateProduct,
    deleteProduct,
} = require('../controllers/productController');
const { protect, requireAdmin } = require('../middleware/authMiddleware');

const storage = multer.diskStorage({
    destination: (_req, _file, cb) => {
        cb(null, path.join(__dirname, '..', 'uploads'));
    },
    filename: (_req, file, cb) => {
        const safeName = file.originalname.replace(/\s+/g, '');
        cb(null, `${Date.now()}-${safeName}`);
    },
});

const upload = multer({ storage });

router.get('/', listProducts);
router.get('/:id', getProduct);
router.post('/', protect, requireAdmin, upload.single('image'), createProduct);
router.put('/:id', protect, requireAdmin, upload.single('image'), updateProduct);
router.delete('/:id', protect, requireAdmin, deleteProduct);

module.exports = router;
