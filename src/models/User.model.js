const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  phone: { type: String, required: true, unique: true, trim: true },
  email: { type: String, lowercase: true, trim: true, sparse: true },
  password: { type: String, required: true, minlength: 6 },
  role: { 
    type: String, 
    enum: ['admin', 'sales_manager', 'customer'], 
    default: 'customer' 
  },
  province: { 
    type: String, 
    required: true,
    enum: [
      'کابل', 'کاپیسا', 'پروان', 'میدان وردک', 'لوگر', 'بغلان', 'سمنگان', 'بلخ',
      'جوزجان', 'فاریاب', 'سرپل', 'قندوز', 'تخار', 'بدخشان', 'نورستان', 'کنر',
      'لغمان', 'ننگرهار', 'کندهار', 'زابل', 'ارزگان', 'غزنی', 'پکتیا', 'پکتیکا',
      'خوست', 'بامیان', 'دایکندی', 'غور', 'هرات', 'بادغیس', 'فراه', 'نیمروز',
      'هلمند', 'تایوان', 'پنجشیر', 'سایر'
    ],
    default: 'کابل'
  },
  district: { type: String, trim: true }, // ولسوالی
  city: { type: String, trim: true },
  address: { type: String, trim: true },
  assignedProvince: { type: String }, // فقط برای مسئولین فروش
  commissionRate: { type: Number, default: 0, min: 0, max: 100 },
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', userSchema);