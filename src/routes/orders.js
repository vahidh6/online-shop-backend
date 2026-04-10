const express = require('express');
const router = express.Router();
const Order = require('../models/Order.model');
const Inventory = require('../models/Inventory.model');
const { protect } = require('../middleware/auth.middleware');

// دریافت سفارشات بر اساس نقش
router.get('/', protect, async (req, res) => {
  try {
    let query = {};
    
    if (req.user.role === 'customer') {
      query.customerId = req.user._id;
    } else if (req.user.role === 'sales_manager') {
      query.province = req.user.assignedProvince;
    }
    // ادمین: همه سفارشات
    
    const orders = await Order.find(query)
      .populate('customerId', 'name phone email')
      .populate('salesManagerId', 'name phone')
      .sort({ createdAt: -1 });
      
    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// دریافت یک سفارش
router.get('/:id', protect, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('customerId', 'name phone email address')
      .populate('salesManagerId', 'name phone');
      
    if (!order) {
      return res.status(404).json({ message: 'سفارش یافت نشد' });
    }
    
    // بررسی دسترسی
    if (req.user.role === 'customer' && order.customerId._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'دسترسی غیرمجاز' });
    }
    if (req.user.role === 'sales_manager' && order.province !== req.user.assignedProvince) {
      return res.status(403).json({ message: 'دسترسی غیرمجاز' });
    }
    
    res.json(order);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ایجاد سفارش جدید
router.post('/', protect, async (req, res) => {
  try {
    if (req.user.role !== 'customer') {
      return res.status(403).json({ message: 'فقط مشتریان می‌توانند سفارش ثبت کنند' });
    }
    
    // بررسی موجودی
    for (const item of req.body.items) {
      const inventory = await Inventory.findOne({
        productId: item.productId,
        province: req.user.province
      });
      
      if (!inventory) {
        return res.status(400).json({ 
          message: `محصول ${item.productName} در استان ${req.user.province} موجود نیست`
        });
      }
      
      const available = inventory.quantity - (inventory.reservedQuantity || 0);
      if (available < item.quantity) {
        return res.status(400).json({ 
          message: `موجودی محصول ${item.productName} در استان ${req.user.province} کافی نیست`,
          available,
          requested: item.quantity
        });
      }
    }
    
    // رزرو موجودی
    for (const item of req.body.items) {
      const inventory = await Inventory.findOne({
        productId: item.productId,
        province: req.user.province
      });
      inventory.reservedQuantity = (inventory.reservedQuantity || 0) + item.quantity;
      await inventory.save();
    }
    
    // محاسبه مبالغ
    const subtotal = req.body.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const deliveryFee = req.user.province === 'کابل' ? 50000 : 100000;
    
    const order = await Order.create({
      ...req.body,
      customerId: req.user._id,
      province: req.user.province,
      subtotal,
      deliveryFee,
      totalAmount: subtotal + deliveryFee
    });
    
    await order.populate('customerId', 'name phone');
    await order.populate('salesManagerId', 'name phone');
    
    res.status(201).json(order);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// آپلود رسید پرداخت
router.post('/:id/upload-payment', protect, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    
    if (!order) {
      return res.status(404).json({ message: 'سفارش یافت نشد' });
    }
    
    if (order.customerId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'دسترسی غیرمجاز' });
    }
    
    if (order.status !== 'pending_payment') {
      return res.status(400).json({ message: 'این سفارش در وضعیت قابل آپلود رسید نیست' });
    }
    
    order.paymentReceipt = {
      ...req.body,
      uploadedAt: new Date()
    };
    order.status = 'payment_uploaded';
    await order.save();
    
    res.json({ message: 'رسید پرداخت با موفقیت آپلود شد', order });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// تایید پرداخت (ادمین یا مدیر فروش)
router.put('/:id/verify-payment', protect, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    
    if (!order) {
      return res.status(404).json({ message: 'سفارش یافت نشد' });
    }
    
    // بررسی دسترسی
    const isAdmin = req.user.role === 'admin';
    const isCorrectManager = req.user.role === 'sales_manager' && order.province === req.user.assignedProvince;
    
    if (!isAdmin && !isCorrectManager) {
      return res.status(403).json({ message: 'دسترسی غیرمجاز' });
    }
    
    if (order.status !== 'payment_uploaded') {
      return res.status(400).json({ message: 'این سفارش در وضعیت قابل تایید پرداخت نیست' });
    }
    
    // کاهش موجودی واقعی
    for (const item of order.items) {
      const inventory = await Inventory.findOne({
        productId: item.productId,
        province: order.province
      });
      if (inventory) {
        inventory.quantity -= item.quantity;
        inventory.reservedQuantity -= item.quantity;
        await inventory.save();
      }
    }
    
    order.status = 'payment_verified';
    order.paymentReceipt.verifiedBy = req.user._id;
    order.paymentReceipt.verifiedAt = new Date();
    await order.save();
    
    res.json({ message: 'پرداخت با موفقیت تایید شد', order });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// بروزرسانی وضعیت سفارش
router.put('/:id/status', protect, async (req, res) => {
  try {
    const { status, trackingCode } = req.body;
    const order = await Order.findById(req.params.id);
    
    if (!order) {
      return res.status(404).json({ message: 'سفارش یافت نشد' });
    }
    
    // بررسی دسترسی
    if (req.user.role === 'customer') {
      return res.status(403).json({ message: 'مشتریان نمی‌توانند وضعیت را تغییر دهند' });
    }
    
    if (req.user.role === 'sales_manager' && order.province !== req.user.assignedProvince) {
      return res.status(403).json({ message: 'دسترسی غیرمجاز' });
    }
    
    // اعتبارسنجی تغییر وضعیت
    const validTransitions = {
      'pending_payment': ['payment_uploaded', 'cancelled'],
      'payment_uploaded': ['payment_verified', 'cancelled'],
      'payment_verified': ['processing', 'cancelled'],
      'processing': ['shipped', 'cancelled'],
      'shipped': ['delivered', 'cancelled'],
      'delivered': [],
      'cancelled': []
    };
    
    if (!validTransitions[order.status].includes(status)) {
      return res.status(400).json({ 
        message: `تغییر وضعیت از ${order.status} به ${status} مجاز نیست` 
      });
    }
    
    order.status = status;
    if (trackingCode) order.trackingCode = trackingCode;
    await order.save();
    
    res.json(order);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// آمار سفارشات (ادمین)
router.get('/stats/summary', protect, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'دسترسی غیرمجاز' });
    }
    
    const totalOrders = await Order.countDocuments();
    const pendingPayment = await Order.countDocuments({ status: 'pending_payment' });
    const paymentUploaded = await Order.countDocuments({ status: 'payment_uploaded' });
    const delivered = await Order.countDocuments({ status: 'delivered' });
    
    const revenue = await Order.aggregate([
      { $match: { status: 'delivered' } },
      { $group: { _id: null, total: { $sum: '$totalAmount' } } }
    ]);
    
    res.json({
      totalOrders,
      pendingPayment,
      paymentUploaded,
      delivered,
      totalRevenue: revenue[0]?.total || 0
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;