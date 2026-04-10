const express = require('express');
const Product = require('../models/Product.model');
const Inventory = require('../models/Inventory.model');
const { protect, restrictTo } = require('../middleware/auth.middleware');

const router = express.Router();

// دریافت همه محصولات (با فیلتر بر اساس استان)
router.get('/', async (req, res) => {
  try {
    const { province, category } = req.query;
    
    let query = { isActive: true };
    if (category) query.category = category;
    
    const products = await Product.find(query);
    
    // اگر استان مشخص شده، موجودی را هم نشان بده
    if (province) {
      const inventories = await Inventory.find({ province });
      const productIdsWithInventory = inventories.map(inv => inv.productId.toString());
      const filteredProducts = products.filter(p => productIdsWithInventory.includes(p._id.toString()));
      
      const productsWithStock = filteredProducts.map(product => {
        const inventory = inventories.find(inv => inv.productId.toString() === product._id.toString());
        return {
          ...product.toObject(),
          availableQuantity: inventory ? inventory.quantity : 0,
          price: inventory?.priceOverride || product.price
        };
      });
      
      return res.json(productsWithStock);
    }
    
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: 'خطا در دریافت محصولات', error: error.message });
  }
});

// دریافت یک محصول
router.get('/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'محصول یافت نشد' });
    }
    res.json(product);
  } catch (error) {
    res.status(500).json({ message: 'خطا در دریافت محصول', error: error.message });
  }
});

// ایجاد محصول جدید (فقط ادمین)
router.post('/', protect, restrictTo('admin'), async (req, res) => {
  try {
    const product = await Product.create(req.body);
    res.status(201).json(product);
  } catch (error) {
    res.status(500).json({ message: 'خطا در ایجاد محصول', error: error.message });
  }
});

// بروزرسانی محصول (فقط ادمین)
router.put('/:id', protect, restrictTo('admin'), async (req, res) => {
  try {
    const product = await Product.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!product) {
      return res.status(404).json({ message: 'محصول یافت نشد' });
    }
    res.json(product);
  } catch (error) {
    res.status(500).json({ message: 'خطا در بروزرسانی محصول', error: error.message });
  }
});

// حذف محصول (فقط ادمین)
router.delete('/:id', protect, restrictTo('admin'), async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'محصول یافت نشد' });
    }
    res.json({ message: 'محصول با موفقیت حذف شد' });
  } catch (error) {
    res.status(500).json({ message: 'خطا در حذف محصول', error: error.message });
  }
});

// بروزرسانی موجودی انبار
router.put('/inventory/:productId', protect, async (req, res) => {
  try {
    const { productId } = req.params;
    const { province, quantity } = req.body;
    
    // بررسی دسترسی مسئول فروش
    if (req.user.role === 'sales_manager' && req.user.assignedProvince !== province) {
      return res.status(403).json({ message: 'شما فقط می‌توانید موجودی منطقه خود را تغییر دهید' });
    }
    
    const inventory = await Inventory.findOneAndUpdate(
      { productId, province },
      { quantity, updatedBy: req.user._id },
      { upsert: true, new: true }
    );
    
    res.json(inventory);
  } catch (error) {
    res.status(500).json({ message: 'خطا در بروزرسانی موجودی', error: error.message });
  }
});

module.exports = router;