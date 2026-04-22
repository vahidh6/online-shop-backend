const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

// import routes
const authRoutes = require('./routes/auth.routes');
const productRoutes = require('./routes/product.routes');
const orderRoutes = require('./routes/orders');
const uploadRoutes = require('./routes/upload');
const locationRoutes = require('./routes/location.routes');
const settingsRoutes = require('./routes/settings.routes');
const categoryRoutes = require('./routes/category.routes');
const bannerRoutes = require('./routes/banner.routes');
const userRoutes = require('./routes/user.routes');

const app = express();

// ==================== MIDDLEWARE ====================

// 1. CORS - با آدرس Netlify
app.use(cors({
  origin: [
    'http://localhost:3000',
    'http://localhost:3001', 
    'http://localhost:5000',
    'https://advance20.netlify.app',
    'https://online-shop-frontend.vercel.app',
    'https://jawid-fizi.netlify.app' 
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// 2. پردازش JSON
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 3. فایل‌های استاتیک
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ==================== ROUTES ====================

// Routeهای عمومی
app.get('/', (req, res) => {
  res.json({ message: 'به فروشگاه آنلاین افغانستان خوش آمدید!' });
});

// API Routeها
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api', uploadRoutes);
app.use('/api/locations', locationRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/banners', bannerRoutes);
app.use('/api/users', userRoutes);


// ==================== ERROR HANDLER ====================
app.use((err, req, res, next) => {
  console.error('❌ Error:', err.stack);
  res.status(500).json({ 
    message: 'خطای سرور', 
    error: process.env.NODE_ENV === 'development' ? err.message : 'مشکلی پیش آمده است'
  });
});

// ==================== DATABASE CONNECTION ====================
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/shop_db')
  .then(() => console.log('✅ Connected to MongoDB'))
  .catch(err => console.error('❌ MongoDB connection error:', err.message));

// ==================== START SERVER ====================
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`\n🚀 Server running on http://localhost:${PORT}`);
  console.log(`📝 Auth API: http://localhost:${PORT}/api/auth`);
  console.log(`📝 Products API: http://localhost:${PORT}/api/products`);
  console.log(`📝 Orders API: http://localhost:${PORT}/api/orders`);
  console.log(`\n✅ Ready for requests\n`);
});