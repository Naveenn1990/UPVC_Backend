const express = require('express');
const router = express.Router();
const adminController = require('../../controllers/Seller/sellerController');

// Seller management routes
router.get('/sellers', adminController.getAllSellers);
router.put('/sellers/:sellerId/approve', adminController.approveSeller);
router.put('/sellers/:sellerId/reject', adminController.rejectSeller);
router.put('/sellers/:sellerId/toggle-status', adminController.toggleSellerStatus);

module.exports = router;