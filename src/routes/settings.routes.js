const express = require('express');
const router = express.Router();
const Setting = require('../models/Setting.model');
const { protect, restrictTo } = require('../middleware/auth.middleware');

// دریافت تنظیمات (عمومی - بدون لاگین)
router.get('/', async (req, res) => {
  try {
    let settings = await Setting.findOne();
    if (!settings) {
      // اگر تنظیمات وجود نداشت، ایجاد کن
      settings = await Setting.create({});
    }
    res.json(settings);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// بروزرسانی تنظیمات (فقط ادمین)
router.put('/', protect, restrictTo('admin'), async (req, res) => {
  try {
    const settings = await Setting.findOneAndUpdate(
      {},
      { ...req.body, updatedAt: new Date() },
      { new: true, upsert: true }
    );
    res.json(settings);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;