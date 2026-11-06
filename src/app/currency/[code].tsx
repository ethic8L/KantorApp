import { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, Dimensions } from 'react-native';
import { useLocalSearchParams, Stack } from 'expo-router';
import { LineChart } from 'react-native-chart-kit';
import { getRateHistory } from '../../lib/api';

export default function CurrencyHistoryScreen() {
  const { code } = useLocalSearchParams();
  const [history, setHistory] = useState<{ date: string; rate: number }[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        if (typeof code === 'string') {
          const data = await getRateHistory(code);
          setHistory(data.history);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    })();
  }, [code]);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  if (history.length === 0) {
    return (
      <View style={styles.center}>
        <Text>Brak danych historycznych.</Text>
      </View>
    );
  }

  // Przygotowanie danych do wykresu
  const labels = history.filter((_, i) => i % 5 === 0).map(h => h.date.slice(5)); // etykiety co 5 dni
  const dataPoints = history.map(h => h.rate);
  const minRate = Math.min(...dataPoints);
  const maxRate = Math.max(...dataPoints);

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ title: `Kurs ${code}` }} />
      
      <View style={styles.header}>
        <Text style={styles.title}>Ostatnie 30 dni</Text>
        <Text style={styles.subtitle}>Aktualny kurs: {dataPoints[dataPoints.length - 1].toFixed(4)} PLN</Text>
      </View>

      <View style={styles.chartContainer}>
        <LineChart
          data={{
            labels: labels,
            datasets: [{ data: dataPoints }]
          }}
          width={Dimensions.get('window').width - 32}
          height={250}
          yAxisLabel=""
          yAxisSuffix=""
          chartConfig={{
            backgroundColor: '#ffffff',
            backgroundGradientFrom: '#ffffff',
            backgroundGradientTo: '#ffffff',
            decimalPlaces: 3,
            color: (opacity = 1) => `rgba(0, 122, 255, ${opacity})`,
            labelColor: (opacity = 1) => `rgba(100, 100, 100, ${opacity})`,
            style: { borderRadius: 16 },
            propsForDots: { r: '3', strokeWidth: '2', stroke: '#007AFF' }
          }}
          bezier
          style={styles.chart}
          withInnerLines={false}
          withOuterLines={true}
        />
      </View>
      
      <View style={styles.statsRow}>
        <View style={styles.statBox}>
          <Text style={styles.statLabel}>Min (30 dni)</Text>
          <Text style={styles.statValue}>{minRate.toFixed(4)}</Text>
        </View>
        <View style={styles.statBox}>
          <Text style={styles.statLabel}>Max (30 dni)</Text>
          <Text style={styles.statValue}>{maxRate.toFixed(4)}</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  container: { flex: 1, backgroundColor: '#f8f9fa', padding: 16 },
  header: { marginBottom: 20 },
  title: { fontSize: 22, fontWeight: 'bold', color: '#333' },
  subtitle: { fontSize: 14, color: '#666', marginTop: 4 },
  chartContainer: { 
    backgroundColor: '#fff', 
    borderRadius: 16, 
    padding: 12, 
    shadowColor: '#000', 
    shadowOffset: { width: 0, height: 2 }, 
    shadowOpacity: 0.05, 
    shadowRadius: 4, 
    elevation: 2,
    alignItems: 'center'
  },
  chart: { borderRadius: 16 },
  statsRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 20 },
  statBox: { flex: 1, backgroundColor: '#fff', padding: 16, borderRadius: 12, marginHorizontal: 4, alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 2 },
  statLabel: { fontSize: 12, color: '#888', marginBottom: 8 },
  statValue: { fontSize: 18, fontWeight: 'bold', color: '#007AFF' }
});