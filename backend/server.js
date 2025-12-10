const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const compression = require('compression');
const morgan = require('morgan');
require('dotenv').config();

const readingsRouter = require('./routes/readings');
const healthRouter = require('./routes/health');
const { connectDB, getSequelize } = require('./config/database');
const { initReading } = require('./models/Reading');

const app = express();
const PORT = process.env.PORT || 3000;

// Configure trust proxy for production environments (Kubernetes, load balancers)
if (process.env.NODE_ENV === 'production') {
  app.set('trust proxy', 1); // Trust first proxy (load balancer)
}

// Connect to database and initialize models
const initializeApp = async () => {
  const sequelize = await connectDB();
  if (sequelize) {
    app.set('sequelize', sequelize);
    await initReading(sequelize);
    console.log('📊 Database models initialized');
  } else {
    console.log('⚠️  Database not available, skipping model initialization');
  }
};

initializeApp().catch(console.error);

// Security middleware
app.use(helmet());
app.use(compression());

// CORS configuration for Cloudflare Pages
const corsOptions = {
  origin: [
    'http://localhost:3000',
    'http://localhost:8080',
    'https://mysticstars.pages.dev',
    'https://mysticstars.app',
    process.env.FRONTEND_URL
  ].filter(Boolean),
  credentials: true,
  optionsSuccessStatus: 200
};

app.use(cors(corsOptions));

// Rate limiting with whitelist for health checks and localhost
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: {
    error: 'Too many requests from this IP, please try again later.',
    retryAfter: '15 minutes'
  },
  skip: (req, res) => {
    // Skip rate limiting for Kubernetes probes (User-Agent based detection)
    const userAgent = req.get('User-Agent') || '';
    if (userAgent.includes('kube-probe')) {
      return true;
    }
    
    // Skip rate limiting for health check endpoints (fallback for any health checks)
    if (req.path.startsWith('/api/health')) {
      return true;
    }
    
    // Skip rate limiting for localhost requests
    const clientIP = req.ip || req.connection.remoteAddress || req.socket.remoteAddress;
    if (clientIP === '127.0.0.1' || clientIP === '::1' || clientIP === '::ffff:127.0.0.1') {
      return true;
    }
    
    return false; // Apply rate limiting for all other requests
  }
});

app.use(limiter);

// Logging
app.use(morgan('combined'));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/health', healthRouter);
app.use('/api/readings', readingsRouter);

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    message: 'MysticStars API',
    version: '1.0.0',
    endpoints: {
      health: '/api/health',
      readings: '/api/readings/:sign/:type',
      allReadings: '/api/readings/:sign',
      status: '/api/readings/status'
    }
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err.stack);
  res.status(500).json({
    error: 'Something went wrong!',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Endpoint not found',
    availableEndpoints: [
      '/api/health',
      '/api/readings/:sign/:type',
      '/api/readings/:sign',
      '/api/readings/status'
    ]
  });
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('SIGINT received, shutting down gracefully');
  process.exit(0);
});

app.listen(PORT, () => {
  console.log(`🌟 MysticStars API server running on port ${PORT}`);
  console.log(`🔗 API available at: http://localhost:${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/api/health`);
});