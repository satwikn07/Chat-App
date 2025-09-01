// server/app.js
require('dotenv').config({ debug: true });
const express = require('express');
const { connectDB } = require('./utils/db');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const authRoutes = require('./routes/authRoutes');
const chatRoutes = require('./routes/chatRoutes');
const setupSocket = require('./utils/socketHandler');
const messageRoutes = require('./routes/messageRoutes');
// const { initRedis } = require('./utils/redis');

const app = express();
const server = http.createServer(app);
// const io = socketIo(server, { cors: { origin: '*' } });
const io = socketIo(server, {
  cors: {
    origin: "*", // I am allowing all endpoints as of now
    methods: ["GET", "POST"] // allowing GET and POST requests for handshake
  }
});

// io.on("connection", (socket) => {
//   console.log("User connected", socket.id);
// });
// middleware to authenticate socket connections
io.use((socket, next) => {
  const jwt = require('jsonwebtoken');
  const token = socket.handshake.auth?.token || socket.handshake.headers["authorization"]?.split(" ")[1];
  if (!token) {
    return next(new Error("No token provided"));
  }
  // console.log("Socket token:", token);
  
  try {
    
    const decoded = jwt.verify(token, process.env.SECRET_KEY);
    socket.user = decoded; // attach user
    next();
  } catch (err) {
    next(new Error("Invalid token"));
  }
});


app.use(cors());
app.use(express.json());
// initRedis();
setupSocket(io);

app.use('/api/auth', authRoutes);
// app.use('/api/user', userRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/message', messageRoutes);
(async () => {
  await connectDB(); // connect + sync

  const PORT = process.env.PORT || 3000;
  server.listen(PORT, () => {
    console.log(`🚀 Server running at http://localhost:${PORT}`);
  });
})();
module.exports = server;
