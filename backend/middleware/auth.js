const jwt = require('jsonwebtoken');
const User = require('../models/User');

const protect = async (req, res, next) => {
  try {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return res.status(401).json({ error: 'Access denied. No token provided.' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select('-password');

    if (!user) {
      return res.status(401).json({ error: 'User not found.' });
    }

    if (user.isBlocked) {
      return res.status(403).json({ error: 'Your account has been suspended. Please contact support.' });
    }

    // Update last active
    user.lastActive = Date.now();
    await user.save({ validateBeforeSave: false });

    req.user = user;
    next();
  } catch (err) {
    if (err.name === 'JsonWebTokenError') {
      return res.status(401).json({ error: 'Invalid token.' });
    }
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Token expired. Please log in again.' });
    }
    next(err);
  }
};

const adminOnly = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    return next();
  }
  return res.status(403).json({ error: 'Access denied. Admins only.' });
};

const checkCredits = async (req, res, next) => {
  const user = req.user;
  // If user has their own API key, bypass credit check
  if (user.useOwnApiKey && user.apiKey) {
    return next();
  }
  if (user.credits <= 0 && user.plan === 'free') {
    return res.status(402).json({
      error: 'You have exhausted your free credits. Please upgrade your plan.',
      credits: 0,
    });
  }
  next();
};

module.exports = { protect, adminOnly, checkCredits };
