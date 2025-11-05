const express = require('express');
const {
  createSubCategory,
  getAllSubCategories,
  updateSubCategory,
  deleteSubCategory
} = require('../../controllers/Admin/subCategoryController'); 
const upload = require('../../middlewares/upload');
const authenticateAdmin = require('../../middlewares/adminAuth');
const limiter = require('../../middlewares/rateLimiter');
const router = express.Router();

router.use(authenticateAdmin);
router.get('/', limiter, getAllSubCategories);
// Accept optional video file upload for create/update
router.post('/', upload.video('video'), createSubCategory);
router.patch('/:id', upload.video('video'), updateSubCategory);
router.delete('/:id', deleteSubCategory);

module.exports = router;
