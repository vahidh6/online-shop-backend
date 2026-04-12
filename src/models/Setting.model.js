const mongoose = require('mongoose');

const settingSchema = new mongoose.Schema({
  // اطلاعات پایه
  siteName: { type: String, default: 'شرکت تجارتی ادوانس' },
  siteDescription: { type: String, default: 'بزرگترین فروشگاه تخصصی در افغانستان' },
  siteLogo: { type: String, default: '' },
  siteFavicon: { type: String, default: '' },
  
  // اطلاعات تماس
  phone: { type: String, default: '۰۷۹۹ ۱۲۳ ۴۵۶۷' },
  email: { type: String, default: 'info@advance.af' },
  address: { type: String, default: 'کابل، افغانستان' },
  workingHours: { type: String, default: 'شنبه تا پنجشنبه ۹:۰۰ - ۱۷:۰۰' },
  
  // شبکه‌های اجتماعی
  facebook: { type: String, default: '' },
  instagram: { type: String, default: '' },
  telegram: { type: String, default: '' },
  whatsapp: { type: String, default: '' },
  
  // تنظیمات ارسال
  deliveryFeeKabul: { type: Number, default: 50000 },
  deliveryFeeOther: { type: Number, default: 100000 },
  freeDeliveryThreshold: { type: Number, default: 0 },
  
  // تنظیمات ظاهری
  primaryColor: { type: String, default: '#e53e3e' },
  secondaryColor: { type: String, default: '#3182ce' },
  footerText: { type: String, default: '© 2026 شرکت تجارتی ادوانس - تمامی حقوق محفوظ است' },
  
  // SEO
  metaTitle: { type: String, default: 'شرکت تجارتی ادوانس - فروشگاه تخصصی موبایل' },
  metaDescription: { type: String, default: 'بزرگترین فروشگاه تخصصی موبایل و لوازم جانبی در افغانستان' },
  metaKeywords: { type: String, default: 'موبایل, گوشی, لوازم جانبی, افغانستان' },
  
  // وضعیت
  isMaintenance: { type: Boolean, default: false },
  maintenanceMessage: { type: String, default: 'در حال بروزرسانی، به زودی بازمی‌گردیم' },
  
  updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Setting', settingSchema);