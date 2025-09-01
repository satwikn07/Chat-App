const User = require('./userModel');
const Chat = require('./chatModel');
const Message = require('./messageModel');
const ChatUser = require('./chatuserModel');

// One-to-Many: one Chat has many Messages but one Message belongs to one Chat 
Chat.hasMany(Message, { foreignKey: 'chatId' });
Message.belongsTo(Chat, { foreignKey: 'chatId' });

// One-to-Many: User has many Messages but Message belongs to one User
User.hasMany(Message, { foreignKey: 'senderId' });
Message.belongsTo(User, { as:"sender", foreignKey: 'senderId' });

// Many-to-Many: One chat(conversation) can have many users and one user can be part of many chats(conversations)
User.belongsToMany(Chat, { through: ChatUser, foreignKey: 'userId' });
Chat.belongsToMany(User, { through: ChatUser, foreignKey: 'chatId' });

// One-to-One : Chat has one latestMessage
Chat.belongsTo(Message, { as: 'latestMessage', foreignKey: 'latestMessageId' });
Message.hasOne(Chat, { as: 'latestInChat', foreignKey: 'latestMessageId' });

module.exports = {User, Chat, Message, ChatUser};