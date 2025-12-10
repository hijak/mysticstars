const { Sequelize } = require('sequelize');

let sequelize = null;

const connectDB = async () => {
  try {
    const postgresURI = process.env.POSTGRES_URI || 'postgresql://admin:my5ticstars!!-~2024@psql-postgresql.psql:5432/mysticstars';
    
    sequelize = new Sequelize(postgresURI, {
      dialect: 'postgres',
      logging: process.env.NODE_ENV === 'development' ? console.log : false,
      pool: {
        max: 10,
        min: 0,
        acquire: 30000,
        idle: 10000
      }
    });

    await sequelize.authenticate();
    console.log('🐘 PostgreSQL Connected successfully');

    // Graceful shutdown
    process.on('SIGINT', async () => {
      await sequelize.close();
      console.log('📴 PostgreSQL connection closed through app termination');
      process.exit(0);
    });

    return sequelize;

  } catch (error) {
    console.error('❌ Error connecting to PostgreSQL:', error.message);
    
    // In development, continue without DB for testing
    if (process.env.NODE_ENV === 'development') {
      console.log('⚠️  Continuing in development mode without database');
      return;
    }
    
    process.exit(1);
  }
};

const getSequelize = () => sequelize;

module.exports = { connectDB, getSequelize };