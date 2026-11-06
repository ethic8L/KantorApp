import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router, useFocusEffect } from "expo-router"; // <-- TUTAJ MUSI BYĆ ROUTER
import { useCallback, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { getBalance, getRates } from "../lib/api";

export default function HomeScreen() {
  const [wallets, setWallets] = useState<
    { currency: string; balance: number }[]
  >([]);
  const [rates, setRates] = useState<
    { code: string; currency: string; mid: number }[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadData = async () => {
    const token = await AsyncStorage.getItem("token");
    if (!token) {
      router.replace("/");
      return;
    }
    try {
      const [balanceData, ratesData] = await Promise.all([
        getBalance(token),
        getRates(),
      ]);
      setWallets(balanceData.wallets);
      const popularCodes = ["USD", "EUR", "GBP", "CHF"];
      setRates(
        ratesData.rates.filter((r: any) => popularCodes.includes(r.code)),
      );
    } catch (e: any) {
      Alert.alert("Błąd", e.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, []),
  );

  const onRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  const handleLogout = async () => {
    await AsyncStorage.removeItem("token");
    router.replace("/");
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  const plnWallet = wallets.find((w) => w.currency === "PLN");
  const otherWallets = wallets.filter(
    (w) => w.currency !== "PLN" && w.balance > 0,
  );

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      {/* KARTA Z SALDEM */}
      <View style={styles.balanceCard}>
        <Text style={styles.balanceLabel}>Dostępne środki (PLN)</Text>
        <Text style={styles.balanceAmount}>
          {plnWallet ? plnWallet.balance.toFixed(2) : "0.00"} zł
        </Text>
        {otherWallets.length > 0 && (
          <View style={styles.otherWallets}>
            {otherWallets.map((w) => (
              <Text key={w.currency} style={styles.otherWalletText}>
                {w.balance.toFixed(2)} {w.currency}
              </Text>
            ))}
          </View>
        )}
      </View>

      {/* PRZYCISKI AKCJI (Z IKONAMI) */}
      <View style={styles.actionsRow}>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => router.push("/exchange")}
        >
          <View style={[styles.iconCircle, { backgroundColor: "#e6f2ff" }]}>
            <Ionicons name="swap-horizontal" size={24} color="#007AFF" />
          </View>
          <Text style={styles.actionText}>Wymień</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => router.push("/history")}
        >
          <View style={[styles.iconCircle, { backgroundColor: "#fff4e6" }]}>
            <Ionicons name="time-outline" size={24} color="#FF9500" />
          </View>
          <Text style={styles.actionText}>Historia</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionButton} onPress={handleLogout}>
          <View style={[styles.iconCircle, { backgroundColor: "#ffe6e6" }]}>
            <Ionicons name="log-out-outline" size={24} color="#e63946" />
          </View>
          <Text style={styles.actionText}>Wyloguj</Text>
        </TouchableOpacity>
      </View>

      {/* SEKCJA KURSÓW */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Kursy walut (NBP)</Text>
      </View>
      <View style={styles.ratesCard}>
        {rates.map((r, index) => (
          <TouchableOpacity
            key={r.code}
            style={[
              styles.rateRow,
              index === rates.length - 1 && { borderBottomWidth: 0 },
            ]}
            onPress={() => router.push(`/currency/${r.code}`)} // <-- NOWA NAWIGACJA
          >
            <View style={styles.rateLeft}>
              <View style={styles.flagPlaceholder}>
                <Text style={styles.flagText}>{r.code[0]}</Text>
              </View>
              <View>
                <Text style={styles.rateCode}>{r.code}</Text>
                <Text style={styles.rateCurrencyName}>{r.currency}</Text>
              </View>
            </View>
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <Text style={styles.rateValue}>{r.mid.toFixed(4)} PLN</Text>
              <Ionicons
                name="chevron-forward"
                size={16}
                color="#ccc"
                style={{ marginLeft: 8 }}
              />
            </View>
          </TouchableOpacity>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f8f9fa",
  },
  container: { flex: 1, backgroundColor: "#f8f9fa", padding: 16 },
  balanceCard: {
    backgroundColor: "#007AFF",
    borderRadius: 20,
    padding: 24,
    marginBottom: 24,
    shadowColor: "#007AFF",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  balanceLabel: { color: "#e6f2ff", fontSize: 14, marginBottom: 8 },
  balanceAmount: { color: "#fff", fontSize: 36, fontWeight: "bold" },
  otherWallets: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    marginTop: 12,
  },
  otherWalletText: {
    color: "#fff",
    fontSize: 14,
    backgroundColor: "rgba(255,255,255,0.2)",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  actionsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 32,
  },
  actionButton: {
    flex: 1,
    backgroundColor: "#fff",
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: "center",
    marginHorizontal: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  iconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
  },
  actionText: { fontSize: 13, fontWeight: "600", color: "#333" },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  sectionTitle: { fontSize: 18, fontWeight: "bold", color: "#333" },
  ratesCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  rateRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  rateLeft: { flexDirection: "row", alignItems: "center" },
  flagPlaceholder: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#e6f2ff",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  flagText: { color: "#007AFF", fontWeight: "bold", fontSize: 16 },
  rateCode: { fontSize: 16, fontWeight: "bold", color: "#333" },
  rateCurrencyName: { fontSize: 12, color: "#888" },
  rateValue: { fontSize: 16, fontWeight: "600", color: "#333" },
});
