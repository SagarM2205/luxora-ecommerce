const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '..', '.env') });

const User = require('../models/User');
const Product = require('../models/Product');

const products = [
  {
    name: 'Classic Slim Fit Oxford Shirt',
    description: 'Premium cotton oxford shirt with a modern slim fit. Perfect for office or casual outings. Features button-down collar and chest pocket.',
    price: 1299,
    mrp: 2499,
    category: 'Men',
    brand: 'LUXORA Essentials',
    images: ['https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=500'],
    sizes: ['S', 'M', 'L', 'XL', 'XXL'],
    colors: [{ name: 'White', hex: '#FFFFFF' }, { name: 'Blue', hex: '#4A90D9' }],
    stock: 50,
    ratings: { average: 4.5, count: 128 },
    featured: true,
    tags: ['shirt', 'formal', 'office', 'cotton']
  },
  {
    name: 'Distressed Denim Jacket',
    description: 'Vintage-inspired distressed denim jacket with a relaxed fit. Washed finish with subtle fading for an authentic worn-in look.',
    price: 2499,
    mrp: 4999,
    category: 'Men',
    brand: 'UrbanEdge',
    images: ['https://images.unsplash.com/photo-1551028719-00167b16eac5?w=500'],
    sizes: ['S', 'M', 'L', 'XL'],
    colors: [{ name: 'Blue', hex: '#4169E1' }],
    stock: 30,
    ratings: { average: 4.3, count: 89 },
    featured: true,
    tags: ['jacket', 'denim', 'casual', 'winter']
  },
  {
    name: 'Floral Print Maxi Dress',
    description: 'Elegant floral print maxi dress with flowing silhouette. Features V-neck, adjustable waist tie, and soft viscose fabric.',
    price: 1899,
    mrp: 3499,
    category: 'Women',
    brand: 'Aurelia',
    images: ['https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=500'],
    sizes: ['XS', 'S', 'M', 'L', 'XL'],
    colors: [{ name: 'Pink', hex: '#FF69B4' }, { name: 'Yellow', hex: '#FFD700' }],
    stock: 40,
    ratings: { average: 4.7, count: 215 },
    featured: true,
    tags: ['dress', 'floral', 'party', 'summer']
  },
  {
    name: 'High-Rise Skinny Jeans',
    description: 'Flattering high-rise skinny jeans with stretch denim. Classic 5-pocket styling with a modern silhouette.',
    price: 1599,
    mrp: 2999,
    category: 'Women',
    brand: 'DenimCo',
    images: ['https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=500'],
    sizes: ['XS', 'S', 'M', 'L', 'XL'],
    colors: [{ name: 'Dark Blue', hex: '#1B3A5C' }, { name: 'Black', hex: '#000000' }],
    stock: 60,
    ratings: { average: 4.4, count: 176 },
    featured: false,
    tags: ['jeans', 'skinny', 'casual', 'denim']
  },
  {
    name: 'Embroidered Anarkali Kurta Set',
    description: 'Beautiful embroidered anarkali kurta with matching dupatta and palazzo. Ideal for festivals and celebrations.',
    price: 2799,
    mrp: 5499,
    category: 'Ethnic',
    brand: 'Rangoli',
    images: ['https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=500'],
    sizes: ['S', 'M', 'L', 'XL', 'XXL'],
    colors: [{ name: 'Maroon', hex: '#800000' }, { name: 'Navy', hex: '#000080' }],
    stock: 25,
    ratings: { average: 4.8, count: 312 },
    featured: true,
    tags: ['kurta', 'ethnic', 'festival', 'traditional']
  },
  {
    name: 'Performance Running Sneakers',
    description: 'Lightweight performance running shoes with responsive cushioning. Breathable mesh upper and durable rubber outsole.',
    price: 3499,
    mrp: 5999,
    category: 'Footwear',
    brand: 'StridePro',
    images: ['https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500'],
    sizes: ['7', '8', '9', '10', '11'],
    colors: [{ name: 'Red', hex: '#FF0000' }, { name: 'Black', hex: '#000000' }],
    stock: 45,
    ratings: { average: 4.6, count: 198 },
    featured: true,
    tags: ['shoes', 'running', 'sports', 'sneakers']
  },
  {
    name: 'Leather Crossbody Bag',
    description: 'Genuine leather crossbody bag with adjustable strap. Multiple compartments for organized storage. Gold-tone hardware.',
    price: 1999,
    mrp: 3999,
    category: 'Accessories',
    brand: 'BagCraft',
    images: ['https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=500'],
    sizes: ['Free Size'],
    colors: [{ name: 'Brown', hex: '#8B4513' }, { name: 'Black', hex: '#000000' }],
    stock: 35,
    ratings: { average: 4.5, count: 143 },
    featured: false,
    tags: ['bag', 'leather', 'crossbody', 'accessories']
  },
  {
    name: 'Kids Cartoon Print T-Shirt Pack',
    description: 'Pack of 3 fun cartoon print t-shirts for kids. Made with 100% cotton for comfort. Vibrant colors that stay bright after washing.',
    price: 799,
    mrp: 1499,
    category: 'Kids',
    brand: 'TinyTrends',
    images: ['https://images.unsplash.com/photo-1519238263530-99bdd11df2ea?w=500'],
    sizes: ['2-3Y', '4-5Y', '6-7Y', '8-9Y'],
    colors: [{ name: 'Multi', hex: '#FF6347' }],
    stock: 100,
    ratings: { average: 4.3, count: 87 },
    featured: false,
    tags: ['kids', 'tshirt', 'cotton', 'casual']
  },
  {
    name: 'Quilted Puffer Jacket',
    description: 'Warm quilted puffer jacket with hood. Water-resistant outer shell with synthetic fill. Perfect for cold weather.',
    price: 3999,
    mrp: 6999,
    category: 'Winterwear',
    brand: 'AlpineWear',
    images: ['https://images.unsplash.com/photo-1539533018447-63fcce2678e3?w=500'],
    sizes: ['S', 'M', 'L', 'XL'],
    colors: [{ name: 'Black', hex: '#000000' }, { name: 'Olive', hex: '#556B2F' }],
    stock: 20,
    ratings: { average: 4.6, count: 94 },
    featured: true,
    tags: ['jacket', 'puffer', 'winter', 'warm']
  },
  {
    name: 'Dry-Fit Sports Track Pants',
    description: 'Moisture-wicking dry-fit track pants with zipper pockets. Elastic waistband with drawstring. Ideal for gym and jogging.',
    price: 999,
    mrp: 1999,
    category: 'Activewear',
    brand: 'FitGear',
    images: ['https://images.unsplash.com/photo-1506629082955-511b1aa562c8?w=500'],
    sizes: ['S', 'M', 'L', 'XL', 'XXL'],
    colors: [{ name: 'Black', hex: '#000000' }, { name: 'Grey', hex: '#808080' }],
    stock: 70,
    ratings: { average: 4.2, count: 156 },
    featured: false,
    tags: ['trackpants', 'gym', 'sports', 'activewear']
  },
  {
    name: 'Printed Chiffon Saree',
    description: 'Elegant printed chiffon saree with contrast border. Comes with matching blouse piece. Light weight and easy to drape.',
    price: 1499,
    mrp: 2999,
    category: 'Ethnic',
    brand: 'SilkRoute',
    images: ['https://images.unsplash.com/photo-1583391733956-6c78276477e2?w=500'],
    sizes: ['Free Size'],
    colors: [{ name: 'Red', hex: '#DC143C' }, { name: 'Green', hex: '#228B22' }],
    stock: 30,
    ratings: { average: 4.4, count: 203 },
    featured: false,
    tags: ['saree', 'chiffon', 'ethnic', 'traditional']
  },
  {
    name: 'Polarized Aviator Sunglasses',
    description: 'Classic aviator sunglasses with polarized lenses. UV400 protection. Lightweight metal frame with spring hinges.',
    price: 1299,
    mrp: 2499,
    category: 'Accessories',
    brand: 'ShadeCraft',
    images: ['https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=500'],
    sizes: ['Free Size'],
    colors: [{ name: 'Gold', hex: '#FFD700' }, { name: 'Silver', hex: '#C0C0C0' }],
    stock: 55,
    ratings: { average: 4.1, count: 167 },
    featured: true,
    tags: ['sunglasses', 'aviator', 'accessories', 'summer']
  },
  {
    name: 'Cotton Polo T-Shirt',
    description: 'Classic cotton polo with ribbed collar and cuffs. Pique knit fabric for breathability. Embroidered logo on chest.',
    price: 899,
    mrp: 1699,
    category: 'Men',
    brand: 'LUXORA Essentials',
    images: ['https://images.unsplash.com/photo-1625910513413-5fc9b3aca36e?w=500'],
    sizes: ['S', 'M', 'L', 'XL', 'XXL'],
    colors: [{ name: 'Navy', hex: '#000080' }, { name: 'White', hex: '#FFFFFF' }, { name: 'Red', hex: '#DC143C' }],
    stock: 80,
    ratings: { average: 4.3, count: 234 },
    featured: false,
    tags: ['polo', 'tshirt', 'casual', 'cotton']
  },
  {
    name: 'Block Heel Sandals',
    description: 'Trendy block heel sandals with ankle strap. Padded footbed for comfort. Perfect for parties and casual outings.',
    price: 1799,
    mrp: 2999,
    category: 'Footwear',
    brand: 'SoleMate',
    images: ['https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=500'],
    sizes: ['6', '7', '8', '9'],
    colors: [{ name: 'Beige', hex: '#F5DEB3' }, { name: 'Black', hex: '#000000' }],
    stock: 30,
    ratings: { average: 4.0, count: 78 },
    featured: false,
    tags: ['sandals', 'heels', 'party', 'footwear']
  },
  {
    name: 'Oversized Graphic Hoodie',
    description: 'Trendy oversized hoodie with street-style graphic print. Soft fleece lining with kangaroo pocket and adjustable hood.',
    price: 1699,
    mrp: 2999,
    category: 'Men',
    brand: 'UrbanEdge',
    images: ['https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=500'],
    sizes: ['S', 'M', 'L', 'XL'],
    colors: [{ name: 'Black', hex: '#000000' }, { name: 'Grey', hex: '#808080' }],
    stock: 40,
    ratings: { average: 4.7, count: 289 },
    featured: true,
    tags: ['hoodie', 'streetwear', 'oversized', 'winter']
  }
];

const seedDatabase = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('MongoDB Connected for seeding...');

    // Clear existing data
    await Product.deleteMany({});
    await User.deleteMany({});

    // Create admin user
    const adminUser = await User.create({
      name: 'Admin',
      email: 'admin@luxora.com',
      password: 'admin123',
      role: 'admin'
    });

    // Create demo user
    const demoUser = await User.create({
      name: 'Sagar',
      email: 'sagar@luxora.com',
      password: 'demo123',
      role: 'user'
    });

    // Insert products
    await Product.insertMany(products);

    console.log('✅ Database seeded successfully!');
    console.log('─────────────────────────────────');
    console.log('Admin Login:  admin@luxora.com / admin123');
    console.log('User Login:   sagar@luxora.com / demo123');
    console.log('Products:     ' + products.length + ' items added');
    console.log('─────────────────────────────────');

    process.exit(0);
  } catch (error) {
    console.error('Seeding Error:', error.message);
    process.exit(1);
  }
};

seedDatabase();
