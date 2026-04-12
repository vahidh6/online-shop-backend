const mongoose = require('mongoose');

const districtSchema = new mongoose.Schema({
  name: { type: String, required: true },
  provinceId: { type: mongoose.Schema.Types.ObjectId, ref: 'Province', required: true },
  provinceName: { type: String },
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

// ایندکس ترکیبی برای جلوگیری از تکراری شدن
districtSchema.index({ name: 1, provinceId: 1 }, { unique: true });

module.exports = mongoose.model('District', districtSchema);