// controllers/messageController.js
const db = require('../db');

// Fetch all messages
exports.getAllMessages = async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM messages ORDER BY created_at DESC');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: 'Database error' });
  }
};

// Create a new message
exports.createMessage = async (req, res) => {
  const { sender, content } = req.body;
  try {
    const result = await db.query(
      'INSERT INTO messages (sender, content) VALUES ($1, $2) RETURNING *',
      [sender, content]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Could not create message' });
  }
};

// Delete a message
exports.deleteMessage = async (req, res) => {
  const id = req.params.id;
  try {
    await db.query('DELETE FROM messages WHERE id = $1', [id]);
    res.status(204).send(); // No content
  } catch (err) {
    res.status(500).json({ error: 'Could not delete message' });
  }
};
