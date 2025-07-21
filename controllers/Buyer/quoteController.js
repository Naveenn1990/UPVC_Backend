const Quote = require('../../models/Buyer/Quote');
const WindowSubOption = require('../../models/Admin/WindowSubOptions');
const User = require('../../models/Buyer/User');
const jwt = require('jsonwebtoken');
const Lead = require('../../models/Admin/lead');

// Create a new quote item 
exports.createQuote = async (req, res) => {
  try {
    const { productType, product, color, installationLocation, height, width, quantity, remark } = req.body;

    // Validate product exists
    const productExists = await WindowSubOption.findById(product);
    if (!productExists) {
      return res.status(404).json({ 
        success: false, 
        message: 'Product not found' 
      });
    }

    const quote = new Quote({
      buyer: req.user._id,
      productType,
      product,
      color,
      installationLocation,
      height,
      width,
      quantity,
      remark
    });

    await quote.save();

    res.status(201).json({
      success: true,
      message: 'Quote item added successfully',
      quote
    });
  } catch (error) {
    console.error('Error creating quote:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Get all quotes for a buyer
exports.getBuyerQuotes = async (req, res) => {
  try { 
    const quotes = await Quote.find({ buyer: req.user._id })
      .populate('product')
      .sort({ createdAt: -1 });

    // Calculate totals
    const totalSqft = quotes.reduce((sum, quote) => sum + quote.sqft, 0);
    const totalQuantity = quotes.reduce((sum, quote) => sum + quote.quantity, 0);
    const pricePerSqft = 6250 / (totalSqft * 6);

    res.status(200).json({
      success: true,
      count: quotes.length,
      totalSqft,
      totalQuantity,
      pricePerSqft,
      quotes
    });
  } catch (error) {
    console.error('Error fetching quotes:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Update a quote item
exports.updateQuote = async (req, res) => {
  try {
    const { quoteId } = req.params;
    const updateData = req.body;

    // If product is being updated, validate it exists
    if (updateData.product) {
      const productExists = await WindowSubOption.findById(updateData.product);
      if (!productExists) {
        return res.status(404).json({ success: false, message: 'Product not found' });
      }
    }

    const quote = await Quote.findByIdAndUpdate(
      quoteId,
      updateData,
      { new: true, runValidators: true }
    ).populate('product');

    if (!quote) {
      return res.status(404).json({ success: false, message: 'Quote not found' });
    }

    res.status(200).json({
      success: true,
      message: 'Quote updated successfully',
      quote
    });
  } catch (error) {
    console.error('Error updating quote:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Delete a quote item
exports.deleteQuote = async (req, res) => {
  try {
    const { quoteId } = req.params;

    const quote = await Quote.findByIdAndDelete(quoteId);

    if (!quote) {
      return res.status(404).json({ success: false, message: 'Quote not found' });
    }

    res.status(200).json({
      success: true,
      message: 'Quote deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting quote:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Convert quotes to lead
exports.convertToLead = async (req, res) => {
  try {
    const { buyerId, contactInfo, projectInfo, categoryId } = req.body;

    // Get all quotes for this buyer
    const quotes = await Quote.find({ buyer: buyerId });
    if (quotes.length === 0) {
      return res.status(400).json({ 
        success: false, 
        message: 'No quotes found to convert to lead' 
      });
    }

    // Prepare quotes for lead
    const leadQuotes = quotes.map(quote => ({
      productType: quote.productType,
      product: quote.product,
      color: quote.color,
      installationLocation: quote.installationLocation,
      height: quote.height,
      width: quote.width,
      quantity: quote.quantity,
      remark: quote.remark,
      sqft: quote.sqft
    }));

    // Calculate totals
    const totalSqft = leadQuotes.reduce((sum, quote) => sum + quote.sqft, 0);
    const totalQuantity = leadQuotes.reduce((sum, quote) => sum + quote.quantity, 0);
    const pricePerSqft = 6250 / (totalSqft * 6);

    // Create lead (you'll need to import your Lead model)
    const lead = new Lead({
      buyer: buyerId,
      quotes: leadQuotes,
      contactInfo,
      projectInfo,
      category: categoryId,
      totalSqft,
      totalQuantity,
      pricePerSqft
    });

    await lead.save();

    // Optionally delete the quotes after creating lead
    await Quote.deleteMany({ buyer: buyerId });

    res.status(201).json({
      success: true,
      message: 'Lead created successfully from quotes',
      lead
    });
  } catch (error) {
    console.error('Error converting quotes to lead:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};