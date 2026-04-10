const User = require('../models/User.model');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

// تولید توکن JWT
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '30d',
  });
};

// @desc    ثبت نام کاربر جدید
// @route   POST /api/auth/register
// @access  Public
const register = async (req, res) => {
  try {
    const { name, email, phone, password, role, province } = req.body;

    // بررسی وجود کاربر
    const userExists = await User.findOne({ 
      $or: [{ email }, { phone }] 
    });
    
    if (userExists) {
      return res.status(400).json({ 
        message: 'این ایمیل یا شماره تماس قبلاً ثبت شده است' 
      });
    }

    // ایجاد کاربر جدید
    const user = await User.create({
      name,
      email,
      phone,
      password,
      role: role || 'customer',
      province: province || 'کابل',
      isActive: true
    });

    if (user) {
      res.status(201).json({
        _id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        province: user.province,
        token: generateToken(user._id),
      });
    } else {
      res.status(400).json({ message: 'اطلاعات نامعتبر است' });
    }
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ message: 'خطای سرور' });
  }
};

// @desc    ورود کاربر
// @route   POST /api/auth/login
// @access  Public
const login = async (req, res) => {
  try {
    const { email, phone, password } = req.body;
    
    // پیدا کردن کاربر با ایمیل یا شماره تماس
    const user = await User.findOne({
      $or: [
        { email: email || '' },
        { phone: phone || '' },
        { phone: email || '' }  // اگر کاربر با شماره تماس در فیلد ایمیل وارد کرده باشد
      ]
    });

    if (!user) {
      console.log('User not found:', { email, phone });
      return res.status(401).json({ message: 'ایمیل/شماره تماس یا رمز عبور اشتباه است' });
    }

    // بررسی رمز عبور - استفاده از متد comparePassword (نه matchPassword)
    const isPasswordMatch = await user.comparePassword(password);

    if (!isPasswordMatch) {
      console.log('Password mismatch for user:', user.email || user.phone);
      return res.status(401).json({ message: 'ایمیل/شماره تماس یا رمز عبور اشتباه است' });
    }

    // بررسی فعال بودن کاربر
    if (!user.isActive) {
      return res.status(401).json({ message: 'حساب کاربری شما غیرفعال است' });
    }

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      province: user.province,
      token: generateToken(user._id),
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'خطای سرور' });
  }
};

// @desc    دریافت اطلاعات کاربر جاری
// @route   GET /api/auth/me
// @access  Private
const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    res.json(user);
  } catch (error) {
    console.error('Get me error:', error);
    res.status(500).json({ message: 'خطای سرور' });
  }
};

module.exports = { register, login, getMe };