const express = require('express');
const {
  createSubCategory,
  getAllSubCategories,
  updateSubCategory,
  deleteSubCategory
} = require('../../controllers/Admin/subCategoryController'); 
const authenticateAdmin = require('../../middlewares/adminAuth');
const limiter = require('../../middlewares/rateLimiter');
const router = express.Router();

router.use(authenticateAdmin);
router.get('/', limiter, getAllSubCategories);
router.post('/', createSubCategory);
router.patch('/:id', updateSubCategory);
router.delete('/:id', deleteSubCategory);

module.exports = router;
