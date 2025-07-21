const WindowOption = require('../../models/Admin/WindowOption');
const WindowSubOptions = require('../../models/Admin/WindowSubOptions');

// Get all window options with pagination
exports.getAllOptions = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 5;
        const skip = (page - 1) * limit;

        const options = await WindowSubOptions.find()
            .populate('option')
            .skip(skip)
            .limit(limit)
            .sort({ createdAt: -1 });

        const total = await WindowSubOptions.countDocuments();

        res.json({
            options,
            totalPages: Math.ceil(total / limit),
            currentPage: page
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Create new window option
exports.createOption = async (req, res) => {
    try {
        const { option, title, features, videoUrl } = req.body;
        const parent = await WindowOption.findById(option);
        if (!parent) return res.status(404).json({ message: "Parent option not found" });

        const featuresList = features.split(",")
        const newOption = new WindowSubOptions({
            option,
            title,
            features : featuresList,
            videoUrl
        });

        await newOption.save();
        res.status(201).json(newOption);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// Update window option (partial update)
exports.updateOption = async (req, res) => {
    try {
        const { id } = req.params;
        const updates = req.body;
        updates.updatedAt = new Date();

        const option = await WindowSubOptions.findByIdAndUpdate(
            id,
            { $set: updates },
            { new: true, runValidators: true }
        );

        if (!option) {
            return res.status(404).json({ message: 'Option not found' });
        }

        res.json(option);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// Delete window option
exports.deleteOption = async (req, res) => {
    try {
        const { id } = req.params;
        const option = await WindowSubOptions.findByIdAndDelete(id);

        if (!option) {
            return res.status(404).json({ message: 'Option not found' });
        }

        res.json({ message: 'Option deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Get predefined window options
exports.getPredefinedOptions = async (req, res) => {
    const predefinedOptions = [
        "Sliding Window", "Sliding Door", "Casement Windows", "Casement Doors",
        "Fixed Windows", "Bathroom Ventilators", "Combination Windows", "Special Architectural Windows"
    ];
    res.json(predefinedOptions);
};