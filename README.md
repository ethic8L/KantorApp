# Mobile Currency Exchange System (Kantor Walutowy)

A full-stack mobile application for currency exchange, developed as a university final project. The system consists of a React Native (Expo) mobile app, a Node.js/Express Web Service, and a MongoDB database. Exchange rates are fetched directly from the official National Bank of Poland (NBP) API.

---

## 📱 Features

### Mobile App (Frontend)
- **Authentication:** Secure user registration and login.
- **Virtual Top-up:** Simulated account funding (virtual bank transfer).
- **Live Exchange Rates:** View current currency rates fetched from NBP API.
- **Historical Charts:** Interactive line charts showing currency rate trends over the last 30 days (Extra feature).
- **Currency Exchange:** Buy and sell currencies based on real-time rates.
- **Wallet & History:** View current wallet balances and detailed transaction history with the exact exchange rate used at the time of transaction.
- **Modern UI:** Clean, intuitive, and responsive user interface.

### Web Service (Backend)
- **Business Logic:** All wallet balances and exchange operations are handled exclusively on the server side.
- **Security:** Passwords are hashed using `bcryptjs`. API endpoints are protected using JSON Web Tokens (JWT).
- **NBP Integration:** Fetches and caches current and historical exchange rates from the NBP API over HTTPS.
- **Data Consistency:** Exchange operations are wrapped in MongoDB transactions to ensure atomicity (no data corruption if an error occurs).
- **Historical Data Integrity:** The exchange rate is permanently stored within the transaction document. Future rate changes do not affect past transactions.

---

## 🛠 Tech Stack

- **Frontend:** React Native, Expo, Expo Router, TypeScript, React Native Chart Kit.
- **Backend:** Node.js, Express.js, Mongoose, JSON Web Tokens (JWT), Bcrypt.js.
- **Database:** MongoDB.
- **External API:** NBP API (Narodowy Bank Polski).

---

## 🚀 Getting Started

Follow these steps to run the project locally.

### Prerequisites
- Node.js (LTS version recommended)
- Expo Go app installed on your physical mobile device (Android/iOS) OR an emulator.
- A MongoDB database (local instance or a free MongoDB Atlas cluster).
- The mobile device and the computer running the backend must be on the **same Wi-Fi network**.

### 1. Backend Setup (Web Service)

1. Navigate to the backend directory:
   ```bash
   cd src/backend
