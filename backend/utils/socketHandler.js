const {Message, Chat, User, ChatUser} = require('../models/associations');

const setupSocket = (io) => {
    
    io.on('connection', (socket) => {
        if (!socket.user) {
              console.warn("Socket connected without user!");
                return socket.disconnect(true);
        }
         console.log(`User connected: ${socket.user.id}`); // for testing
           // User joins a chat room

            socket.on("chat:join", async (chatId) => {
                try {
                        const chatUser = await ChatUser.findOne({
                        where: { userId: socket.user.id, chatId },
                    });
                    if (!chatUser) {
                        console.log("Unauthorized join attempt");
                        return socket.emit("error", { message: "Not allowed to join this chat" });
                    }
                       // If authorized → join the room
                socket.join(`chat_${chatId}`);
                console.log(`User ${socket.user.id} joined chat ${chatId}`);

                socket.emit("joined", { chatId });
                } catch (error) {
                    console.error("Error joining chat:", error);
                    socket.emit("error", { message: "Something went wrong" });
                }
            //     socket.join(`chat_${chatId}`);
            //     console.log(`User ${socket.user.id} joined chat ${chatId}`);
            //     socket.emit("chat:joined", chatId); // Acknowledge joining
            });
            // User leaves a chat room
            socket.on("chat:leave", (chatId) => {   
            socket.leave(`chat_${chatId}`);
            console.log(`User ${socket.user.id} left chat ${chatId}`);
            });
            // Handle sending messages  
                
            socket.on("message:send", async ({ chatId, content }) => {
                try {
                    const isMember = await ChatUser.findOne({
                        where: { userId: socket.user.id, chatId },
                    });
                    if (!isMember) {
                        console.log("Unauthorized message attempt"); 
                        return socket.emit("error", { message: "Not allowed to send message to this chat" });
                    }
                    // Save message to DB
                    const message = await Message.create({
                        chatId,
                        senderId: socket.user.id,
                        content,
                    });
                    // Update latest message in Chat
                    await Chat.update(
                        { latestMessageId: message.id },
                        { where: { id: chatId } }
                    );
                    const fullMessage = await Message.findByPk(message.id, {
                        include: [
                            { model: User, attributes: ["id", "name", "email"] }
                        ]
                        });
                    io.to(`chat_${chatId}`).emit("message:receive", fullMessage);
                    socket.emit("message:sent", fullMessage); // confirmation to sender
                } catch (error) {
                    console.error("Error sending message:", error);
                    socket.emit("error", { message: "Failed to send message" });
                }
            });
            socket.on("disconnect", () => {
                console.log(`User disconnected: ${socket.user.id}`);
            });
    });
};
module.exports = setupSocket ;