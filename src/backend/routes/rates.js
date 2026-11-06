const express = require('express');
const router = express.Router();

// ... (na górze pliku zostaw import express i router)

// Pobieranie kursów historycznych (ostatnie 30 dni)
router.get('/:code/history', async (req, res) => {
  const { code } = req.params;
  try {
    // Obliczamy datę sprzed 30 dni
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(endDate.getDate() - 30);

    const formatDate = (date) => date.toISOString().split('T')[0];

    const url = `https://api.nbp.pl/api/exchangerates/rates/A/${code}/${formatDate(startDate)}/${formatDate(endDate)}/?format=json`;
    
    const response = await fetch(url);
    if (!response.ok) throw new Error('Brak danych z NBP');
    
    const data = await response.json();
    
    // Zwracamy uproszczoną tablicę dat i kursów
    const history = data.rates.map(r => ({
      date: r.effectiveDate,
      rate: r.mid
    }));

    res.json({ code, history });
  } catch (error) {
    console.error('Błąd pobierania historii z NBP:', error);
    res.status(500).json({ error: 'Nie udało się pobrać historii kursów' });
  }
});


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