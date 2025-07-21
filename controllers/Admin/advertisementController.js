const Advertisement = require('../../models/Admin/buyerAdvertisement');
const fs = require('fs');
const path = require('path');

// Get all advertisements
exports.getAllAdvertisements = async (req, res) => {
  try {
    const ads = await Advertisement.find().sort({ createdAt: -1 });
    res.status(200).json({ success: true, ads });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get advertisements by type
exports.getAdvertisementsByType = async (req, res) => {
  try {
    const { type } = req.params;
    let query = {};
    
    if (type === 'featured') {
      query.isFeatured = true;
    } else if (type === 'trending') {
      query.likes = { $gte: 100 }; // Example threshold for trending
    }
    
    const ads = await Advertisement.find(query).sort({ createdAt: -1 });
    res.status(200).json({ success: true, ads });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Create new advertisement
exports.createAdvertisement = async (req, res) => {
  try {
    const { title, description, type } = req.body;
    const files = req.files;

    const mediaPath = files['media'] ? path.join('advertisements', files['media'][0].filename) : null;
    const thumbnailPath = files['thumbnail'] ? path.join('advertisements', files['thumbnail'][0].filename) : null;

    const newAd = new Advertisement({
      title,
      description,
      type: type || 'image',
      mediaUrl: mediaPath,
      thumbnailUrl: thumbnailPath,
      likes: 0,
      isFeatured: req.body.isFeatured === 'true'
    });

    await newAd.save();
    res.status(201).json({ success: true, advertisement: newAd });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Update advertisement
exports.updateAdvertisement = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, isFeatured } = req.body;
    const files = req.files;

    const ad = await Advertisement.findById(id);
    if (!ad) {
      return res.status(404).json({ success: false, message: 'Advertisement not found' });
    }

    // Delete old files if new ones are uploaded
    if (files['media']) {
      if (ad.mediaUrl) {
        fs.unlinkSync(path.join('uploads', ad.mediaUrl));
      }
      ad.mediaUrl = path.join('advertisements', files['media'][0].filename);
    }

    if (files['thumbnail']) {
      if (ad.thumbnailUrl) {
        fs.unlinkSync(path.join('uploads', ad.thumbnailUrl));
      }
      ad.thumbnailUrl = path.join('advertisements', files['thumbnail'][0].filename);
    }

    ad.title = title || ad.title;
    ad.description = description || ad.description;
    ad.isFeatured = isFeatured ? isFeatured === 'true' : ad.isFeatured;

    await ad.save();
    res.status(200).json({ success: true, advertisement: ad });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Delete advertisement
exports.deleteAdvertisement = async (req, res) => {
  try {
    const { id } = req.params;
    const ad = await Advertisement.findByIdAndDelete(id);

    if (!ad) {
      return res.status(404).json({ success: false, message: 'Advertisement not found' });
    }

    // Delete associated files
    if (ad.mediaUrl) {
      fs.unlinkSync(path.join('uploads', ad.mediaUrl));
    }
    if (ad.thumbnailUrl) {
      fs.unlinkSync(path.join('uploads', ad.thumbnailUrl));
    }

    res.status(200).json({ success: true, message: 'Advertisement deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Toggle like on advertisement
exports.toggleLike = async (req, res) => {
  try {
    const { id } = req.params;
    const { userId } = req.body;

    const ad = await Advertisement.findById(id);
    if (!ad) {
      return res.status(404).json({ success: false, message: 'Advertisement not found' });
    }

    const likeIndex = ad.likedBy.indexOf(userId);
    if (likeIndex === -1) {
      ad.likedBy.push(userId);
      ad.likes += 1;
    } else {
      ad.likedBy.splice(likeIndex, 1);
      ad.likes -= 1;
    }

    await ad.save();
    res.status(200).json({ success: true, likes: ad.likes, isLiked: likeIndex === -1 });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};