const express = require('express');
const mongoose = require('mongoose');
const User = require('../models/User');
const Transaction = require('../models/Transaction');
const { getRateToPLN } = require('../services/nbp');
const auth = require('../middleware/auth');
const router = express.Router();

router.post('/exchange', auth, async (req, res) => {
  const { type, fromCurrency, toCurrency, amount } = req.body;
  // type: "BUY" (kupno waluty obcej za PLN) lub "SELL" (sprzedaż waluty obcej za PLN)

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const user = await User.findById(req.userId).session(session);

    // 1. Pobierz kurs NBP
    const foreignCurrency = type === 'BUY' ? toCurrency : fromCurrency;
    const nbpRate = await getRateToPLN(foreignCurrency);  // 1 jednostka waluty obcej = X PLN

    // 2. Oblicz kurs transakcji (z punktu widzenia użytkownika)
    //    Przy kupnie: użytkownik płaci PLN, otrzymuje walutę obcą, kurs = nbpRate
    //    Przy sprzedaży: użytkownik płaci walutę obcą, otrzymuje PLN, kurs = nbpRate
    const exchangeRate = nbpRate;
    const plnAmount = amount * nbpRate;

    // 3. Znajdź lub utwórz portfel
    const fromWallet = user.wallets.find(w => w.currency === fromCurrency);
    const toWallet = user.wallets.find(w => w.currency === toCurrency);

    if (!fromWallet || fromWallet.balance < (type === 'BUY' ? plnAmount : amount)) {
      throw new Error('Niewystarczające saldo');
    }

    // 4. Wykonaj odejmowanie i dodawanie
    if (type === 'BUY') {
      fromWallet.balance -= plnAmount;   // Odlicz PLN
      if (!toWallet) {
        user.wallets.push({ currency: toCurrency, balance: amount });
      } else {
        toWallet.balance += amount;       // Dodaj walutę obcą
      }
    } else {
      fromWallet.balance -= amount;       // Odlicz walutę obcą
      const plnWallet = user.wallets.find(w => w.currency === 'PLN');
      plnWallet.balance += plnAmount;     // Dodaj PLN
    }

    await user.save({ session });

    // 5. Zapisz transakcję (kurs jest zapisywany na stałe)
    await Transaction.create([{
      userId: user._id,
      type,
      fromCurrency,
      toCurrency,
      amount,
      exchangeRate
    }], { session });

    await session.commitTransaction();
    res.json({ message: 'Transakcja zakończona', exchangeRate, plnAmount });

  } catch (err) {
    await session.abortTransaction();
    res.status(400).json({ error: err.message });
  } finally {
    session.endSession();
  }
});

module.exports = router;