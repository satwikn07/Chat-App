const { DataTypes } = require('sequelize');
const { sequelize } = require('../utils/db');

const Chat = sequelize.define('Chat', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  isGroupChat: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  name: {
    type: DataTypes.STRING,
    allowNull: true // only required for group chats
  },
  latestMessageId: {
    type: DataTypes.INTEGER,
    allowNull: true
  }
}, {
  timestamps: true
});

// const Message = require('./Message'); // adjust path as needed

// Chat.belongsTo(Message, { as: 'latestMessage', foreignKey: 'latestMessageId' });
module.exports = Chat;