// Pobiera najnowsze kursy z Tabeli A NBP (główne waluty)
async function fetchNbpRates() {
  const res = await fetch('https://api.nbp.pl/api/exchangerates/tables/A/?format=json');
  const data = await res.json();
  // data[0].rates to tablica: [{ currency: "dolar amerykański", code: "USD", mid: 3.95 }, ...]
  return data[0].rates;
}

// Konwersja: 1 jednostka waluty = ile PLN
async function getRateToPLN(currencyCode) {
  const rates = await fetchNbpRates();
  const rate = rates.find(r => r.code === currencyCode);
  if (!rate) throw new Error(`Brak kursu dla waluty ${currencyCode}`);
  return rate.mid; 
}

module.exports = { fetchNbpRates, getRateToPLN };