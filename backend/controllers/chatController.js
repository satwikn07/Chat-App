const {Chat, ChatUser, User, Message} = require('../models/associations');
const { Sequelize } = require('sequelize');
const { sequelize } = require('../utils/db'); 
const {Op}  = require('sequelize'); // to use in filtering

const createChat = async (req, res) => { // to handle POST /Chat
    const { userIds, name } = req.body; // userIds is an array of user IDs to be added to the chat, name is optional for group chats
    const loggedInUserId = req.user.id; // ID of the sender extracted from the decoded JWT by auth middleware

    if (!userIds || !Array.isArray(userIds) || userIds.length === 0) { // to ensure that userrIds is a non-empty array
    return res.status(400).json({ error: 'userIds must be a non-empty array' }); }
    if (name && typeof name !== 'string') { // to ensure that name is a string if provided
        return res.status(400).json({ error: 'name must be a string' });
    }
    try{
    if(userIds.length === 1){ // it is the case of a one-to-one chat
        const targetUserId = userIds[0];
        if (!targetUserId || typeof targetUserId !== 'number') { // to ensure that targetUserId is a number
            return res.status(400).json({ error: 'targetUserId must be a number' });
        }
        if (targetUserId === loggedInUserId) {
            return res.status(400).json({ error: 'Cannot create a chat with yourself' });
        }
        console.log('Logged in user ID:', loggedInUserId, 'Target user ID:', targetUserId);
        
        // Check if a chat already exists with this user
       const chatsWithBothUsers = await ChatUser.findAll({
            where: {
            userId: [loggedInUserId, targetUserId],},
            attributes: ['chatId'],
            group: ['chatId'],
            having: Sequelize.literal('COUNT(DISTINCT "userId") = 2')
        });
        const chatIdMatch = chatsWithBothUsers[0]?.chatId;

        if (chatIdMatch) {
            const existingChat = await Chat.findByPk(chatIdMatch, {
            include: [{ model: User, through: { attributes: [] } }],
            });

            return res.status(200).json({msg:'Chat Already exists',existingChat});
        }
        const newChat = await Chat.create({ isGroupChat: false }); // add a new row in the table:Chat
        await ChatUser.bulkCreate([  //Creates two rows in ChatUser table, one for each user
            { userId: loggedInUserId, chatId: newChat.id },
            {userId : targetUserId, chatId: newChat.id}
        ]);
         const fullChat = await Chat.findByPk( //Fetches full chat details including the users inside it.
            newChat.id,
            {
                include: [{ model: User, through: { attributes: [] } }]
            }
        );
        return res.status(201).json(fullChat); // Return the newly created chat
    }else{ // it is the case of a group chat
        if (userIds.includes(loggedInUserId)) {
            return res.status(400).json({ error: 'You cannot create a group chat with yourself' });
        }
        if (!name || name.trim() === '') {
            return res.status(400).json({ error: 'Group chat must have a name' });
        }
        const newChat = await Chat.create({
                isGroupChat: true,
                name: name.trim()
        });
        const participants = userIds.map(uid => ({ userId: uid, chatId: newChat.id }));
        participants.push({ userId: loggedInUserId, chatId: newChat.id });

        await ChatUser.bulkCreate(participants);
        const fullChat = await Chat.findByPk(newChat.id, {
            include: [{ model: User, through: { attributes: [] } }]
        });
        return res.status(201).json(fullChat);
    }} catch (error) {
        console.error('Error creating chat:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
};

// 2. GET /chat/:chatId
const getChatDetails = async (req, res) => {
  const { chatId } = req.params;

  try {
    const chat = await Chat.findByPk(chatId, {
      include: [ //eager loading related models
        {
          model: User,
          attributes: ['id', 'name', 'email'],
          through: { attributes: [] } // hide ChatUser join table
        },
        {
          model: Message,
          as: 'latestMessage',
          attributes: ['id', 'content', 'senderId', 'createdAt'],
        }
      ]
    });

    if (!chat) return res.status(404).json({ message: 'Chat not found' });

    // Check if user is part of chat
    const isParticipant = chat.Users.some(user => user.id === req.user.id);
    if (!isParticipant)
      return res.status(403).json({ message: 'You are not a participant in this chat' });

    res.json({
      id: chat.id,
      name: chat.name,
      isGroupChat: chat.isGroupChat,
      participants: chat.Users,
      createdBy: chat.creator,
      latestMessage: chat.latestMessage,
      createdAt: chat.createdAt,
      updatedAt: chat.updatedAt
    });
  } catch (err) {
    console.error('Error in getChatDetails:', err);
    res.status(500).json({ message: 'Server error' });
  }
};


// 3. GET /user/chats
const getUserChats = async (req, res) => {
  try {
    // 1) Get chatIds from pivot table where this user is present
    const chatUserRows = await ChatUser.findAll({
      where: { userId: req.user.id },
      attributes: ['chatId']
    });

    const chatIds = chatUserRows.map(r => r.chatId);

    // If user is not in any chat, return empty array early
    if (!chatIds.length) return res.json([]);

    // 2) Fetch chats by those IDs and include full participant lists + latest message
    const chats = await Chat.findAll({
      where: { id: chatIds },
      include: [
        {
          model: User,
          attributes: ['id', 'name', 'email'],
          through: { attributes: [] } // hide ChatUser metadata
        },
        {
          model: Message,
          as: 'latestMessage',
          attributes: ['id', 'content', 'createdAt', 'senderId']
        }
      ],
      order: [['updatedAt', 'DESC']]
    });

    // 3) Format response
    const formatted = chats.map(chat => ({
      id: chat.id,
      name: chat.name,
      isGroupChat: chat.isGroupChat,
      participants: chat.Users,          // full list of participants
      createdBy: chat.createdBy || null, // raw column (no creator association)
      latestMessage: chat.latestMessage || null,
      updatedAt: chat.updatedAt
    }));

    res.json(formatted);
  } catch (err) {
    console.error('Error in getUserChats:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

const renameGroupChat = async (req, res) => {
  const { chatId } = req.params;
  const { name } = req.body;
  console.log('Renaming group chat:', chatId, 'to name:', name);
  if (!name || typeof name !== 'string') {
    return res.status(400).json({ error: 'Name must be a non-empty string' });
  }

  try {
    const chat = await Chat.findByPk(chatId);
    if (!chat) return res.status(404).json({ message: 'Chat not found' });

    if (!chat.isGroupChat) {
      return res.status(400).json({ error: 'Only group chats can be renamed' });
    }

    //check if the user is part of the group chat
    const isParticipant = await ChatUser.findOne({
      where:{chatId, userId: req.user.id},
    });
    if (!isParticipant) {
      return res.status(403).json({ message: 'You are not a participant in this chat' });
    }

    await chat.update({ name: name.trim() });

    const updatedChat = await Chat.findByPk(chatId, {
      include: [
        {
          model: User,
          as: 'Users',
          attributes: ['id', 'name', 'email'],
          through: { attributes: [] }
        },
        {
          model: Message,
          as: 'latestMessage',
          attributes: ['id', 'content', 'createdAt', 'senderId']
        }
      ]
    });

    res.json({ message: 'Chat renamed successfully', updatedChat });
  } catch (error) {
    console.error('Error renaming group chat:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports = {
  createChat,
  getChatDetails,
  getUserChats,
  renameGroupChat,
};


// Summary of Sequelize Features Used:
// Feature	Usage
// belongsToMany	Fetching all participants via chat.Users
// belongsTo (as: 'creator')	Fetching who created the chat
// belongsTo (as: 'latestMessage')	Fetching the last message efficiently
// through: { attributes: [] }	Hides intermediate ChatUser join table info
// where: { id: req.user.id } inside include	Filters chats where user is a participant