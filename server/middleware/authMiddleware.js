const jwt = require('jsonwebtoken');
const User = require('../models/User');

const JWT_SECRET = process.env.JWT_SECRET || 'connectserve_super_secure_jwt_secret_2026';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';
const REFRESH_SECRET = process.env.REFRESH_SECRET || 'connectserve_refresh_secret_2026';
const REFRESH_EXPIRES_IN = process.env.REFRESH_EXPIRES_IN || '30d';

const generateTokens = (userId, role) => {
  const accessToken = jwt.sign({ id: userId, role }, JWT_SECRET, {
    expiresIn: JWT_EXPIRES_IN,
  });
  const refreshToken = jwt.sign({ id: userId, role }, REFRESH_SECRET, {
    expiresIn: REFRESH_EXPIRES_IN,
  });
  return { accessToken, refreshToken };
};

const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Access denied. No authentication token provided.',
    });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    let user = null;
    if (typeof decoded.id === 'number' || !isNaN(Number(decoded.id))) {
      user = await User.findByPk(decoded.id);
    }
    if (!user) {
      user = await User.findOne({ where: { mongoId: String(decoded.id) } });
    }

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'The user belonging to this token no longer exists.',
      });
    }

    if (user.isBanned) {
      return res.status(403).json({
        success: false,
        message: 'Your account has been suspended by an administrator.',
      });
    }

    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        message: 'Your account is deactivated.',
      });
    }

    // Attach user to req.user
    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Authentication token has expired. Please refresh or log in again.',
        isExpired: true,
      });
    }
    return res.status(401).json({
      success: false,
      message: 'Invalid authentication token.',
    });
  }
};

// Optional auth: populate req.user if token is present, but don't reject if not
const optionalAuth = async (req, res, next) => {
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return next();
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    let user = null;
    if (typeof decoded.id === 'number' || !isNaN(Number(decoded.id))) {
      user = await User.findByPk(decoded.id);
    }
    if (!user) {
      user = await User.findOne({ where: { mongoId: String(decoded.id) } });
    }
    if (user && !user.isBanned && user.isActive) {
      req.user = user;
    }
  } catch (err) {
    // Ignore invalid optional tokens
  }
  next();
};

module.exports = {
  protect,
  optionalAuth,
  generateTokens,
  JWT_SECRET,
  REFRESH_SECRET,
};
