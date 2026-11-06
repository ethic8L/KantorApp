const API_URL = process.env.EXPO_PUBLIC_API_URL;

export async function login(username: string, password: string) {
  const res = await fetch(`${API_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password }),
  });
  if (!res.ok) throw new Error((await res.json()).error);
  return res.json() as Promise<{ token: string }>;
}

export async function getRates() {
  const res = await fetch(`${API_URL}/rates`);
  if (!res.ok) throw new Error("Błąd pobierania kursów");
  return res.json() as Promise<{
    rates: { code: string; currency: string; mid: number }[];
    effectiveDate: string;
  }>;
}

export async function deposit(token: string, amount: number) {
  const res = await fetch(`${API_URL}/wallet/deposit`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ amount }),
  });
  if (!res.ok) throw new Error((await res.json()).error);
  return res.json();
}

export async function getBalance(token: string) {
  const res = await fetch(`${API_URL}/wallet/balance`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error((await res.json()).error);
  return res.json() as Promise<{
    wallets: { currency: string; balance: number }[];
  }>;
}

export async function exchange(
  token: string,
  type: "BUY" | "SELL",
  fromCurrency: string,
  toCurrency: string,
  amount: number,
) {
  const res = await fetch(`${API_URL}/exchange`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ type, fromCurrency, toCurrency, amount }),
  });
  if (!res.ok) throw new Error((await res.json()).error);
  return res.json();
}

export async function getTransactions(token: string) {
  const res = await fetch(`${API_URL}/transactions`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error((await res.json()).error);
  return res.json() as Promise<{ transactions: any[] }>;
}

export async function getRateHistory(code: string) {
  const res = await fetch(`${API_URL}/rates/${code}/history`);
  if (!res.ok) throw new Error('Błąd pobierania historii kursów');
  return res.json() as Promise<{ code: string; history: { date: string; rate: number }[] }>;
}
