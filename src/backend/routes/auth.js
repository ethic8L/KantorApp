const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const router = express.Router();

// Rejestracja
router.post('/register', async (req, res) => {
  const { username, password } = req.body;
  const existing = await User.findOne({ username });
  if (existing) return res.status(400).json({ error: 'Użytkownik już istnieje' });

  const passwordHash = await bcrypt.hash(password, 12); 
  const user = await User.create({
    username,
    passwordHash,
    wallets: [{ currency: 'PLN', balance: 0 }]  // Domyślnie tylko portfel PLN
  });
  res.status(201).json({ message: 'Zarejestrowano pomyślnie', userId: user._id });
});

// Logowanie
router.post('/login', async (req, res) => {
  const { username, password } = req.body;
  const user = await User.findOne({ username });
  if (!user) return res.status(401).json({ error: 'Nieprawidłowe dane logowania' });

  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) return res.status(401).json({ error: 'Nieprawidłowe dane logowania' });

  const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });
  res.json({ token });
});

module.exports = router;