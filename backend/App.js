// server/app.js
require('dotenv').config({ debug: true });
const express = require('express');
const { connectDB } = require('./utils/db');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
// const chatRoutes = require('./routes/chatRoutes');
// const messageRoutes = require('./routes/messageRoutes');
// const { setupSocket } = require('./sockets/socketHandler');
// const { initRedis } = require('./utils/redis');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, { cors: { origin: '*' } });

app.use(cors());
app.use(express.json());
// initRedis();
// setupSocket(io);

app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes);
// app.use('/api/chat', chatRoutes);
// app.use('/api/message', messageRoutes);
(async () => {
  await connectDB(); // connect + sync

  const PORT = process.env.PORT || 3000;
  server.listen(PORT, () => {
    console.log(`🚀 Server running at http://localhost:${PORT}`);
  });
})();
module.exports = server;
