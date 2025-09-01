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
module.exports = { fetchMessages };