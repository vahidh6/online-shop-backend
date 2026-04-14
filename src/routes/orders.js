const express = require('express');
const router = express.Router();
const Order = require('../models/Order.model');
const Inventory = require('../models/Inventory.model');
const { protect } = require('../middleware/auth.middleware');
const { sendOrderConfirmationNotifications, sendOrderStatusUpdateNotifications } = require('../controllers/notification.controller');

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

// ایجاد سفارش جدید (بدون بررسی موجودی - با وضعیت متفاوت برای پرداخت نقدی)
router.post('/', protect, async (req, res) => {
  try {
    if (req.user.role !== 'customer') {
      return res.status(403).json({ message: 'فقط مشتریان می‌توانند سفارش ثبت کنند' });
    }
    
    // محاسبه مبالغ
    const subtotal = req.body.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const deliveryFee = req.user.province === 'کابل' ? 50000 : 100000;
    
    // تعیین وضعیت اولیه بر اساس روش پرداخت
    let initialStatus = 'pending_payment';
    if (req.body.paymentMethod === 'cash_on_delivery') {
      initialStatus = 'processing';  // پرداخت نقدی هنگام تحویل - نیازی به آپلود رسید ندارد
    }
    
    const order = await Order.create({
      ...req.body,
      customerId: req.user._id,
      province: req.user.province,
      subtotal,
      deliveryFee,
      totalAmount: subtotal + deliveryFee,
      status: initialStatus
    });
    
    await order.populate('customerId', 'name phone email');
    await order.populate('salesManagerId', 'name phone');
    
    // ارسال نوتیفیکیشن تأیید سفارش
    sendOrderConfirmationNotifications(order, order.customerId).catch(err => console.error('Notification error:', err));
    
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

// تایید پرداخت (ادمین یا مدیر فروش) - بدون کاهش موجودی
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
    
    const oldStatus = order.status;
    order.status = 'payment_verified';
    order.paymentReceipt.verifiedBy = req.user._id;
    order.paymentReceipt.verifiedAt = new Date();
    await order.save();
    
    // ارسال نوتیفیکیشن تغییر وضعیت
    await order.populate('customerId', 'name email phone');
    sendOrderStatusUpdateNotifications(order, order.customerId, oldStatus, 'payment_verified').catch(err => console.error('Notification error:', err));
    
    res.json({ message: 'پرداخت با موفقیت تایید شد', order });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// بروزرسانی وضعیت سفارش (قوانین ساده شده)
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
    
    // قوانین ساده شده تغییر وضعیت - اجازه تغییر مستقیم
    const validTransitions = {
      'pending_payment': ['payment_uploaded', 'payment_verified', 'processing', 'shipped', 'delivered', 'cancelled'],
      'payment_uploaded': ['payment_verified', 'processing', 'shipped', 'delivered', 'cancelled'],
      'payment_verified': ['processing', 'shipped', 'delivered', 'cancelled'],
      'processing': ['shipped', 'delivered', 'cancelled'],
      'shipped': ['delivered', 'cancelled'],
      'delivered': [],
      'cancelled': []
    };
    
    if (!validTransitions[order.status].includes(status)) {
      return res.status(400).json({ 
        message: `تغییر وضعیت از ${order.status} به ${status} مجاز نیست` 
      });
    }
    
    const oldStatus = order.status;
    order.status = status;
    if (trackingCode) order.trackingCode = trackingCode;
    await order.save();
    
    // ارسال نوتیفیکیشن تغییر وضعیت
    await order.populate('customerId', 'name email phone');
    sendOrderStatusUpdateNotifications(order, order.customerId, oldStatus, status).catch(err => console.error('Notification error:', err));
    
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