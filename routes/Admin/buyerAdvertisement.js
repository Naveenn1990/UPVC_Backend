const express = require('express');
const router = express.Router();
const advertisementController = require('../../controllers/Admin/buyerAdvertisementController');
const upload = require('../../middlewares/upload');

// Get all advertisements
router.get('/', advertisementController.getAllAdvertisements);

// Get advertisements by type (featured/latest/trending)
router.get('/:type', advertisementController.getAdvertisementsByType);

// Create new advertisement
router.post(
  '/',
  upload('advertisements').fields([
    { name: 'media', maxCount: 1 },
    { name: 'thumbnail', maxCount: 1 }
  ]),
  advertisementController.createAdvertisement
);

// Update advertisement
router.put(
  '/:id',
  upload('advertisements').fields([
    { name: 'media', maxCount: 1 },
    { name: 'thumbnail', maxCount: 1 }
  ]),
  advertisementController.updateAdvertisement
);

// Delete advertisement
router.delete('/:id', advertisementController.deleteAdvertisement);

// Toggle like on advertisement
router.post('/:id/like', advertisementController.toggleLike);

module.exports = router;