const express = require('express');
const db = require('../config/db');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Récupérer le solde et les informations de base
router.get('/', authenticateToken, async (req, res) => {
  try {
    const [[user]] = await db.query(
      'SELECT first_name, last_name, wallet_balance FROM users WHERE user_id = ?',
      [req.user.id]
    );

    if (!user) {
      return res.status(404).json({ error: 'Utilisateur non trouvé' });
    }

    res.json({
      firstName: user.first_name,
      lastName: user.last_name,
      balance: user.wallet_balance
    });
  } catch (err) {
    console.error('Erreur wallet info:', err);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// Historique des transactions
router.get('/transactions', authenticateToken, async (req, res) => {
  try {
    const [transactions] = await db.query(
      `SELECT 
        transaction_id,
        tontine_id,
        type,
        amount,
        transaction_date,
        (SELECT title FROM tontines WHERE tontine_id = transactions.tontine_id) as tontine_title
       FROM transactions 
       WHERE user_id = ? 
       ORDER BY transaction_date DESC`,
      [req.user.id]
    );

    res.json(transactions);
  } catch (err) {
    console.error('Erreur transactions:', err);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// Cotisations dues par l'utilisateur pour les cycles actifs.
router.get('/contributions', authenticateToken, async (req, res) => {
  try {
    const [contributions] = await db.query(
      `SELECT
        t.tontine_id AS id,
        t.title AS nom,
        t.contribution_amount AS montant,
        COALESCE(tc.start_date, t.start_date) AS echeance
       FROM tontines t
       JOIN tontine_participants tp ON tp.tontine_id = t.tontine_id
       LEFT JOIN tontine_cycles tc
        ON tc.tontine_id = t.tontine_id AND tc.status = 'active'
       LEFT JOIN transactions tr
        ON tr.tontine_id = t.tontine_id
        AND tr.user_id = ?
        AND tr.type = 'contribution'
        AND (tc.cycle_id IS NULL OR tr.transaction_date >= tc.start_date)
       WHERE tp.user_id = ?
        AND tp.is_active = 1
        AND t.status = 'active'
        AND tr.transaction_id IS NULL
       ORDER BY echeance ASC`,
      [req.user.id, req.user.id]
    );

    res.json(contributions);
  } catch (err) {
    console.error('Erreur cotisations:', err);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// Dépôt d'argent
router.post('/deposit', authenticateToken, async (req, res) => {
  const { amount } = req.body;

  if (!amount || isNaN(amount) || amount <= 0) {
    return res.status(400).json({ error: 'Montant invalide' });
  }

  const connection = await db.getConnection(); // 👈 Obtenir une connexion

  try {
    await connection.beginTransaction(); // 👈 Transactions sur la connexion

    await connection.query(
      `INSERT INTO transactions (user_id, type, amount) 
       VALUES (?, 'deposit', ?)`,
      [req.user.id, amount]
    );

    await connection.query(
      `UPDATE users 
       SET wallet_balance = wallet_balance + ? 
       WHERE user_id = ?`,
      [amount, req.user.id]
    );

    await connection.commit(); // 👈 Commit
    res.json({ success: true, message: 'Dépôt effectué' });
  } catch (err) {
    await connection.rollback(); // 👈 Rollback
    console.error('Erreur dépôt:', err);
    res.status(500).json({ error: 'Erreur lors du dépôt' });
  } finally {
    connection.release(); // 👈 Libération obligatoire
  }
});


// Retrait d'argent
router.post('/withdraw', authenticateToken, async (req, res) => {
  const { amount } = req.body;

  if (!amount || isNaN(amount) || amount <= 0) {
    return res.status(400).json({ error: 'Montant invalide' });
  }

  const connection = await db.getConnection();

  try {
    await connection.beginTransaction();

    const [[user]] = await connection.query(
      `SELECT wallet_balance FROM users WHERE user_id = ? FOR UPDATE`,
      [req.user.id]
    );

    if (user.wallet_balance < amount) {
      await connection.rollback();
      return res.status(400).json({ error: 'Solde insuffisant' });
    }

    await connection.query(
      `INSERT INTO transactions (user_id, type, amount) VALUES (?, 'withdrawal', ?)`,
      [req.user.id, amount]
    );

    await connection.query(
      `UPDATE users SET wallet_balance = wallet_balance - ? WHERE user_id = ?`,
      [amount, req.user.id]
    );

    await connection.commit();
    res.json({ success: true, message: 'Retrait effectué' });
  } catch (err) {
    await connection.rollback();
    console.error('Erreur retrait:', err);
    res.status(500).json({ error: 'Erreur lors du retrait' });
  } finally {
    connection.release();
  }
});


// Paiement d'une cotisation
router.post('/pay-contribution', authenticateToken, async (req, res) => {
  const tontine_id = req.body.tontine_id || req.body.tontineId;

  if (!tontine_id) {
    return res.status(400).json({ error: 'ID de tontine requis' });
  }

  const connection = await db.getConnection();

  try {
    await connection.beginTransaction();

    const [[tontine]] = await connection.query(
      `SELECT 
        t.contribution_amount,
        t.status,
        tp.is_active,
        (SELECT cycle_id FROM tontine_cycles 
         WHERE tontine_id = ? AND status = 'active' 
         ORDER BY start_date DESC LIMIT 1) as current_cycle_id
       FROM tontines t
       JOIN tontine_participants tp ON t.tontine_id = tp.tontine_id
       WHERE t.tontine_id = ? AND tp.user_id = ?`,
      [tontine_id, tontine_id, req.user.id]
    );

    if (!tontine) {
      await connection.rollback();
      return res.status(404).json({ error: 'Tontine non trouvée' });
    }

    if (tontine.status !== 'active') {
      await connection.rollback();
      return res.status(400).json({ error: 'Tontine non active' });
    }

    if (!tontine.is_active) {
      await connection.rollback();
      return res.status(400).json({ error: 'Vous êtes inactif dans cette tontine' });
    }

    if (!tontine.current_cycle_id) {
      await connection.rollback();
      return res.status(400).json({ error: 'Aucun cycle actif pour cette tontine' });
    }

    const [[hasPaid]] = await connection.query(
      `SELECT 1 FROM transactions 
       WHERE user_id = ? AND tontine_id = ? AND type = 'contribution'
       AND transaction_date >= (SELECT start_date FROM tontine_cycles WHERE cycle_id = ?)`,
      [req.user.id, tontine_id, tontine.current_cycle_id]
    );

    if (hasPaid) {
      await connection.rollback();
      return res.status(400).json({ error: 'Vous avez déjà payé pour ce cycle' });
    }

    const [[user]] = await connection.query(
      `SELECT wallet_balance FROM users WHERE user_id = ? FOR UPDATE`,
      [req.user.id]
    );

    if (user.wallet_balance < tontine.contribution_amount) {
      await connection.rollback();
      return res.status(400).json({ error: 'Solde insuffisant' });
    }

    await connection.query(
      `INSERT INTO transactions (user_id, tontine_id, type, amount) 
       VALUES (?, ?, 'contribution', ?)`,
      [req.user.id, tontine_id, tontine.contribution_amount]
    );

    await connection.query(
      `UPDATE users SET wallet_balance = wallet_balance - ? WHERE user_id = ?`,
      [tontine.contribution_amount, req.user.id]
    );

    const [participants] = await connection.query(
      `SELECT 
        tp.user_id,
        (SELECT COUNT(*) FROM transactions tr 
         WHERE tr.user_id = tp.user_id AND 
               tr.tontine_id = ? AND 
               tr.type = 'contribution' AND
               tr.transaction_date >= (SELECT start_date FROM tontine_cycles WHERE cycle_id = ?)
        ) as has_paid
       FROM tontine_participants tp
       WHERE tp.tontine_id = ? AND tp.is_active = 1`,
      [tontine_id, tontine.current_cycle_id, tontine_id]
    );

    const allPaid = participants.every(p => p.has_paid > 0);
    let payoutData = { payoutTriggered: false };

    if (allPaid) {
      const [[beneficiary]] = await connection.query(
        `SELECT user_id FROM tontine_participants 
         WHERE tontine_id = ? AND has_received = 0 AND is_active = 1
         ORDER BY join_date ASC LIMIT 1`,
        [tontine_id]
      );

      if (beneficiary) {
        const payoutAmount = tontine.contribution_amount * participants.length;

        await connection.query(
          `INSERT INTO transactions (user_id, tontine_id, type, amount) 
           VALUES (?, ?, 'payout', ?)`,
          [beneficiary.user_id, tontine_id, payoutAmount]
        );

        await connection.query(
          `UPDATE users SET wallet_balance = wallet_balance + ? WHERE user_id = ?`,
          [payoutAmount, beneficiary.user_id]
        );

        await connection.query(
          `UPDATE tontine_participants SET has_received = 1 
           WHERE tontine_id = ? AND user_id = ?`,
          [tontine_id, beneficiary.user_id]
        );

        await connection.query(
          `UPDATE tontine_cycles 
           SET 
             status = 'completed',
             end_date = NOW(),
             beneficiary_id = ?,
             payout_date = NOW(),
             total_amount = ?
           WHERE cycle_id = ?`,
          [beneficiary.user_id, payoutAmount, tontine.current_cycle_id]
        );

        await connection.query(
          `INSERT INTO tontine_cycles 
           (tontine_id, start_date, status, amount_per_participant, total_amount) 
           VALUES (?, NOW(), 'active', ?, 0)`,
          [tontine_id, tontine.contribution_amount]
        );

        payoutData = { 
          payoutTriggered: true,
          beneficiaryId: beneficiary.user_id,
          amount: payoutAmount
        };
      }
    }

    await connection.commit();
    res.json({ 
      success: true, 
      message: 'Cotisation payée avec succès',
      ...payoutData
    });

  } catch (err) {
    await connection.rollback();
    console.error('Erreur paiement cotisation:', err);
    res.status(500).json({ error: 'Erreur lors du paiement' });
  } finally {
    connection.release();
  }
});


module.exports = router;
