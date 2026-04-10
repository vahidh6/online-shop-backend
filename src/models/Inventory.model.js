const mongoose = require('mongoose');

const inventorySchema = new mongoose.Schema({
  productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  province: { 
    type: String, 
    required: true,
    enum: ['کابل', 'هرات', 'مزارشریف', 'قندهار', 'بلخ', 'ننگرهار', 'بامیان']
  },
  quantity: { type: Number, required: true, default: 0, min: 0 },
  priceOverride: { type: Number, min: 0 },
  updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

inventorySchema.index({ productId: 1, province: 1 }, { unique: true });

module.exports = mongoose.model('Inventory', inventorySchema);