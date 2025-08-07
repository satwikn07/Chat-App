const { DataTypes } = require('sequelize');
const { sequelize } = require('../utils/db');


const ChatUser = sequelize.define('ChatUsers', {
  userId: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    allowNull: false
  },
  chatId: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    allowNull: false
  }
}, {
  timestamps: true,
  tableName: 'ChatUsers' // Explicitly set the table name
});

module.exports = ChatUser;