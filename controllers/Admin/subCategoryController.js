const SubCategory = require("../../models/Admin/SubCategory");

exports.createSubCategory = async (req, res) => {
  const { name, parentCategory, videoUrl, features, benefits } = req.body;
  const sub = await SubCategory.create({
    name,
    parentCategory,
    videoUrl,
    features,
    benefits,
  });
  res.status(201).json(sub);
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
  const updated = await SubCategory.findByIdAndUpdate(
    req.params.id,
    { $set: req.body },
    { new: true }
  );
  res.json(updated);
};

exports.deleteSubCategory = async (req, res) => {
  await SubCategory.findByIdAndDelete(req.params.id);
  res.json({ message: "Deleted" });
};
