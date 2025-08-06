const { DataTypes } = require('sequelize');
const { sequelize } = require('../utils/db');


const ChatUser = sequelize.define('ChatUsers', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  chatId: {
    type: DataTypes.INTEGER,
    allowNull: false
  }
}, {
  timestamps: true
});

module.exports = ChatUser;