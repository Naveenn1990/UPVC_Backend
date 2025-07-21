const express = require('express');
const windowOptionsController = require('../../controllers/Admin/windowSubOption');
const authenticateAdmin = require('./../../middlewares/adminAuth');

const router = express.Router();

router.get('/', windowOptionsController.getAllOptions);
router.use(authenticateAdmin);
// Admin protected routes
router.post('/', windowOptionsController.createOption);
router.patch('/:id', windowOptionsController.updateOption);
router.delete('/:id', windowOptionsController.deleteOption);
router.get('/predefined', windowOptionsController.getPredefinedOptions);

module.exports = router;
