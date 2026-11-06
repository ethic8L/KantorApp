const express = require('express');
const router = express.Router();

// Pobieranie aktualnych kursów z NBP
router.get('/', async (req, res) => {
  try {
    // Pobieramy Tabelę A (główne waluty) z oficjalnego API NBP
    const response = await fetch('https://api.nbp.pl/api/exchangerates/tables/A/?format=json');
    const data = await response.json();
    
    // Wyciągamy tylko potrzebne nam dane (kod waluty i kurs)
    const rates = data[0].rates.map(r => ({
      code: r.code,
      currency: r.currency,
      mid: r.mid
    }));
    
    res.json({ rates, effectiveDate: data[0].effectiveDate });
  } catch (error) {
    console.error('Błąd pobierania z NBP:', error);
    res.status(500).json({ error: 'Nie udało się pobrać kursów walut' });
  }
});

module.exports = router;