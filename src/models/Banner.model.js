const mongoose = require('mongoose');

const bannerSchema = new mongoose.Schema({
  title: { 
    type: String, 
    required: true 
  },
  titleEn: { 
    type: String 
  },
  description: { 
    type: String 
  },
  descriptionEn: { 
    type: String 
  },
  image: { 
    type: String, 
    required: true 
  },
  imageMobile: { 
    type: String 
  },
  link: { 
    type: String 
  },
  bgColor: { 
    type: String, 
    default: '#3b82f6' 
  },
  order: { 
    type: Number, 
    default: 0 
  },
  isActive: { 
    type: Boolean, 
    default: true 
  },
  startDate: { 
    type: Date 
  },
  endDate: { 
    type: Date 
  },
  buttonText: { 
    type: String, 
    default: 'مشاهده بیشتر' 
  },
  buttonLink: { 
    type: String 
  }
}, { timestamps: true });

module.exports = mongoose.model('Banner', bannerSchema);