const express = require('express');
const router = express.Router();
const { fetchMessages, deleteMessage } = require('../controllers/messageController');
const authMiddleware = require('../utils/authMiddleware');
const { route } = require('./authRoutes');

// router.post("/:chatId/message", authMiddleware, sendMessage);
router.get("/:chatId/fetchAllMessages", authMiddleware, fetchMessages);
router.delete("/:chatId/:messageId/delete", authMiddleware, deleteMessage);
module.exports = router;