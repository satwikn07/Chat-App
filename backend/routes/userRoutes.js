const express = require('express');
const router = express.Router();
const authMiddleware = require('../utils/authMiddleware');

router.get('/profile', authMiddleware, (req, res) => { //writtne only for testing
  res.json({
    message: 'Access granted to protected route',
    user: req.user, // this comes from decoded JWT
  });
});
module.exports = router;