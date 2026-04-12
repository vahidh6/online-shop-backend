const mongoose = require('mongoose');

const provinceSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  nameEn: { type: String },
  code: { type: String, unique: true },
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

module.exports = mongoose.model('Province', provinceSchema);