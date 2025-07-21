const jwt = require('jsonwebtoken');

exports.signOTPToken = (payload) => {
  return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '7d' });
};

exports.verifyOTPToken = (token) => {
  return jwt.verify(token, process.env.JWT_SECRET);
};
