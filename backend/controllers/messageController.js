const {Message, User, Chat } = require('../models/associations');
const { Op } = require("sequelize");
//send message via REST
const fetchMessages = async (req, res) => {
    try {
        const { chatId } = req.params;
        let { before, limit = 15 } = req.query;
        limit = parseInt(limit);
        const userId = req.user.id; // from auth middleware
        //  1. Check if user is part of the chat
        const isMember = await Chat.findOne({
            where: { id: chatId },
            include: {
                model: User,
                through: { attributes: [] }, // don’t need join table fields
                where: { id: userId }        // only match if current user is part of it
            }
        });

        if (!isMember) {
            return res.status(403).json({ message: "You are not a member of this chat" });
        }
        let where = { chatId };

        // If client sends "before", fetch only older messages
        if (before) {
            where.createdAt = { [Op.lt]: new Date(before) };
        }

        // Fetch messages
        const messages = await Message.findAll({
            where,
            include: [
                {
                    model: User,
                    as: "sender",
                    attributes: ["id", "name", "email"]
                }
            ],
            order: [["createdAt", "DESC"]],
            limit
        });

        // Prepare next cursor (the oldest message we just got)
        const nextCursor = messages.length
            ? messages[messages.length - 1].createdAt
            : null;

        res.status(200).json({
            messages: messages.reverse(), // reverse so oldest → newest for UI
            nextCursor, // send this back to client for next request
            hasMore: messages.length === limit
        });

    } catch (error) {
        console.error("Error fetching messages:", error);
        res.status(500).json({ message: "Failed to fetch messages" });
    }
};

const deleteMessage = async (req, res) => {
    try {
        const { chatId, messageId } = req.params;
        const userId = req.user.id; // from auth middleware
        const { type } = req.query;

        const message = await Message.findOne({
            where: {
                id: messageId,
                chatId: chatId
            },
            paranoid: type === "hard" ? false : true // This includes soft-deleted rows
        });
        if (!message) {
            return res.status(404).json({ message: "Message not found" });
        }
        if (message.senderId !== userId) {
                return res.status(403).json({ error: "Not authorized to delete this message" });
        }
        // Soft delete if query param `type=soft`, else hard delete

        if (type === "hard") {
            await message.destroy({ force: true }); // Hard delete
            return res.json({ message: "Message permanently deleted" });    
        } else {
            await message.destroy(); // Soft delete (sets deletedAt)
            return res.json({ message: "Message deleted (soft)" });
        }
    } catch (error) {
        res.status(500).json({ message: "Failed to delete message" });
        console.error("Error deleting message:", error);
    }
};
module.exports = { fetchMessages, deleteMessage };