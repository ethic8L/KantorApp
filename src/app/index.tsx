import { useState } from 'react';
import { View, TextInput, Text, Alert, StyleSheet, TouchableOpacity, KeyboardAvoidingView, Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
import { login } from '../lib/api';
import { Ionicons } from '@expo/vector-icons';

export default function LoginScreen() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async () => {
    try {
      const { token } = await login(username, password);
      await AsyncStorage.setItem('token', token);
      router.replace('/home');
    } catch (e: any) {
      Alert.alert('Błąd logowania', e.message);
    }
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container} 
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={styles.card}>
        {/* NOWE LOGO APLIKACJI */}
        <View style={styles.logoContainer}>
          <Ionicons name="wallet" size={48} color="#007AFF" />
        </View>
        
        <Text style={styles.title}>Kantor Walut</Text>
        <Text style={styles.subtitle}>Zaloguj się do swojego konta</Text>

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
        
        <TouchableOpacity style={styles.button} onPress={handleLogin}>
          <Text style={styles.buttonText}>Zaloguj się</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => router.push('/register')} style={{ marginTop: 16 }}>
          <Text style={styles.linkText}>Nie masz konta? Zarejestruj się</Text>
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
  /* NOWE STYLE DLA LOGO */
  logoContainer: { 
    width: 80, 
    height: 80, 
    borderRadius: 40, 
    backgroundColor: '#e6f2ff', 
    justifyContent: 'center', 
    alignItems: 'center', 
    alignSelf: 'center', 
    marginBottom: 20 
  },
  title: { fontSize: 24, fontWeight: 'bold', textAlign: 'center', color: '#333' },
  subtitle: { fontSize: 14, color: '#888', textAlign: 'center', marginBottom: 32 },
  input: { backgroundColor: '#f8f9fa', borderRadius: 12, padding: 16, marginBottom: 16, fontSize: 16, borderWidth: 1, borderColor: '#e9ecef' },
  button: { backgroundColor: '#007AFF', borderRadius: 12, padding: 16, alignItems: 'center', marginTop: 8 },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  linkText: { color: '#007AFF', textAlign: 'center', fontSize: 14 },
});