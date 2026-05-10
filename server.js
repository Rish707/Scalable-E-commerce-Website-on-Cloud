require('dotenv').config();
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const path = require('path');
const db = require('./db');

// Route imports
const authRoutes = require('./routes/auth');
const productRoutes = require('./routes/products');
const cartRoutes = require('./routes/cart');

const app = express();
const PORT = process.env.PORT || 5000;

// ─── Middleware ───────────────────────────────────────────────────────────────
app.use(cors({
  origin: '*', // In production: restrict to your CloudFront/domain URL
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.use(express.json());
app.use(morgan('dev'));

// ─── Serve Frontend Static Files ──────────────────────────────────────────────
app.use(express.static(path.join(__dirname, '../frontend/pages')));
app.use('/css', express.static(path.join(__dirname, '../frontend/css')));
app.use('/js', express.static(path.join(__dirname, '../frontend/js')));
app.use('/assets', express.static(path.join(__dirname, '../frontend/assets')));

// ─── Health Check (for AWS Load Balancer health checks) ───────────────────────
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    server: 'ShopWave API',
    timestamp: new Date().toISOString(),
    uptime: `${Math.floor(process.uptime())}s`,
  });
});

// ─── API Routes ───────────────────────────────────────────────────────────────
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/cart', cartRoutes);

// ─── Root Route ───────────────────────────────────────────────────────────────
app.get('/', (req, res) => {
  res.json({ message: 'Welcome to ShopWave API v1.0', docs: '/health' });
});

// ─── 404 Handler ─────────────────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ success: false, message: 'Route not found.' });
});

// ─── Global Error Handler ─────────────────────────────────────────────────────
app.use((err, req, res, next) => {
  console.error('Unhandled Error:', err.stack);
  res.status(500).json({ success: false, message: 'Internal server error.' });
});

// ─── Database + Server Start ─────────────────────────────────────────────────
const startServer = (port = Number(process.env.PORT) || 5000) => {
  console.log('✅ SQLite database initialized');

  const server = app.listen(port, '0.0.0.0', () => {
    console.log(`🚀 ShopWave API running on port ${port}`);
    console.log(`   Environment : ${process.env.NODE_ENV || 'development'}`);
    console.log(`   Health Check: http://localhost:${port}/health`);
  });

  server.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      console.error(`❌ Port ${port} is already in use. Please stop the service using this port or set a different PORT environment variable.`);
      if (port === 5000) {
        const fallbackPort = 5001;
        console.log(`🔁 Attempting fallback port ${fallbackPort}...`);
        startServer(fallbackPort);
      } else {
        process.exit(1);
      }
    } else {
      console.error('❌ Failed to start server:', err.message);
      process.exit(1);
    }
  });
};

startServer();
