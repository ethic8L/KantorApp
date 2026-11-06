import { Stack } from 'expo-router';

export default function RootLayout() {
  return (
    <Stack>
      <Stack.Screen name="index" options={{ title: 'Logowanie', headerShown: false }} />
      <Stack.Screen name="home" options={{ title: 'Kantor' }} />
      <Stack.Screen name="exchange" options={{ title: 'Wymiana walut' }} />
      <Stack.Screen name="history" options={{ title: 'Historia transakcji' }} />
      <Stack.Screen name="register" options={{ title: 'Rejestracja' }} />
    </Stack>
  );
}