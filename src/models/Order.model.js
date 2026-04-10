const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  orderNumber: { type: String, unique: true },
  customerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  salesManagerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null }, // تغییر: required نباشد
  province: { type: String, required: true },
  items: [{
    productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    productName: String,
    quantity: { type: Number, required: true, min: 1 },
    price: Number
  }],
  subtotal: { type: Number, required: true },
  deliveryFee: { type: Number, default: 0 },
  totalAmount: { type: Number, required: true },
  status: { 
    type: String, 
    enum: ['pending_payment', 'payment_uploaded', 'payment_verified', 'processing', 'shipped', 'delivered', 'cancelled'],
    default: 'pending_payment'
  },
  paymentMethod: { 
    type: String, 
    enum: ['exchange_hawala', 'card_to_card', 'cash_on_delivery', 'crypto'],
    required: true 
  },
  paymentReceipt: {
    referenceNumber: String,
    bankName: String,
    senderName: String,
    amount: Number,
    uploadedAt: Date,
    verifiedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    verifiedAt: Date
  },
  trackingCode: { type: String },
  customerNotes: { type: String, maxlength: 500 }
}, { timestamps: true });

// ایجاد شماره سفارش خودکار
orderSchema.pre('save', async function(next) {
  if (this.isNew) {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const count = await mongoose.model('Order').countDocuments();
    
    // کد استان (2 حرف اول)
    const provinceCode = this.province.slice(0, 2);
    this.orderNumber = `${provinceCode}-${year}${month}-${String(count + 1).padStart(4, '0')}`;
  }
  next();
});

// انتساب خودکار مدیر فروش بر اساس استان
orderSchema.pre('save', async function(next) {
  if (this.isNew && !this.salesManagerId) {
    const User = mongoose.model('User');
    const salesManager = await User.findOne({ 
      role: 'sales_manager', 
      assignedProvince: this.province,
      isActive: true 
    });
    if (salesManager) {
      this.salesManagerId = salesManager._id;
    }
  }
  next();
});

module.exports = mongoose.model('Order', orderSchema);