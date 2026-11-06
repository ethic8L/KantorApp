import { useState } from 'react';
import { 
  View, TextInput, Text, Alert, StyleSheet, TouchableOpacity, 
  KeyboardAvoidingView, Platform 
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

const API_URL = process.env.EXPO_PUBLIC_API_URL;

export default function RegisterScreen() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleRegister = async () => {
    if (!username || !password) {
      Alert.alert('Błąd', 'Wypełnij wszystkie pola');
      return;
    }
    try {
      const res = await fetch(`${API_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });
      if (!res.ok) throw new Error((await res.json()).error);
      
      Alert.alert('Sukces', 'Konto zostało utworzone. Możesz się zalogować.');
      router.replace('/');
    } catch (e: any) {
      Alert.alert('Błąd rejestracji', e.message);
    }
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container} 
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={styles.card}>
        {/* Ikona aplikacji na górze */}
        <View style={styles.logoContainer}>
          <Ionicons name="person-add" size={48} color="#007AFF" />
        </View>
        
        <Text style={styles.title}>Utwórz konto</Text>
        <Text style={styles.subtitle}>Dołącz do naszego kantoru</Text>

        <TextInput
          style={styles.input}
          placeholder="Nazwa użytkownika"
          value={username}
          onChangeText={setUsername}
          autoCapitalize="none"
        />
        <TextInput
          style={styles.input}
          placeholder="Hasło"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
        />
        
        <TouchableOpacity style={styles.button} onPress={handleRegister}>
          <Text style={styles.buttonText}>Zarejestruj się</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => router.back()} style={{ marginTop: 16 }}>
          <Text style={styles.linkText}>Masz już konto? Zaloguj się</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#007AFF', justifyContent: 'center', padding: 20 },
  card: { 
    backgroundColor: '#fff', 
    borderRadius: 24, 
    padding: 32, 
    shadowColor: '#000', 
    shadowOffset: { width: 0, height: 4 }, 
    shadowOpacity: 0.1, 
    shadowRadius: 12, 
    elevation: 5 
  },
  logoContainer: { alignItems: 'center', marginBottom: 16 },
  title: { fontSize: 24, fontWeight: 'bold', textAlign: 'center', color: '#333' },
  subtitle: { fontSize: 14, color: '#888', textAlign: 'center', marginBottom: 32 },
  input: { 
    backgroundColor: '#f8f9fa', 
    borderRadius: 12, 
    padding: 16, 
    marginBottom: 16, 
    fontSize: 16, 
    borderWidth: 1, 
    borderColor: '#e9ecef' 
  },
  button: { 
    backgroundColor: '#007AFF', 
    borderRadius: 12, 
    padding: 16, 
    alignItems: 'center', 
    marginTop: 8 
  },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  linkText: { color: '#007AFF', textAlign: 'center', fontSize: 14 },
});