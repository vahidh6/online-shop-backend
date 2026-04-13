const express = require('express');
const Category = require('../models/Category.model');
const { protect, restrictTo } = require('../middleware/auth.middleware');

const router = express.Router();

// دریافت همه دسته‌بندی‌ها (عمومی)
router.get('/', async (req, res) => {
  try {
    const categories = await Category.find({ isActive: true })
      .sort({ order: 1, name: 1 });
    res.json(categories);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// دریافت یک دسته‌بندی
router.get('/:id', async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);
    if (!category) {
      return res.status(404).json({ message: 'دسته‌بندی یافت نشد' });
    }
    res.json(category);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ایجاد دسته‌بندی جدید (فقط ادمین)
router.post('/', protect, restrictTo('admin'), async (req, res) => {
  try {
    const category = await Category.create(req.body);
    res.status(201).json(category);
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ message: 'این نام دسته‌بندی قبلاً ثبت شده است' });
    }
    res.status(500).json({ message: error.message });
  }
});

// بروزرسانی دسته‌بندی (فقط ادمین)
router.put('/:id', protect, restrictTo('admin'), async (req, res) => {
  try {
    const category = await Category.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!category) {
      return res.status(404).json({ message: 'دسته‌بندی یافت نشد' });
    }
    res.json(category);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// حذف دسته‌بندی (فقط ادمین)
router.delete('/:id', protect, restrictTo('admin'), async (req, res) => {
  try {
    const category = await Category.findByIdAndDelete(req.params.id);
    if (!category) {
      return res.status(404).json({ message: 'دسته‌بندی یافت نشد' });
    }
    res.json({ message: 'دسته‌بندی با موفقیت حذف شد' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;