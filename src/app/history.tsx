import { useEffect, useState, useCallback } from 'react';
import { View, Text, FlatList, StyleSheet, ActivityIndicator } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from 'expo-router';
import { getTransactions } from '../lib/api';

export default function HistoryScreen() {
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const loadHistory = async () => {
    const token = await AsyncStorage.getItem('token');
    if (!token) return;
    try {
      const data = await getTransactions(token);
      setTransactions(data.transactions);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadHistory();
    }, [])
  );

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  return (
    <FlatList
      style={styles.container}
      contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
      data={transactions}
      keyExtractor={(item) => item._id}
      ListEmptyComponent={
        <View style={styles.emptyBox}>
          <Text style={styles.emptyText}>Brak historii transakcji</Text>
        </View>
      }
      renderItem={({ item }) => {
        const isBuy = item.type === 'BUY';
        return (
          <View style={styles.card}>
            <View style={[styles.iconBox, { backgroundColor: isBuy ? '#e6f7ef' : '#ffe6e6' }]}>
              <Text style={[styles.iconText, { color: isBuy ? '#00a854' : '#e63946' }]}>
                {isBuy ? '↓' : '↑'}
              </Text>
            </View>
            <View style={styles.content}>
              <Text style={styles.title}>
                {isBuy ? 'Kupno' : 'Sprzedaż'} {item.toCurrency}
              </Text>
              <Text style={styles.subtitle}>
                {new Date(item.createdAt).toLocaleString()}
              </Text>
            </View>
            <View style={styles.amountBox}>
              <Text style={styles.amount}>
                {isBuy ? '+' : '-'}{item.amount} {isBuy ? item.toCurrency : item.fromCurrency}
              </Text>
              <Text style={styles.rate}>Kurs: {item.exchangeRate.toFixed(4)}</Text>
            </View>
          </View>
        );
      }}
    />
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f8f9fa' },
  container: { flex: 1, backgroundColor: '#f8f9fa' },
  emptyBox: { marginTop: 40, alignItems: 'center' },
  emptyText: { color: '#888', fontSize: 16 },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  iconBox: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  iconText: { fontSize: 24, fontWeight: 'bold' },
  content: { flex: 1 },
  title: { fontSize: 16, fontWeight: '600', color: '#333' },
  subtitle: { fontSize: 12, color: '#888', marginTop: 4 },
  amountBox: { alignItems: 'flex-end' },
  amount: { fontSize: 16, fontWeight: 'bold', color: '#333' },
  rate: { fontSize: 12, color: '#888', marginTop: 4 },
});