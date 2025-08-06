const { DataTypes } = require('sequelize');
const { sequelize } = require('../utils/db');

const Message = sequelize.define('Message', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  senderId: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  chatId: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  content: {
    type: DataTypes.STRING,
    allowNull: false
  }
}, {
  timestamps: true
});

module.exports = Message;