const jwt = require('jsonwebtoken');
const User = require('../models/User.model');

// بررسی توکن و احراز هویت
const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({ message: 'لطفاً وارد حساب کاربری خود شوید' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(decoded.id).select('-password');
    
    if (!req.user) {
      return res.status(401).json({ message: 'کاربر یافت نشد' });
    }
    
    next();
  } catch (error) {
    return res.status(401).json({ message: 'توکن نامعتبر است' });
  }
};

// محدودیت دسترسی بر اساس نقش
const restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ 
        message: 'شما دسترسی به این بخش را ندارید' 
      });
    }
    next();
  };
};

// محدودیت مسئول فروش به منطقه خودش
const restrictToOwnProvince = (req, res, next) => {
  if (req.user.role === 'sales_manager') {
    req.allowedProvince = req.user.assignedProvince;
  }
  next();
};

module.exports = { protect, restrictTo, restrictToOwnProvince };