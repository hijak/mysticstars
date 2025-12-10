const express = require('express');
const { Sequelize } = require('sequelize');
const { getSequelize } = require('../config/database');

const router = express.Router();

// GET /api/health - Basic health check
router.get('/', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    service: 'enchanted-zodiac-api',
    version: '1.0.0'
  });
});

// GET /api/health/live - Kubernetes liveness probe
router.get('/live', (req, res) => {
  // Simple liveness check - if we can respond, we're alive
  res.status(200).json({
    status: 'alive',
    timestamp: new Date().toISOString()
  });
});

// GET /api/health/ready - Kubernetes readiness probe
router.get('/ready', async (req, res) => {
  try {
    // Check database connection
    let dbStatus = 'disconnected';
    let dbLatency = null;
    
    // Get sequelize instance from app context or fallback to direct getter
    const sequelize = req.app.get('sequelize') || getSequelize();
    
    if (sequelize) {
      try {
        const start = Date.now();
        await sequelize.authenticate();
        dbLatency = Date.now() - start;
        dbStatus = 'connected';
      } catch (dbError) {
        dbStatus = 'error';
      }
    }

    const isReady = dbStatus === 'connected';

    res.status(isReady ? 200 : 503).json({
      status: isReady ? 'ready' : 'not-ready',
      timestamp: new Date().toISOString(),
      checks: {
        database: {
          status: dbStatus,
          latency: dbLatency
        }
      }
    });
  } catch (error) {
    console.error('Readiness check failed:', error);
    res.status(503).json({
      status: 'not-ready',
      timestamp: new Date().toISOString(),
      error: error.message,
      checks: {
        database: {
          status: 'error',
          error: error.message
        }
      }
    });
  }
});

// GET /api/health/detailed - Comprehensive health status
router.get('/detailed', async (req, res) => {
  try {
    const healthData = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      service: 'enchanted-zodiac-api',
      version: '1.0.0',
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      environment: process.env.NODE_ENV || 'development'
    };

    // Database health
    let dbHealth = {
      status: 'disconnected',
      type: 'PostgreSQL'
    };

    const sequelize = req.app.get('sequelize') || getSequelize();
    if (sequelize) {
      try {
        const start = Date.now();
        await sequelize.authenticate();
        const dbConfig = sequelize.config;
        dbHealth = {
          ...dbHealth,
          status: 'healthy',
          latency: Date.now() - start,
          host: dbConfig.host,
          port: dbConfig.port,
          database: dbConfig.database,
          dialect: dbConfig.dialect
        };
      } catch (dbError) {
        dbHealth = {
          ...dbHealth,
          status: 'error',
          error: dbError.message
        };
      }
    }

    healthData.database = dbHealth;

    // Overall health determination
    const isHealthy = dbHealth.status === 'healthy';
    healthData.status = isHealthy ? 'healthy' : 'degraded';

    res.status(isHealthy ? 200 : 503).json(healthData);
  } catch (error) {
    console.error('Detailed health check failed:', error);
    res.status(500).json({
      status: 'error',
      timestamp: new Date().toISOString(),
      error: error.message
    });
  }
});

module.exports = router;