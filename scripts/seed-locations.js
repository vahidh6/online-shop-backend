const mongoose = require('mongoose');
const Province = require('../src/models/Province.model');
const District = require('../src/models/District.model');
require('dotenv').config();

const provinces = [
  { name: 'کابل', nameEn: 'Kabul', code: 'KB' },
  { name: 'هرات', nameEn: 'Herat', code: 'HR' },
  { name: 'مزارشریف', nameEn: 'Mazar-i-Sharif', code: 'MZ' },
  { name: 'قندهار', nameEn: 'Kandahar', code: 'KD' },
  { name: 'بلخ', nameEn: 'Balkh', code: 'BL' },
  { name: 'ننگرهار', nameEn: 'Nangarhar', code: 'NG' },
  { name: 'بامیان', nameEn: 'Bamyan', code: 'BM' },
  { name: 'غزنی', nameEn: 'Ghazni', code: 'GZ' },
  { name: 'کندهار', nameEn: 'Kandahar', code: 'KN' },
  { name: 'بدخشان', nameEn: 'Badakhshan', code: 'BD' },
  { name: 'تخار', nameEn: 'Takhar', code: 'TK' },
  { name: 'قندوز', nameEn: 'Kunduz', code: 'KZ' },
  { name: 'پروان', nameEn: 'Parwan', code: 'PW' },
  { name: 'کاپیسا', nameEn: 'Kapisa', code: 'KP' },
  { name: 'لوگر', nameEn: 'Logar', code: 'LG' },
  { name: 'پکتیا', nameEn: 'Paktia', code: 'PT' },
  { name: 'پکتیکا', nameEn: 'Paktika', code: 'PK' },
  { name: 'خوست', nameEn: 'Khost', code: 'KH' },
  { name: 'کنر', nameEn: 'Kunar', code: 'KR' },
  { name: 'لغمان', nameEn: 'Laghman', code: 'LM' },
  { name: 'نورستان', nameEn: 'Nuristan', code: 'NR' },
  { name: 'بغلان', nameEn: 'Baghlan', code: 'BG' },
  { name: 'سمنگان', nameEn: 'Samangan', code: 'SM' },
  { name: 'جوزجان', nameEn: 'Jowzjan', code: 'JZ' },
  { name: 'فاریاب', nameEn: 'Faryab', code: 'FY' },
  { name: 'سرپل', nameEn: 'Sar-e Pol', code: 'SP' },
  { name: 'دایکندی', nameEn: 'Daykundi', code: 'DK' },
  { name: 'غور', nameEn: 'Ghor', code: 'GH' },
  { name: 'بادغیس', nameEn: 'Badghis', code: 'BD' },
  { name: 'فراه', nameEn: 'Farah', code: 'FR' },
  { name: 'نیمروز', nameEn: 'Nimruz', code: 'NR' },
  { name: 'هلمند', nameEn: 'Helmand', code: 'HL' },
  { name: 'زابل', nameEn: 'Zabul', code: 'ZB' },
  { name: 'ارزگان', nameEn: 'Urozgan', code: 'UR' },
  { name: 'پنجشیر', nameEn: 'Panjshir', code: 'PJ' }
];

const districts = {
  'کابل': ['کابل مرکز', 'پغمان', 'چهار آسیاب', 'ده سبز', 'کلکان', 'قلعه نادر', 'موسهی', 'میربچه کوت', 'استاليف', 'گلدره', 'خاک جبار', 'فرزه', 'شکردره', 'بگرامی'],
  'هرات': ['هرات مرکز', 'انجیل', 'گذره', 'کرخ', 'کشک کهنه', 'کشک رباط سنگی', 'ادرسکن', 'زنده جان', 'چشت شریف', 'فارسی', 'غوریان', 'اوبه', 'پشتون زرغون'],
  'مزارشریف': ['مزارشریف مرکز', 'نهر شاهی', 'دهدادی', 'چمتال', 'چارکنت', 'شولگره', 'زاری', 'کشم', 'بلخ'],
  'قندهار': ['قندهار مرکز', 'ارغستان', 'ارغنداب', 'دامان', 'ژری', 'خاکریز', 'معروف', 'میوند', 'نش', 'پنجوایی', 'شاه ولی کوت', 'سپین بولدک', 'تخته پل'],
  'ننگرهار': ['جلال آباد مرکز', 'بهسود', 'چپر هار', 'دره نور', 'خوگیانی', 'کوز کنر', 'لال پور', 'مومند دره', 'نازیان', 'پچیر او اگام', 'رودات', 'شیرزاد', 'سرخرود', 'هسکه مینه'],
  'بامیان': ['بامیان مرکز', 'پنجاب', 'کمرد', 'سایگان', 'شبر', 'ورس', 'یکاولنگ', 'کهمرد']
};

async function seedLocations() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // پاک کردن داده‌های قبلی
    await Province.deleteMany({});
    await District.deleteMany({});

    // ایجاد ولایت‌ها
    const createdProvinces = await Province.insertMany(provinces);
    console.log(`✅ ${createdProvinces.length} provinces created`);

    // ایجاد ولسوالی‌ها
    for (const province of createdProvinces) {
      const provinceDistricts = districts[province.name] || [];
      for (const districtName of provinceDistricts) {
        await District.create({
          name: districtName,
          provinceId: province._id,
          provinceName: province.name
        });
      }
    }
    console.log('✅ Districts created');

    await mongoose.disconnect();
    console.log('✅ Done');
  } catch (error) {
    console.error('Error:', error);
  }
}

seedLocations();