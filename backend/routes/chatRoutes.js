// routes/chatRoutes.js
const express = require('express');
const router = express.Router();
const {createChat} = require('../controllers/chatController');
const authMiddleware = require('../utils/authMiddleware');

// Create group or 1-to-1 chat
router.post('/chat', authMiddleware, createChat);

module.exports = router;
