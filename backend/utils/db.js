const { Sequelize } = require('sequelize');

// const sequelize = new Sequelize('ChatApp', 'postgres', 'superuser07', {
//   host: 'localhost',
//   dialect: 'postgres',
//    logging: false
// });
const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST || 'localhost',
    dialect: 'postgres',
    logging: false,
  }
);

const connectDB = async () => {
  try {
    await sequelize.authenticate();
    console.log('Database connected');
    await sequelize.sync({ alter: true });
    console.log('✅ Models synced');
  } catch (error) {
    console.error('Unable to connect to DB:', error);
  }
};

module.exports = { sequelize, connectDB };
