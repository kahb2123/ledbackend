const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });
const Service = require('../../src/models/Service');
const mongoose = require('mongoose');

const services = [
  // Indoor LED Screens
  {
    type: 'P2',
    category: 'indoor',
    name: {
      en: 'P2 Indoor LED Screen',
      am: 'P2 የቤት ውስጥ LED ስክሪን'
    },
    description: {
      en: 'High resolution indoor LED screen perfect for conferences and exhibitions',
      am: 'ከፍተኛ ጥራት ያለው የቤት ውስጥ LED ስክሪን ለኮንፈረንስ እና ኤግዚቢሽን'
    },
    pricePerDay: 2500,
    specifications: {
      pixelPitch: '2mm',
      brightness: '1200 nits',
      resolution: '1920x1080 per sqm',
      weight: '15kg/sqm',
      dimensions: '500x500mm per cabinet'
    },
    features: [
      { en: 'Ultra HD resolution', am: 'እጅግ ከፍተኛ ጥራት' },
      { en: 'Seamless拼接', am: 'ያለማንኛውም መጋጠሚያ' }
    ],
    minOrder: 2,
    stockQuantity: 50
  },
  {
    type: 'P3',
    category: 'indoor',
    name: {
      en: 'P3 Indoor LED Screen',
      am: 'P3 የቤት ውስጥ LED ስክሪን'
    },
    description: {
      en: 'Versatile indoor LED screen for various events',
      am: 'ሁለገብ የቤት ውስጥ LED ስክሪን'
    },
    pricePerDay: 2000,
    specifications: {
      pixelPitch: '3mm',
      brightness: '1500 nits',
      resolution: '1280x720 per sqm',
      weight: '14kg/sqm',
      dimensions: '500x500mm per cabinet'
    },
    features: [
      { en: 'High brightness', am: 'ከፍተኛ ብርሃን' },
      { en: 'Wide viewing angle', am: 'ሰፊ የእይታ አንግል' }
    ],
    minOrder: 2,
    stockQuantity: 75
  },
  {
    type: 'P4',
    category: 'indoor',
    name: {
      en: 'P4 Indoor LED Screen',
      am: 'P4 የቤት ውስጥ LED ስክሪን'
    },
    description: {
      en: 'Cost-effective indoor LED solution',
      am: 'ተመጣጣኝ ዋጋ ያለው የቤት ውስጥ LED መፍትሄ'
    },
    pricePerDay: 1500,
    specifications: {
      pixelPitch: '4mm',
      brightness: '1800 nits',
      resolution: '960x540 per sqm',
      weight: '13kg/sqm',
      dimensions: '500x500mm per cabinet'
    },
    features: [
      { en: 'Energy efficient', am: 'ኃይል ቆጣቢ' },
      { en: 'Easy installation', am: 'ቀላል መጫኛ' }
    ],
    minOrder: 2,
    stockQuantity: 100
  },
  // Outdoor LED Screens
  {
    type: 'P5',
    category: 'outdoor',
    name: {
      en: 'P5 Outdoor LED Screen',
      am: 'P5 የውጭ LED ስክሪን'
    },
    description: {
      en: 'Weather-resistant outdoor LED screen',
      am: 'የአየር ሁኔታን የሚቋቋም የውጭ LED ስክሪን'
    },
    pricePerDay: 3000,
    specifications: {
      pixelPitch: '5mm',
      brightness: '5500 nits',
      resolution: '768x432 per sqm',
      weight: '25kg/sqm',
      dimensions: '500x1000mm per cabinet'
    },
    features: [
      { en: 'Weatherproof', am: 'ከዝናብ የሚከላከል' },
      { en: 'High brightness for daylight', am: 'በቀን ብርሃን የሚታይ' }
    ],
    minOrder: 3,
    stockQuantity: 40
  },
  {
    type: 'P10',
    category: 'outdoor',
    name: {
      en: 'P10 Outdoor LED Screen',
      am: 'P10 የውጭ LED ስክሪን'
    },
    description: {
      en: 'Large format outdoor display for billboards',
      am: 'ለማስታወቂያ ሰሌዳዎች ትልቅ የውጭ ማሳያ'
    },
    pricePerDay: 2000,
    specifications: {
      pixelPitch: '10mm',
      brightness: '6500 nits',
      resolution: '384x216 per sqm',
      weight: '30kg/sqm',
      dimensions: '500x1000mm per cabinet'
    },
    features: [
      { en: 'Cost-effective for large areas', am: 'ለትልቅ ቦታዎች ተመጣጣኝ' },
      { en: 'High durability', am: 'ከፍተኛ ዘላቂነት' }
    ],
    minOrder: 4,
    stockQuantity: 30
  }
];

const seedServices = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Clear existing services
    await Service.deleteMany({});
    console.log('Cleared existing services');

    // Insert new services
    await Service.insertMany(services);
    console.log('Services seeded successfully');

    process.exit(0);
  } catch (error) {
    console.error('Error seeding services:', error);
    process.exit(1);
  }
};

seedServices();