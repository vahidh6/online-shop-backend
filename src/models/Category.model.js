const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: true, 
    unique: true,
    trim: true 
  },
  nameEn: { 
    type: String, 
    trim: true 
  },
  icon: { 
    type: String, 
    default: '📦' 
  },
  slug: { 
    type: String, 
    required: true, 
    unique: true 
  },
  parentId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Category',
    default: null 
  },
  order: { 
    type: Number, 
    default: 0 
  },
  isActive: { 
    type: Boolean, 
    default: true 
  },
  image: { 
    type: String 
  }
}, { timestamps: true });

// ایجاد slug از نام
categorySchema.pre('save', function(next) {
  if (this.isModified('name')) {
    this.slug = this.name
      .replace(/[^\u0600-\u06FF\uFB8A\u067E\u0686\u06AF\u06A9\u06CCa-zA-Z0-9]/g, '-')
      .replace(/-+/g, '-')
      .toLowerCase();
  }
  next();
});

module.exports = mongoose.model('Category', categorySchema);