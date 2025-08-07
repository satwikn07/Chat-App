const {Chat, ChatUser, User} = require('../models/associations');
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
module.exports = {
  createChat
};