const express = require('express');
const Banner = require('../models/Banner.model');
const { protect, restrictTo } = require('../middleware/auth.middleware');

const router = express.Router();

// دریافت بنرهای فعال (عمومی)
router.get('/', async (req, res) => {
  try {
    const now = new Date();
    const banners = await Banner.find({
      isActive: true,
      $or: [
        { startDate: { $lte: now } },
        { startDate: { $exists: false } }
      ],
      $or: [
        { endDate: { $gte: now } },
        { endDate: { $exists: false } }
      ]
    }).sort({ order: 1 });
    
    res.json(banners);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// دریافت همه بنرها برای مدیریت (فقط ادمین)
router.get('/all', protect, restrictTo('admin'), async (req, res) => {
  try {
    const banners = await Banner.find().sort({ order: 1 });
    res.json(banners);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// دریافت یک بنر
router.get('/:id', protect, restrictTo('admin'), async (req, res) => {
  try {
    const banner = await Banner.findById(req.params.id);
    if (!banner) {
      return res.status(404).json({ message: 'بنر یافت نشد' });
    }
    res.json(banner);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ایجاد بنر جدید (فقط ادمین)
router.post('/', protect, restrictTo('admin'), async (req, res) => {
  try {
    const banner = await Banner.create(req.body);
    res.status(201).json(banner);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// بروزرسانی بنر (فقط ادمین)
router.put('/:id', protect, restrictTo('admin'), async (req, res) => {
  try {
    const banner = await Banner.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!banner) {
      return res.status(404).json({ message: 'بنر یافت نشد' });
    }
    res.json(banner);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// حذف بنر (فقط ادمین)
router.delete('/:id', protect, restrictTo('admin'), async (req, res) => {
  try {
    const banner = await Banner.findByIdAndDelete(req.params.id);
    if (!banner) {
      return res.status(404).json({ message: 'بنر یافت نشد' });
    }
    res.json({ message: 'بنر با موفقیت حذف شد' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;