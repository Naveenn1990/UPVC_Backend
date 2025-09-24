const Lead = require('../../models/Admin/lead');
const User = require('../../models/Buyer/User');
const generateOTP = require('../../utils/generateOTP');
const { signOTPToken } = require('../../utils/jwtHelper');

exports.login = async (req, res) => {
  const { name, mobileNumber } = req.body;
  if (!name || !mobileNumber || mobileNumber.length !== 10) {
    return res.status(400).json({ message: 'Invalid input' });
  }

  const otp = generateOTP();
  const otpExpires = new Date(Date.now() + 5 * 60 * 1000); // expires in 5 min

  const user = await User.findOneAndUpdate(
    { mobileNumber },
    { name, otp, otpExpires },
    { new: true, upsert: true }
  );

  console.log("Otp.............",otp)
 
  return res.status(200).json({
    message: 'OTP sent',
    otp,
  });
};
  
exports.verifyOTP = async (req, res) => {
  const { mobileNumber, otp } = req.body;
  const user = await User.findOne({ mobileNumber });
  
  if (!user || user.otp !== otp || user.otpExpires < Date.now()) {
    return res.status(401).json({ message: 'Invalid or expired OTP' });
  }
  
  // Clear OTP
  user.otp = undefined;
  user.otpExpires = undefined;
  await user.save();
  
  // Include user._id in the token payload
  const token = signOTPToken({ 
    mobileNumber, 
    userId: user._id,  // Add this line
    name: user.name    // Optional: include name if needed
  });
  return res.status(200).json({ 
    message: 'OTP verified. Login successful', 
    token,
    user: {
      name: user.name,
      mobileNumber: user.mobileNumber,
      id: user._id,
    } 
  });
};

exports.buyerInfo = async (req , res) => { 
  try{
    const user = await User.findOne({_id : req.user._id})
    if (!user){
      return res.status(404).json({ message: 'User not found' });
    }
    return res.status(200).json({
      message: 'User data fetched successful',
      user
    });
  } catch(err){
    console.error("Error fetching Buyer : " , err)
  }
}

exports.updateUser = async (req, res) => {
  try {
    const id = req.user._id;
    const updates = req.body;

    if (updates.mobileNumber) {
      const existingUser = await User.findOne({ mobileNumber: updates.mobileNumber });
      if (existingUser && existingUser._id.toString() !== id.toString()) {
        return res.status(400).json({ error: 'Mobile number already in use' });
      }
    }

    const user = await User.findByIdAndUpdate(
      id,
      updates,
      { new: true, runValidators: true }
    );

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.status(200).json(user);
  } catch (error) {
    res.status(400).json({ 
      error: error.message,
      details: error.errors || null
    });
  }
};

exports.getBuyerLeads = async (req, res) => {
  try {
    const buyerId = req.user._id;
    console.log("Confirmed")
    const leads = await Lead.find({ buyer: buyerId })
      .populate({
        path: 'category',
        select: 'name description videoUrl'
      })
      .populate({
        path: 'seller.sellerId',
        select: 'companyName brandOfProfileUsed contactPerson phoneNumber businessProfileVideo visitingCard yearsInBusiness'
      })
      .populate({
        path: 'quotes.product',
        select: 'title features videoUrl'
      })
      .sort({ createdAt: -1 });

    // Format the response to match frontend structure
    const formattedLeads = leads.map(lead => {
      const sellers = lead.seller.map(seller => {
        const sellerData = seller.sellerId || {};
        return {
          id: seller._id,
          brandName: sellerData.brandOfProfileUsed || 'Unknown Brand',
          video: 
          // sellerData.businessProfileVideo ? 
          // `http://10.7.10.49:9000${sellerData.businessProfileVideo}`,
          `https://upvc-backend-oh6m.onrender.com${sellerData.businessProfileVideo}`,
          name: sellerData.contactPerson || 'Unknown',
          contactNo: sellerData.phoneNumber || 'N/A',
          whatsapp: sellerData.phoneNumber || 'N/A',
          address: sellerData.address || 'Address not available',
          yearsInBusiness: sellerData.yearsInBusiness?.toString() || 'N/A',
          manuCap: '5000 units/month', // Default value
          teamSize: '100', // Default value
          visitingCard: 
          // sellerData.visitingCard ? 
          // `http://localhost:9000/${sellerData.visitingCard}`, 
          `https://upvc-backend-oh6m.onrender.com/${sellerData.visitingCard}`, 
          quotes: lead.quotes.map(quote => ({
            productType: quote.productType,
            productTitle: quote.product?.title || 'Unknown Product',
            color: quote.color,
            size: `${quote.height}ft x ${quote.width}ft`,
            quantity: quote.quantity,
            features: quote.product?.features || []
          }))
        };
      });

      return {
        id: lead._id,
        date: new Date(lead.createdAt).toLocaleDateString(),
        projectAddress: lead.projectInfo.address,
        projectName: lead.projectInfo.name,
        projectStage: lead.projectInfo.stage,
        projectTimeline: lead.projectInfo.timeline,
        category: lead.category?.name || 'Standard',
        quotes: lead.quotes.map(quote => ({
            productType: quote.productType,
            productTitle: quote.product?.title || 'Unknown Product',
            color: quote.color,
            size: `${quote.height}ft x ${quote.width}ft`,
            quantity: quote.quantity,
            features: quote.product?.features || []
          })),
        categoryVideo: lead.category?.videoUrl 
          ? `http://192.168.1.40:9000/${lead.category.videoUrl}`
          : null,
        sellers,
        contactInfo: {
          name: lead.contactInfo.name,
          phone: lead.contactInfo.contactNumber,
          whatsapp: lead.contactInfo.whatsappNumber,
          email: lead.contactInfo.email
        }
      };
    });

    res.status(200).json({ 
      success: true, 
      count: formattedLeads.length,
      leads: formattedLeads 
    });
  } catch (error) {
    console.error('Error fetching buyer leads:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch leads',
      error: error.message 
    });
  }
};