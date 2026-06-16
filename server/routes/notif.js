const express = require('express');
const db = require('../config/db');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

router.get('/', authenticateToken, async (req, res) => {
  try {
    const [notifications] = await db.execute(
      `SELECT notification_id, tontine_id, type, content, is_read, created_at
       FROM notifications
       WHERE user_id = ?
       ORDER BY created_at DESC`,
      [req.user.id]
    );

    res.json({
      success: true,
      data: notifications
    });
  } catch (error) {
    console.error('Erreur notifications:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur lors de la recuperation des notifications'
    });
  }
});

module.exports = router;
