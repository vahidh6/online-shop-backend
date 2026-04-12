const mongoose = require('mongoose');
const Setting = require('../src/models/Setting.model');
require('dotenv').config();

const defaultSettings = {
  siteName: 'شرکت تجارتی ادوانس',
  siteDescription: 'بزرگترین فروشگاه تخصصی موبایل و لوازم جانبی در افغانستان',
  phone: '۰۷۹۹ ۱۲۳ ۴۵۶۷',
  email: 'info@advance.af',
  address: 'کابل، افغانستان',
  workingHours: 'شنبه تا پنجشنبه ۹:۰۰ - ۱۷:۰۰',
  deliveryFeeKabul: 50000,
  deliveryFeeOther: 100000,
  freeDeliveryThreshold: 0,
  primaryColor: '#e53e3e',
  secondaryColor: '#3182ce',
  footerText: '© 2026 شرکت تجارتی ادوانس - تمامی حقوق محفوظ است',
  metaTitle: 'شرکت تجارتی ادوانس - فروشگاه تخصصی موبایل',
  metaDescription: 'بزرگترین فروشگاه تخصصی موبایل و لوازم جانبی در افغانستان',
  metaKeywords: 'موبایل, گوشی, لوازم جانبی, افغانستان',
  isMaintenance: false,
  maintenanceMessage: 'در حال بروزرسانی، به زودی بازمی‌گردیم'
};

async function seedSettings() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    await Setting.deleteMany({});
    await Setting.create(defaultSettings);
    console.log('✅ Settings created successfully');

    await mongoose.disconnect();
    console.log('✅ Done');
  } catch (error) {
    console.error('Error:', error);
  }
}

seedSettings();