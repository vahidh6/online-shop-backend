const mongoose = require('mongoose');

const voucherSchema = new mongoose.Schema({
  orderId: { type: mongoose.Schema.Types.ObjectId, ref: 'Order', required: true },
  exchangeName: { type: String, trim: true },
  hawalaNumber: { type: String, trim: true },
  imageUrl: { type: String, required: true },
  uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  verifiedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  verifiedAt: Date,
  status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
  rejectionReason: String
}, { timestamps: true });

module.exports = mongoose.model('Voucher', voucherSchema);