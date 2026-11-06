const express = require('express');
const User = require('../models/User');
const auth = require('../middleware/auth');
const router = express.Router();

// Symulowane zasilenie konta (tylko PLN)
router.post('/deposit', auth, async (req, res) => {
  const { amount } = req.body;

  if (!amount || amount <= 0) {
    return res.status(400).json({ error: 'Kwota musi być większa od 0' });
  }

  const user = await User.findById(req.userId);
  if (!user) return res.status(404).json({ error: 'Nie znaleziono użytkownika' });

  const plnWallet = user.wallets.find(w => w.currency === 'PLN');
  if (!plnWallet) {
    user.wallets.push({ currency: 'PLN', balance: amount });
  } else {
    plnWallet.balance += amount;
  }

  await user.save();
  res.json({ message: 'Zasilenie zakończone', balance: plnWallet.balance });
});

// Pobierz saldo portfela
router.get('/balance', auth, async (req, res) => {
  const user = await User.findById(req.userId);
  if (!user) return res.status(404).json({ error: 'Nie znaleziono użytkownika' });
  res.json({ wallets: user.wallets });
});

module.exports = router;