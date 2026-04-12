const express = require('express');
const router = express.Router();
const Province = require('../models/Province.model');
const District = require('../models/District.model');
const { protect, restrictTo } = require('../middleware/auth.middleware');

// دریافت همه ولایت‌ها
router.get('/provinces', async (req, res) => {
  try {
    const provinces = await Province.find({ isActive: true }).sort({ name: 1 });
    res.json(provinces);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// دریافت ولسوالی‌های یک ولایت
router.get('/districts/:provinceId', async (req, res) => {
  try {
    const districts = await District.find({ 
      provinceId: req.params.provinceId,
      isActive: true 
    }).sort({ name: 1 });
    res.json(districts);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// دریافت همه ولسوالی‌ها
router.get('/districts', async (req, res) => {
  try {
    const districts = await District.find({ isActive: true })
      .populate('provinceId', 'name')
      .sort({ provinceName: 1, name: 1 });
    res.json(districts);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ایجاد ولایت جدید (فقط ادمین)
router.post('/provinces', protect, restrictTo('admin'), async (req, res) => {
  try {
    const province = await Province.create(req.body);
    res.status(201).json(province);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ایجاد ولسوالی جدید (فقط ادمین)
router.post('/districts', protect, restrictTo('admin'), async (req, res) => {
  try {
    const district = await District.create(req.body);
    res.status(201).json(district);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;