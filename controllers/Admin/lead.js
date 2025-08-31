const Lead = require('../../models/Admin/lead');
const User = require('../../models/Buyer/User');
const Seller = require('../../models/Seller/Seller');
const WindowSubOption = require('../../models/Admin/WindowSubOptions');
const Category = require('../../models/Admin/Category');
const Quote = require('../../models/Buyer/Quote');

// Create a new lead
// exports.createLead = async (req, res) => {
//   try {
//     const { quotes, contactInfo, projectInfo, categoryId, totalSqft } = req.body;
//     // console.log("totalSqft : " , totalSqft)
//     // Validate buyer exists
//     const buyer = await User.findById({_id : req.user._id});
//     if (!buyer) {
//       return res.status(404).json({ success: false, message: 'Buyer not found' });
//     }

//     // Validate category exists
//     const category = await Category.findById(categoryId);
//     if (!category) {
//       return res.status(404).json({ success: false, message: 'Category not found' });
//     }

//     // Validate all products in quotes exist
//     for (const quote of quotes) {
//       const product = await WindowSubOption.findById(quote.product);
//       if (!product) {
//         return res.status(404).json({ 
//           success: false, 
//           message: `Product not found for ID: ${quote.product}` 
//         });
//       }
//     }
     
//     const lead = new Lead({
//       buyer: req.user._id,
//       quotes,
//       contactInfo,
//       projectInfo,
//       category: categoryId, 
//     });

//     await lead.save();
    

//     res.status(201).json({
//       success: true,
//       message: 'Lead created successfully',
//       lead
//     });
//   } catch (error) {
//     console.error('Error creating lead:', error);
//     res.status(500).json({
//       success: false,
//       message: 'Internal server error',
//       error: error.message
//     });
//   }
// };

