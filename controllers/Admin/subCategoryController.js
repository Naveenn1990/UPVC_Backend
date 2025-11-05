const SubCategory = require("../../models/Admin/SubCategory");

exports.createSubCategory = async (req, res) => {
  try {
    const { name, parentCategory, videoUrl, features, benefits, description } = req.body || {};

    if (!name || !parentCategory) {
      return res.status(400).json({ message: 'name and parentCategory are required' });
    }
    const file = req.file; // optional

    const finalVideoUrl = file
      ? `/uploads/sellers/videos/${file.filename}`
      : videoUrl;

    const sub = await SubCategory.create({
      name,
      parentCategory,
      videoUrl: finalVideoUrl,
      features,
      benefits,
      description,
    });
    res.status(201).json(sub);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getAllSubCategories = async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 5;
  const skip = (page - 1) * limit;
  const subs = await SubCategory.find()
    .populate("parentCategory")
    .skip(skip)
    .limit(limit)
    .sort({ createdAt: -1 });
  res.json(subs);
};

exports.updateSubCategory = async (req, res) => {
  try {
    const updates = { ...(req.body || {}) };
    if (req.file) {
      updates.videoUrl = `/uploads/sellers/videos/${req.file.filename}`;
    }
    const updated = await SubCategory.findByIdAndUpdate(
      req.params.id,
      { $set: updates },
      { new: true }
    );
    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.deleteSubCategory = async (req, res) => {
  await SubCategory.findByIdAndDelete(req.params.id);
  res.json({ message: "Deleted" });
};
