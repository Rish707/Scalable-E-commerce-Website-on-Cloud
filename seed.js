const db = require('./db');
const Product = require('./models/Product');
require('dotenv').config();

const sampleProducts = [
  {
    name: 'Wireless Noise-Cancelling Headphones',
    description: 'Premium over-ear headphones with 40-hour battery life, active noise cancellation, and crystal-clear audio. Perfect for music lovers and remote workers.',
    price: 79.99,
    category: 'Electronics',
    image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&q=80',
    stock: 50,
    rating: 4.7,
    reviews: 312,
  },
  {
    name: 'Mechanical Gaming Keyboard',
    description: 'RGB backlit mechanical keyboard with tactile switches, programmable macros, and aircraft-grade aluminum chassis.',
    price: 59.99,
    category: 'Electronics',
    image: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=400&q=80',
    stock: 75,
    rating: 4.5,
    reviews: 198,
  },
  {
    name: 'Slim Fit Cotton T-Shirt',
    description: '100% organic cotton premium slim-fit t-shirt. Breathable, lightweight, and available in 12 colors.',
    price: 19.99,
    category: 'Clothing',
    image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400&q=80',
    stock: 200,
    rating: 4.3,
    reviews: 540,
  },
  {
    name: 'JavaScript: The Good Parts',
    description: 'A deep dive into the most elegant and useful parts of JavaScript, by Douglas Crockford.',
    price: 24.99,
    category: 'Books',
    image: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=400&q=80',
    stock: 150,
    rating: 4.8,
    reviews: 870,
  },
  {
    name: 'Smart LED Desk Lamp',
    description: 'Touch-controlled smart desk lamp with adjustable brightness, color temperature, USB charging port, and eye-care mode.',
    price: 34.99,
    category: 'Home',
    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&q=80',
    stock: 90,
    rating: 4.4,
    reviews: 223,
  },
  {
    name: 'Yoga Mat Pro',
    description: 'Non-slip premium yoga mat with alignment lines, extra thickness for joint support, and eco-friendly TPE material.',
    price: 44.99,
    category: 'Sports',
    image: 'https://images.unsplash.com/photo-1601925260368-ae2f83cf8b7f?w=400&q=80',
    stock: 120,
    rating: 4.6,
    reviews: 415,
  },
  {
    name: 'Vitamin C Face Serum',
    description: '20% Vitamin C brightening serum with hyaluronic acid and vitamin E. Reduces dark spots and boosts collagen production.',
    price: 29.99,
    category: 'Beauty',
    image: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=400&q=80',
    stock: 180,
    rating: 4.5,
    reviews: 632,
  },
  {
    name: '4K Webcam with Mic',
    description: 'Ultra HD 4K webcam with built-in noise-canceling microphone, auto light correction, and plug-and-play USB-C setup.',
    price: 89.99,
    category: 'Electronics',
    image: 'https://images.unsplash.com/photo-1611532736597-de2d4265fba3?w=400&q=80',
    stock: 60,
    rating: 4.6,
    reviews: 289,
  },
  {
    name: 'Running Shoes – AirFlex',
    description: 'Lightweight breathable running shoes with responsive cushioning, flexible sole, and reflective strips for night runs.',
    price: 69.99,
    category: 'Sports',
    image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&q=80',
    stock: 110,
    rating: 4.4,
    reviews: 378,
  },
  {
    name: 'Minimalist Leather Watch',
    description: 'Classic stainless steel case with genuine leather strap. Water-resistant to 30m. Timeless design for everyday wear.',
    price: 119.99,
    category: 'Clothing',
    image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&q=80',
    stock: 40,
    rating: 4.9,
    reviews: 156,
  },
  {
    name: 'Clean Code by Robert C. Martin',
    description: 'A handbook of agile software craftsmanship — essential reading for every software developer.',
    price: 32.99,
    category: 'Books',
    image: 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=400&q=80',
    stock: 130,
    rating: 4.9,
    reviews: 1024,
  },
  {
    name: 'Air Purifier – HEPAClean 500',
    description: 'True HEPA air purifier covering up to 500 sq ft. Removes 99.97% of allergens, dust, smoke, and pet dander.',
    price: 129.99,
    category: 'Home',
    image: 'https://images.unsplash.com/photo-1585771724684-38269d6639fd?w=400&q=80',
    stock: 35,
    rating: 4.7,
    reviews: 202,
  },
];

const seed = () => {
  try {
    console.log('🌱 Starting database seeding...');

    // Clear existing products
    db.run('DELETE FROM products', (err) => {
      if (err) {
        console.error('❌ Error clearing products:', err.message);
        process.exit(1);
      }

      console.log('✅ Cleared existing products.');

      // Insert all products
      let inserted = 0;
      const insertProduct = (index) => {
        if (index >= sampleProducts.length) {
          console.log(`✅ Seeded ${inserted} products successfully!`);
          db.close(() => {
            console.log('✅ Database connection closed.');
            process.exit(0);
          });
          return;
        }

        const product = sampleProducts[index];
        Product.create(product, (err) => {
          if (err) {
            console.error(`❌ Error inserting product "${product.name}":`, err.message);
          } else {
            inserted++;
            console.log(`  ✓ ${product.name}`);
          }
          insertProduct(index + 1);
        });
      };

      insertProduct(0);
    });
  } catch (err) {
    console.error('❌ Seeding failed:', err.message);
    process.exit(1);
  }
};

seed();
