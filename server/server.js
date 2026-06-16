// server\server.js

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const authRoutes = require('./routes/auth');
const homeRoutes = require('./routes/home');
const tontineRoutes = require('./routes/tontine');
const profileRoutes = require('./routes/profile');
const walletRoutes = require('./routes/wallet');
const tontineDetailsRoutes = require('./routes/tontinedetails');
const importTontineRoutes = require('./routes/imporTontine');
const notifRoutes = require('./routes/notif');

const app = express();

app.use(cors({
  origin: process.env.CORS_ORIGIN || '*',
  credentials: true
}));
app.use(express.json());

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', service: 'tonticampus-api' });
});

app.use('/api/auth', authRoutes);
app.use('/api', homeRoutes);
app.use('/api/tontine', tontineRoutes);
app.use('/api/user', profileRoutes);
app.use('/api/wallet', walletRoutes);
app.use('/api/tontine-details', tontineDetailsRoutes);
app.use('/api/import-tontine', importTontineRoutes);
app.use('/api/notifications', notifRoutes);

app.use((req, res) => {
  res.status(404).json({ error: 'Route introuvable' });
});

app.use((err, req, res, next) => {
  console.error('Erreur non geree:', err);
  res.status(500).json({ error: 'Erreur serveur' });
});

const PORT = process.env.PORT || 8030;
app.listen(PORT, () => {
  console.log(`Serveur TontiCampus lance sur le port ${PORT}`);
});
