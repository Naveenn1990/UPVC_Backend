const express = require('express');
const router = express.Router();
const quoteController = require('../../controllers/Buyer/quoteController');
const { authenticate } = require('../../middlewares/authMiddleware');

// Quote CRUD operations
router.post('/', authenticate, quoteController.createQuote);
router.get('/buyer', authenticate, quoteController.getBuyerQuotes);
router.put('/:quoteId', quoteController.updateQuote);
router.delete('/:quoteId', quoteController.deleteQuote);

// Convert quotes to lead
router.post('/convert-to-lead', quoteController.convertToLead);

module.exports = router;