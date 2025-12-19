const { Sequelize } = require('sequelize');

let sequelize = null;

const connectDB = async (retries = 5, delay = 5000) => {
  const postgresURI = process.env.POSTGRES_URI || 'postgresql://admin:my5ticstars!!-~2024@psql-postgresql.psql:5432/mysticstars';

  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      console.log(`🔌 Attempting to connect to PostgreSQL (attempt ${attempt}/${retries})...`);

      sequelize = new Sequelize(postgresURI, {
        dialect: 'postgres',
        logging: process.env.NODE_ENV === 'development' ? console.log : false,
        pool: {
          max: 10,
          min: 0,
          acquire: 30000,
          idle: 10000,
          // Retry configuration for the pool
          evict: 1000,
        },
        // Add retry logic for dialect operations
        retry: {
          max: 3,
          timeout: 5000,
        },
        // Connection timeout
        dialectOptions: {
          connect_timeout: 10000,
        }
      });

      await sequelize.authenticate();
      console.log('🐘 PostgreSQL Connected successfully');
      console.log(`📍 Connected to: ${postgresURI.replace(/\/\/.*@/, '//***:***@')}`); // Hide credentials in log

      // Graceful shutdown
      process.on('SIGINT', async () => {
        await sequelize.close();
        console.log('📴 PostgreSQL connection closed through app termination');
        process.exit(0);
      });

      return sequelize;

    } catch (error) {
      console.error(`❌ Error connecting to PostgreSQL (attempt ${attempt}/${retries}):`, error.message);

      // If this is the last attempt, handle gracefully
      if (attempt === retries) {
        console.error('💥 All connection attempts failed');

        // In development, continue without DB for testing
        if (process.env.NODE_ENV === 'development') {
          console.log('⚠️  Continuing in development mode without database');
          return;
        }

        // In production, exit with error
        process.exit(1);
      }

      // Wait before retrying (with exponential backoff)
      const waitTime = delay * Math.pow(2, attempt - 1);
      console.log(`⏳ Waiting ${waitTime/1000} seconds before retry...`);
      await new Promise(resolve => setTimeout(resolve, waitTime));
    }
  }
};

const getSequelize = () => sequelize;

module.exports = { connectDB, getSequelize };