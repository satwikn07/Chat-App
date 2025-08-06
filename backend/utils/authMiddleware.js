// middleware/authMiddleware.js
const jwt = require('jsonwebtoken');

// Secret key (should be same as used during token generation)
const SECRET_KEY = process.env.SECRET_KEY;

const authMiddleware = (req, res, next) => {
  // Get token from Authorization header
  console.log('Request Headers:', req.headers);
  const authHeader = req.headers['authorization'];
  console.log('Auth Header:', authHeader);

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Access denied. No token provided.' });
  }

  const token = authHeader.split(' ')[1];
  try {
    // Verify token
        console.log('secret key:', SECRET_KEY);
    console.log('Token:', token);

    const decoded = jwt.verify(token, SECRET_KEY);
    console.log('Decoded Token:', decoded);
  
    // Attach user info to request
    req.user = decoded;

    next(); // Pass control to next middleware or route handler
  } catch (err) {
    console.error('Token verification error:', err);
    return res.status(401).json({ message: 'Invalid or expired token.' });
  }
};

module.exports = authMiddleware;
