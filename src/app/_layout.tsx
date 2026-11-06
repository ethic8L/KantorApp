import { Stack } from 'expo-router';

export default function RootLayout() {
  return (
    <Stack>
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen name="register" options={{ title: 'Rejestracja' }} />
      <Stack.Screen name="home" options={{ headerShown: false }} />
      <Stack.Screen name="exchange" options={{ title: 'Wymień walutę' }} />
      <Stack.Screen name="history" options={{ title: 'Historia' }} />
      {/* NOWY EKRAN: */}
      <Stack.Screen name="currency/[code]" options={{ headerShown: true }} /> 
    </Stack>
  );
}