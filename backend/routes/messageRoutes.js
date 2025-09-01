const express = require('express');
const router = express.Router();
const { fetchMessages } = require('../controllers/messageController');
const authMiddleware = require('../utils/authMiddleware');

// router.post("/:chatId/message", authMiddleware, sendMessage);
router.get("/:chatId/messages", authMiddleware, fetchMessages);

module.exports = router;