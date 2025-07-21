const mongoose = require('mongoose');

const quoteSchema = new mongoose.Schema({
  buyer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  productType: {
    type: String,
    // enum: ['sliding-door', 'sliding-window', 'other'],
    required: true
  },
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'WindowSubOption',
    required: true
  },
  color: {
    type: String,
    required: true
  },
  installationLocation: {
    type: String,
    required: true
  },
  height: {
    type: Number,
    required: true,
    min: 1
  },
  width: {
    type: Number,
    required: true,
    min: 1
  },
  quantity: {
    type: Number,
    required: true,
    min: 1
  },
  remark: {
    type: String
  },
  sqft: {
    type: Number,
    default: function() {
      return (this.height * this.width * this.quantity); // Total sqft for this quote item
    }
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Calculate sqft before save
quoteSchema.pre('save', function(next) {
  this.sqft = (this.height * this.width * this.quantity)
  this.updatedAt = Date.now();
  next();
});

const Quote = mongoose.model('Quote', quoteSchema);

module.exports = Quote;