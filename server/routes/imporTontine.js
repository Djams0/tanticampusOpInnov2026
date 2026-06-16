const express = require('express');
const db = require('../config/db');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

router.post('/join', authenticateToken, async (req, res) => {
  const { tontine_code } = req.body;
  const userId = req.user.id;

  if (!tontine_code) {
    return res.status(400).json({ message: 'Code manquant dans la requete.' });
  }

  if (tontine_code.length !== 10) {
    return res.status(400).json({ message: `Code invalide : attendu 10 caracteres, recu ${tontine_code.length}.` });
  }

  if (!/[a-zA-Z]/.test(tontine_code)) {
    return res.status(400).json({ message: 'Code invalide : doit contenir au moins une lettre.' });
  }

  try {
    const [[user]] = await db.execute(
      'SELECT trust_score FROM users WHERE user_id = ?',
      [userId]
    );

    if (!user) {
      return res.status(404).json({ message: 'Utilisateur introuvable.' });
    }

    if (user.trust_score <= 50) {
      return res.status(403).json({ message: 'Votre score de confiance ne permet pas de rejoindre une nouvelle tontine.' });
    }

    const [tontines] = await db.execute('SELECT * FROM tontines WHERE tontine_code = ?', [tontine_code]);
    if (tontines.length === 0) {
      return res.status(404).json({ message: 'Tontine introuvable.' });
    }

    const tontine = tontines[0];

    const [participants] = await db.execute(
      'SELECT COUNT(*) AS count FROM tontine_participants WHERE tontine_id = ?',
      [tontine.tontine_id]
    );
    if (participants[0].count >= tontine.max_participants) {
      return res.status(403).json({ message: 'La tontine est deja complete.' });
    }

    const [existingMemberships] = await db.execute(
      'SELECT 1 FROM tontine_participants WHERE tontine_id = ? AND user_id = ?',
      [tontine.tontine_id, userId]
    );

    if (existingMemberships.length > 0) {
      return res.status(409).json({ message: 'Vous participez deja a cette tontine.' });
    }

    const [existingRequests] = await db.execute(
      'SELECT 1 FROM join_requests WHERE tontine_id = ? AND user_id = ? AND status = "pending"',
      [tontine.tontine_id, userId]
    );

    if (existingRequests.length > 0) {
      return res.status(409).json({ message: 'Une demande est deja en attente.' });
    }

    await db.execute(
      'INSERT INTO join_requests (tontine_id, user_id, status) VALUES (?, ?, "pending")',
      [tontine.tontine_id, userId]
    );

    return res.status(200).json({ message: "Demande envoyee avec succes. En attente de validation par l'admin." });
  } catch (err) {
    console.error('Erreur import tontine:', err);
    return res.status(500).json({ message: 'Erreur serveur.' });
  }
});

module.exports = router;
