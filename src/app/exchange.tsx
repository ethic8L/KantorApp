import { useState, useEffect } from 'react';
import {
  View, Text, TextInput, Button, StyleSheet, Alert, TouchableOpacity, ActivityIndicator
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
import { exchange, getRates } from '../lib/api';

const CURRENCIES = ['PLN', 'USD', 'EUR', 'GBP', 'CHF'];

export default function ExchangeScreen() {
  const [type, setType] = useState<'BUY' | 'SELL'>('BUY');
  const [fromCurrency, setFromCurrency] = useState('PLN');
  const [toCurrency, setToCurrency] = useState('USD');
  const [amount, setAmount] = useState('');
  
  // Stany do obsługi kursów
  const [rates, setRates] = useState<Record<string, number>>({ PLN: 1 });
  const [loadingRates, setLoadingRates] = useState(true);
  const [calculatedAmount, setCalculatedAmount] = useState<number | null>(null);

  // Pobieranie kursów przy wejściu na ekran
  useEffect(() => {
    (async () => {
      try {
        const data = await getRates();
        const ratesMap: Record<string, number> = { PLN: 1 };
        data.rates.forEach((r: any) => {
          ratesMap[r.code] = r.mid;
        });
        setRates(ratesMap);
      } catch (e) {
        Alert.alert('Błąd', 'Nie udało się pobrać aktualnych kursów walut.');
      } finally {
        setLoadingRates(false);
      }
    })();
  }, []);

  // Efekt do przeliczania kwoty na żywo
  useEffect(() => {
    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0 || !rates[fromCurrency] || !rates[toCurrency]) {
      setCalculatedAmount(null);
      return;
    }

    // Obliczamy przez PLN (bo takie mamy kursy z NBP)
    // np. sprzedajemy 10 USD na PLN: 10 * kurs_USD
    // np. kupujemy 10 USD za PLN: 10 / kurs_USD
    const amountInPLN = numAmount * rates[fromCurrency];
    const finalAmount = amountInPLN / rates[toCurrency];
    
    setCalculatedAmount(finalAmount);
  }, [amount, fromCurrency, toCurrency, rates]);

  const handleExchange = async () => {
    const token = await AsyncStorage.getItem('token');
    if (!token) {
      router.replace('/');
      return;
    }
    const numericAmount = parseFloat(amount);
    if (!numericAmount || numericAmount <= 0) {
      Alert.alert('Błąd', 'Podaj poprawną kwotę');
      return;
    }
    
    try {
      const result = await exchange(token, type, fromCurrency, toCurrency, numericAmount);
      Alert.alert(
        'Sukces',
        `Wymieniono pomyślnie!\nKurs: ${result.exchangeRate.toFixed(4)}`
      );
      router.back(); // Powrót do ekranu głównego
    } catch (e: any) {
      Alert.alert('Błąd wymiany', e.message);
    }
  };

  if (loadingRates) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={{ marginTop: 10 }}>Pobieranie kursów...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Rodzaj operacji</Text>
      <View style={styles.row}>
        <TouchableOpacity
          style={[styles.tab, type === 'BUY' && styles.tabActive]}
          onPress={() => { setType('BUY'); setFromCurrency('PLN'); setToCurrency('USD'); }}
        >
          <Text style={type === 'BUY' ? styles.tabTextActive : styles.tabText}>Kupuję walutę</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, type === 'SELL' && styles.tabActive]}
          onPress={() => { setType('SELL'); setFromCurrency('USD'); setToCurrency('PLN'); }}
        >
          <Text style={type === 'SELL' ? styles.tabTextActive : styles.tabText}>Sprzedaję walutę</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.label}>Waluta źródłowa (Oddaję)</Text>
      <View style={styles.row}>
        {CURRENCIES.map((c) => (
          <TouchableOpacity
            key={`from-${c}`}
            style={[styles.chip, fromCurrency === c && styles.chipActive]}
            onPress={() => setFromCurrency(c)}
          >
            <Text style={fromCurrency === c ? styles.chipTextActive : styles.chipText}>{c}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={styles.label}>Waluta docelowa (Otrzymuję)</Text>
      <View style={styles.row}>
        {CURRENCIES.map((c) => (
          <TouchableOpacity
            key={`to-${c}`}
            style={[styles.chip, toCurrency === c && styles.chipActive]}
            onPress={() => setToCurrency(c)}
          >
            <Text style={toCurrency === c ? styles.chipTextActive : styles.chipText}>{c}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={styles.label}>Kwota do wymiany ({fromCurrency})</Text>
      <TextInput
        style={styles.input}
        value={amount}
        onChangeText={setAmount}
        keyboardType="decimal-pad"
        placeholder="0.00"
      />

      {calculatedAmount !== null && (
        <View style={styles.summaryBox}>
          <Text style={styles.summaryText}>
            Otrzymasz około: <Text style={styles.summaryValue}>{calculatedAmount.toFixed(2)} {toCurrency}</Text>
          </Text>
          <Text style={styles.summaryRate}>
            (Kurs rynkowy NBP: 1 {toCurrency} = {(rates[toCurrency] / rates[fromCurrency]).toFixed(4)} {fromCurrency})
          </Text>
        </View>
      )}

      <View style={{ marginTop: 20 }}>
        <Button title="Potwierdź wymianę" onPress={handleExchange} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  container: { flex: 1, padding: 20, gap: 12 },
  label: { fontSize: 14, fontWeight: '600', marginTop: 8, color: '#333' },
  row: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  tab: { flex: 1, padding: 12, borderRadius: 8, borderWidth: 1, borderColor: '#ccc', alignItems: 'center' },
  tabActive: { backgroundColor: '#007AFF', borderColor: '#007AFF' },
  tabText: { color: '#333' },
  tabTextActive: { color: '#fff', fontWeight: '600' },
  chip: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 16, borderWidth: 1, borderColor: '#ccc' },
  chipActive: { backgroundColor: '#007AFF', borderColor: '#007AFF' },
  chipText: { color: '#333' },
  chipTextActive: { color: '#fff' },
  input: { borderWidth: 1, borderColor: '#ccc', borderRadius: 8, padding: 12, fontSize: 18 },
  summaryBox: { backgroundColor: '#e6f2ff', padding: 16, borderRadius: 8, marginTop: 12 },
  summaryText: { fontSize: 16, color: '#333' },
  summaryValue: { fontWeight: 'bold', color: '#007AFF' },
  summaryRate: { fontSize: 12, color: '#666', marginTop: 4 },
});