exports.createLead = async (req, res) => {
  try {
    const { quotes, contactInfo, projectInfo, categoryId } = req.body;

    const buyer = await User.findById(req.user._id);
    if (!buyer) {
      return res.status(404).json({ success: false, message: 'Buyer not found' });
    }

    const category = await Category.findById(categoryId);
    if (!category) {
      return res.status(404).json({ success: false, message: 'Category not found' });
    }

    let totalSqft = 0;
    let totalQuantity = 0;

    const validatedQuotes = [];

    for (const quote of quotes) {
      console.log("quote : " , quote)
      const product = await WindowSubOption.findById(quote.product);
      if (!product) {
        return res.status(404).json({ 
          success: false, 
          message: `Product not found for ID: ${quote.product}` 
        });
      }

      const { height, width, quantity } = quote;

      if (!height || !width || !quantity) {
        return res.status(400).json({
          success: false,
          message: 'Each quote must include height, width, and quantity',
        });
      }

      const sqft = height * width;
      const quoteSqftTotal = sqft * quantity;

      totalSqft += quoteSqftTotal;
      totalQuantity += quantity;

      validatedQuotes.push({
        ...quote,
        sqft,
      });
    }

    const bulkOps = quotes.map(q => ({
      updateOne: {
        filter: { _id: q._id },
        update: { $set: { isGenerated: q.isGenerated } }
      }
    }));
    console.log("bulkOps : " , bulkOps)
    // Execute all updates at once
    await Quote.bulkWrite(bulkOps);

    const lead = new Lead({
      buyer: req.user._id,
      quotes: validatedQuotes,
      contactInfo,
      projectInfo,
      category: categoryId,
      totalSqft,
      totalQuantity,
      pricePerSqft: 10.5,
      // pricePerSqft: totalSqft > 0 ? 6250 / (totalSqft * 6) : 0,
    });

    await lead.save();

    res.status(201).json({
      success: true,
      message: 'Lead created successfully',
      lead
    });

  } catch (error) {
    console.error('Error creating lead:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Get all leads with filters
exports.getAllLeads = async (req, res) => {
  try {
    const { status, buyerId, sellerId, categoryId } = req.query;
    const filter = {};

    if (status) filter.status = status;
    if (buyerId) filter.buyer = buyerId;
    if (categoryId) filter.category = categoryId;
    if (sellerId) filter['seller.sellerId'] = sellerId;

    const leads = await Lead.find(filter)
      .populate('buyer')
      .populate('seller.sellerId')
      .populate('category')
      .populate('quotes.product')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: leads.length,
      leads
    });
  } catch (error) {
    console.error('Error fetching leads:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Get single lead by ID
exports.getLeadById = async (req, res) => {
  try {
    const lead = await Lead.findById(req.params.id)
      .populate('buyer')
      .populate('seller.sellerId')
      .populate('category')
      .populate('quotes.product');

    if (!lead) {
      return res.status(404).json({
        success: false,
        message: 'Lead not found'
      });
    }

    res.status(200).json({
      success: true,
      lead
    });
  } catch (error) {
    console.error('Error fetching lead:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Seller purchases a lead
// exports.purchaseLead = async (req, res) => {
//   try {
//     const { leadId } = req.body;
//     const sellerId = req.seller._id
//     // Validate lead exists
//     const lead = await Lead.findById(leadId);
//     if (!lead) {
//       return res.status(404).json({
//         success: false,
//         message: 'Lead not found'
//       });
//     }

//     // Validate seller exists
//     const seller = await Seller.findById(sellerId);
//     if (!seller) {
//       return res.status(404).json({
//         success: false,
//         message: 'Seller not found'
//       });
//     }

//     // Check if lead has available slots
//     if (lead.availableSlots <= 0) {
//       return res.status(400).json({
//         success: false,
//         message: 'No available slots left for this lead'
//       });
//     }

//         // Get all sellers in the same city as the project
//     const sellersInCity = await Seller.find({ 
//       city: lead.projectInfo.address.city, // Assuming city is in projectInfo.address
//       status: 'approved',
//       isActive: true
//     });

//     // Count brands in the city
//     const brandCounts = {};
//     sellersInCity.forEach(seller => {
//       if (seller.brandOfProfileUsed) {
//         brandCounts[seller.brandOfProfileUsed] = 
//           (brandCounts[seller.brandOfProfileUsed] || 0) + 1;
//       }
//     });

//     // Check if any brand has reached the limit (2 sellers)
//     const brandsAtLimit = Object.entries(brandCounts)
//       .filter(([_, count]) => count >= 2)
//       .map(([brand]) => brand);

//     if (brandsAtLimit.length > 0) {
//       return res.status(400).json({
//         success: false,
//         message: `Oops you have missed the bus by a whisker. Your brand in your city is already registered by 2 other fabricators.`,
//         brandsAtLimit
//       });
//     }

//     // Check if seller already purchased this lead
//     const alreadyPurchased = lead.seller.some(s => s.sellerId.toString() === sellerId);
//     if (alreadyPurchased) {
//       return res.status(400).json({
//         success: false,
//         message: 'Seller already purchased this lead'
//       });
//     }

//     // Add seller to lead and decrease available slots
//     lead.seller.push({ sellerId });
//     lead.availableSlots -= 1;
    
//     // Update status if all slots are taken
//     if (lead.availableSlots === 0) {
//       lead.status = 'in-progress';
//     }

//     await lead.save();

//     res.status(200).json({
//       success: true,
//       message: 'Lead purchased successfully',
//       lead
//     });
//   } catch (error) {
//     console.error('Error purchasing lead:', error);
//     res.status(500).json({
//       success: false,
//       message: 'Internal server error',
//       error: error.message
//     });
//   }
// };

exports.purchaseLead = async (req, res) => {
  try {
    const { leadId, slotsToBuy, useFreeQuota, freeSqftToUse } = req.body;
    const sellerId = req.seller._id

    if (!leadId || !sellerId || !slotsToBuy || slotsToBuy <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Invalid request. Missing or invalid parameters.'
      });
    }

    const lead = await Lead.findById(leadId);
    if (!lead) {
      return res.status(404).json({
        success: false,
        message: 'Lead not found'
      });
    }

    const seller = await Seller.findById(sellerId);
    if (!seller) {
      return res.status(404).json({
        success: false,
        message: 'Seller not found'
      });
    }
    console.log("Seller : " , seller)

    // Check if total sqft is <= 50 and seller already purchased this lead
    if (lead.totalSqft <= 50) {
      console.log("Yes less than 50")
      const alreadyPurchased = lead.seller.some(s => s.sellerId.toString() === sellerId.toString());
      console.log("alreadyPurchased : " , alreadyPurchased )
      if (alreadyPurchased) {
        return res.status(400).json({
          success: false,
          // message: 'You have already purchased this small lead (≤ 50 sqft). Duplicate purchase is not allowed.'
          message: 'You can only purchase this lead once'
          // have already purchased this small lead (≤ 50 sqft). Duplicate purchase is not allowed.'
        });
      }
    }

     // Verify the seller has enough remaining quota if using free quota
    // if (useFreeQuota) {
    //   // const seller = await Seller.findById(req.sellerId);
    //   if (seller.freeQuota.currentMonthQuota < freeSqftToUse) {
    //     return res.status(400).json({ 
    //       success: false,
    //       message: 'Not enough free quota remaining'
    //     });
    //   }
      
    //   // Deduct the freeSqftToUse from the seller's quota
    //   seller.freeQuota.currentMonthQuota -= freeSqftToUse;
    //   await seller.save();
    // }

    // Check quota reset
    const now = new Date();
    if (now >= seller.freeQuota.nextResetDate) {
      seller.freeQuota.currentMonthQuota = 500;
      seller.freeQuota.usedQuota = 0;
      seller.freeQuota.nextResetDate = new Date(now);
      seller.freeQuota.nextResetDate.setMonth(now.getMonth() + 1);
      await seller.save();
    }

    // Calculate pricing
    const pricePerSqft = lead.basePricePerSqft; // 10.5
    const leadSqft = lead.totalSqft;
    const totalSqft = leadSqft * slotsToBuy;
    let freeSqftUsed = 0;
    let paidSqft = totalSqft;
    let actualPrice = paidSqft * pricePerSqft;

    if (useFreeQuota && seller.freeQuota.currentMonthQuota > 0) {
      // Check if already used quota for this lead
      const alreadyUsed = seller.quotaUsage.some(u => u.leadId.equals(leadId));
      
      if (!alreadyUsed) {
        // Calculate maximum free sqft (max 100 per transaction)
        // freeSqftUsed = Math.min(100, seller.freeQuota.currentMonthQuota, leadSqft);
        
        paidSqft = totalSqft - freeSqftToUse;
        actualPrice = paidSqft * pricePerSqft;
        console.log("Deatils : " ,freeSqftToUse , paidSqft , actualPrice)
        // return
        // Update seller's quota
        seller.freeQuota.currentMonthQuota -= freeSqftToUse;
        seller.freeQuota.usedQuota += freeSqftToUse;
        
        // Record quota usage
        seller.quotaUsage.push({
          leadId,
          sqftUsed: freeSqftToUse,
          date: now
        });
      }
    }

    const sellersInCity = await Seller.find({ 
      city: lead.projectInfo.address.city,
      status: 'approved',
      isActive: true
    });

    const brandCounts = {};
    sellersInCity.forEach(seller => {
      if (seller.brandOfProfileUsed) {
        brandCounts[seller.brandOfProfileUsed] = 
          (brandCounts[seller.brandOfProfileUsed] || 0) + 1;
      }
    });

    const brandsAtLimit = Object.entries(brandCounts)
      .filter(([_, count]) => count >= 2)
      .map(([brand]) => brand);

    if (brandsAtLimit.includes(seller.brandOfProfileUsed)) {
      return res.status(400).json({
        success: false,
        message: `Oops you have missed the bus by a whisker. Your brand in your city is already registered by 2 other fabricators.`,
        brandsAtLimit
      });
    }
 
    const pricePerSlot = actualPrice / slotsToBuy;
    const freePerSlot = freeSqftToUse / slotsToBuy;

    // slotsToBuy=6


    // Push seller multiple times based on slotsToBuy
    for (let i = 0; i < slotsToBuy; i++) {
      lead.seller.push({ 
        sellerId,
        purchasedAt: now,
        pricePaid: pricePerSlot,
        freeQuotaUsed: freePerSlot // Distributed evenly but from single 100 limit
      });
    }

    lead.availableSlots -= slotsToBuy; 

    if (lead.availableSlots === 0) {
      lead.status = 'in-progress';
    }

    // Avoid duplicate entries in seller.leads
    if (!seller.leads.includes(leadId)) {
      seller.leads.push(leadId);
    }

    await Promise.all([lead.save(), seller.save()]);
    
    res.status(200).json({
      success: true,
      message: 'Lead purchased successfully',
      lead,
      actualPricePaid: actualPrice,
      freeSqftUsed: freeSqftToUse,
      paidSqft: paidSqft,
      pricePerSqft: pricePerSqft,
      // monthlyQuotaRemaining: seller.freeQuota.currentMonthQuota
    });

  } catch (error) {
    console.error('Error purchasing lead:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Update lead status
exports.updateLeadStatus = async (req, res) => {
  try {
    const { leadId, status } = req.body;

    const lead = await Lead.findByIdAndUpdate(
      leadId,
      { status },
      { new: true }
    );

    if (!lead) {
      return res.status(404).json({
        success: false,
        message: 'Lead not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Lead status updated successfully',
      lead
    });
  } catch (error) {
    console.error('Error updating lead status:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Calculate price for a lead (utility endpoint)
exports.calculateLeadPrice = async (req, res) => {
  try {
    const { quotes } = req.body;

    if (!quotes || !Array.isArray(quotes)) {
      return res.status(400).json({
        success: false,
        message: 'Quotes array is required'
      });
    }

    // Calculate total square feet
    const totalSqft = quotes.reduce((total, quote) => {
      const sqft = (quote.height * quote.width * quote.quantity) / 144;
      return total + sqft;
    }, 0);

    // Calculate price per square foot
    const pricePerSqft = 6250 / (totalSqft * 6);

    res.status(200).json({
      success: true,
      totalSqft,
      pricePerSqft
    });
  } catch (error) {
    console.error('Error calculating lead price:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

exports.getSellerQuota = async (req, res) => {
  try {
    const seller = await Seller.findById(req.seller._id).select('freeQuota');
    
    if (!seller) {
      return res.status(404).json({
        success: false,
        message: 'Seller not found'
      });
    }
    seller.checkQuotaReset();
    if (seller.isModified()) await seller.save();

    res.json({
      success: true,
      remainingQuota: seller.freeQuota?.currentMonthQuota,
      nextReset: seller.freeQuota?.nextResetDate
    });
  } catch (error) {
    console.error('Error fetching seller quota:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Internal server error',
      error: error.message 
    });
  }
};