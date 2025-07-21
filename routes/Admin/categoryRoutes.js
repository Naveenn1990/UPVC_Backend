const express = require('express');
const {
  createCategory,
  getAllCategories,
  updateCategory,
  deleteCategory
} = require('../../controllers/Admin/categoryController');
const limiter = require('../../middlewares/rateLimiter');
const authenticateAdmin = require('../../middlewares/adminAuth');
const upload = require('../../middlewares/upload');

const router = express.Router();
router.get('/', limiter, getAllCategories);
router.use(authenticateAdmin);

router.post('/', upload.video('video'), createCategory);
router.patch('/:id', updateCategory);
router.delete('/:id', deleteCategory);

module.exports = router;
