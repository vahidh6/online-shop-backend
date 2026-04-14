const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/User.model');
const { sendWelcomeNotifications } = require('../controllers/notification.controller');
const { protect } = require('../middleware/auth.middleware');

const router = express.Router();

// ثبت نام کاربر جدید
router.post('/register', async (req, res) => {
  try {
    const { name, email, phone, password, province, city, address, role } = req.body;
    
    // بررسی وجود کاربر با ایمیل یا شماره تماس
    const existingUser = await User.findOne({ 
      $or: [{ email }, { phone }] 
    });
    
    if (existingUser) {
      return res.status(400).json({ message: 'این ایمیل یا شماره قبلاً ثبت شده است' });
    }
    
    const user = await User.create({
      name,
      email,
      phone,
      password,
      province,
      city,
      address,
      role: role || 'customer'
    });
    
    // ارسال نوتیفیکیشن خوش‌آمدگویی
    sendWelcomeNotifications(user).catch(err => console.error('Notification error:', err));
    
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: '30d'
    });
    
    res.status(201).json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        province: user.province
      }
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ message: 'خطا در ثبت نام', error: error.message });
  }
});

// ورود کاربر - پشتیبانی از ایمیل و شماره تماس
router.post('/login', async (req, res) => {
  try {
    const { email, phone, password } = req.body;
    
    // پیدا کردن کاربر با ایمیل یا شماره تماس
    const user = await User.findOne({
      $or: [
        { email: email || '' },
        { phone: phone || '' },
        { phone: email || '' }
      ]
    });
    
    if (!user) {
      return res.status(401).json({ message: 'ایمیل/شماره تماس یا رمز عبور اشتباه است' });
    }
    
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'ایمیل/شماره تماس یا رمز عبور اشتباه است' });
    }
    
    if (!user.isActive) {
      return res.status(401).json({ message: 'حساب کاربری شما غیرفعال شده است' });
    }
    
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: '30d'
    });
    
    res.json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        province: user.province,
        assignedProvince: user.assignedProvince
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'خطا در ورود', error: error.message });
  }
});

// دریافت اطلاعات کاربر فعلی
router.get('/me', protect, async (req, res) => {
  res.json({ user: req.user });
});

module.exports = router;