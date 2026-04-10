const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  description: { type: String, required: true },
  price: { type: Number, required: true, min: 0 },
  category: { 
    type: String, 
    required: true,
    enum: [
      // قطعات و تعمیرات
      'قطعات و تعمیرات موبایل',
      // باتری و شارژ
      'باتری و شارژ',
      // محافظ و جانبی
      'محافظ و جانبی',
      // صدا و تصویر
      'صدا و تصویر',
      // سایر
      'سایر'
    ],
    default: 'سایر'
  },
  subCategory: {
    type: String,
    enum: [
      // زیرمجموعه قطعات و تعمیرات
      'لوازم تعمیرات سخت افزاری',
      'قطعات و آی سی موبایل',
      'LCD و صفحه نمایش',
      // زیرمجموعه باتری و شارژ
      'باطری موبایل',
      'پاوربانک',
      'شارژر و کابل',
      // زیرمجموعه محافظ و جانبی
      'پوشش و گلس',
      'کاور و قاب',
      // زیرمجموعه صدا و تصویر
      'هدفون و هدست',
      'اسپیکر همراه',
      'MP3 و MP4 پلیر',
      // زیرمجموعه سایر
      'ساعت هوشمند',
      'هارد و فلش مموری',
      'باکس و اکتیویشن',
      'سایر'
    ]
  },
  images: [{ type: String }],
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

module.exports = mongoose.model('Product', productSchema);