const path = require('path');
const dotenv = require('dotenv');
dotenv.config({ path: path.resolve(__dirname, '../.env') });
const { Sequelize } = require('sequelize');

const databaseUrl = process.env.DATABASE_URL;

let sequelize;

if (databaseUrl) {
  sequelize = new Sequelize(databaseUrl, {
    dialect: 'postgres',
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false,
      },
    },
    logging: false,
    pool: {
      max: 10,
      min: 0,
      acquire: 30000,
      idle: 10000,
    },
  });
} else {
  sequelize = new Sequelize(
    process.env.DB_NAME || 'postgres',
    process.env.DB_USER || 'postgres',
    process.env.DB_PASSWORD || '',
    {
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '5432', 10),
      dialect: 'postgres',
      dialectOptions: {
        ssl: {
          require: true,
          rejectUnauthorized: false,
        },
      },
      logging: false,
      pool: {
        max: 10,
        min: 0,
        acquire: 30000,
        idle: 10000,
      },
    }
  );
}

const connectDB = async () => {
  try {
    await sequelize.authenticate();
    console.log(`[Database] ✅ PostgreSQL Connected to Supabase: ${sequelize.config.host || 'Supabase DB'}`);
    
    // Auto-sync models to create tables in Supabase database
    await sequelize.sync({ alter: true });
    console.log(`[Database] ✅ Models synchronized successfully with Supabase PostgreSQL.`);
  } catch (error) {
    console.error(`[Database Error] Failed to connect to PostgreSQL: ${error.message}`);
    process.exit(1);
  }
};

const disconnectDB = async () => {
  try {
    await sequelize.close();
    console.log('[Database] PostgreSQL Connection closed.');
  } catch (error) {
    console.error('Error disconnecting PostgreSQL DB:', error);
  }
};

module.exports = { sequelize, connectDB, disconnectDB };

