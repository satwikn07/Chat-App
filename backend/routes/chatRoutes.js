// routes/chatRoutes.js
const express = require('express');
const router = express.Router();
const {createChat, getChatDetails, getUserChats, renameGroupChat, removeFromGroup, addToGroup, leaveGroup } = require('../controllers/chatController');
const authMiddleware = require('../utils/authMiddleware');
// const {
//   getChatDetails,
//   getUserChats,
// } = require('../controllers/chatController');
// Create group or 1-to-1 chat
router.post('/create', authMiddleware, createChat);

router.get('/:chatId', authMiddleware, getChatDetails);
router.get('/user/chats', authMiddleware, getUserChats);
router.post('/:chatId/rename', authMiddleware, renameGroupChat);
router.delete('/:userId/:chatId/remove', authMiddleware, removeFromGroup);
router.post('/:userId/:chatId/add', authMiddleware, addToGroup);
router.post('/:chatId/leave', authMiddleware, leaveGroup);

module.exports = router;
