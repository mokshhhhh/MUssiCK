# 🎵 MUssiCK App

![React Native](https://img.shields.io/badge/React_Native-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![Expo](https://img.shields.io/badge/Expo-1B1F23?style=for-the-badge&logo=expo&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)
![Zustand](https://img.shields.io/badge/Zustand-State_Management-764ABC?style=for-the-badge)

**MUssiCK** is a premium, full-featured music streaming application built with React Native (Expo). It offers a seamless audio experience with a modern UI, real-time player synchronization, and robust backend integration for fetching high-quality metadata.

---
### Architecture and Overview
<img width="1597" height="638" alt="ss1" src="https://github.com/user-attachments/assets/0db264ed-3ea2-475d-b306-29c969061a6d" />
<img width="1678" height="595" alt="ss2" src="https://github.com/user-attachments/assets/4f16fecd-98f4-4869-8969-e37714104980" />
<img width="380" height="367" alt="ss3" src="https://github.com/user-attachments/assets/c73da1a7-4f54-4d5f-b444-c0be4a9f9614" />




## 🚀 Key Features

### **1. Smart Home Feed**
- **Infinite Pagination:** Seamlessly loads more songs as you scroll (`onEndReached` optimization) without performance drops.
- **Dynamic Suggestions:** "Suggested" tab featuring trending artists, albums, and recently played tracks using complex data aggregation.
- **Real-time Sorting:** Sort songs by **Title**, **Artist**, or **Date** instantly on the client side.

### **2. Advanced Audio Engine**
- **Background Playback:** Powered by `react-native-track-player`, ensuring music keeps playing when the app is minimized or the screen is locked.
- **Global Mini-Player:** A persistent floating player visible across all tabs (Home, Search, Library) that syncs perfectly with the main player.
- **Queue System:** Full playlist management with capabilities to clear, view, and play upcoming tracks.

### **3. Data Persistence (The "Memory")**
- **Favorites & Playlists:** Your liked songs and custom playlists are saved locally using **AsyncStorage**, persisting even after you force-close the app.
- **Theme Memory:** Remembers your preference for Dark/Light mode automatically.

### **4. Robust Search & API**
- **Polite Fetching Engine:** A custom API service featuring a **Global Request Queue**. This throttles outgoing requests (e.g., 800ms delay) to prevent "Error 1027" (Rate Limiting) from public API servers.
- **Multi-Category Search:** Search specifically for Songs, Albums, or Artists with fallback logic for missing artwork.

---

## 🛠 Tech Stack

| Category | Technology | Reason for Choice |
| :--- | :--- | :--- |
| **Framework** | **React Native (Expo)** | Cross-platform compatibility and rapid iteration. |
| **Language** | **TypeScript** | Type safety to prevent runtime crashes and improve DX. |
| **State** | **Zustand** | Chosen over Redux for simplicity, speed, and boilerplate reduction. |
| **Navigation** | **React Navigation** | Complex Nested Navigation (Stack + Bottom Tabs) architecture. |
| **Audio** | **RN Track Player** | Industry standard for native audio event handling. |

---

## 🏗 Architecture Overview

The app follows a **Service-Oriented Architecture** to keep logic clean, maintainable, and separated from the UI.

### **1. The UI Layer (Screens)**
Components like `HomeScreen.tsx` are designed to be "dumb." They do not handle business logic; they simply request data from the Store or API Service and render the results.

### **2. The State Layer (Zustand Stores)**
The `useMusicStore` acts as the **Single Source of Truth** for the entire app.
- When you press "Play" on a song, the Store updates the `currentTrack` state.
- **Result:** The Mini-Player (on Home) and the Full-Screen Player update simultaneously without extra re-renders.
- **Persistence:** The `persist` middleware automatically serializes the `favorites` array to JSON and saves it to the device disk.

### **3. The Service Layer (`api.ts`)**
A custom networking bridge that abstracts away the complexity of the JioSaavn API.
- **Problem:** Public APIs often rate-limit apps that send too many requests at once.
- **Solution:** We implemented a `politeFetch` mechanism that queues promises. Even if the Home Screen requests 10 different artist images at once, the Service Layer forces them to execute one by one, ensuring high reliability.

---
## 📱 Download the App

Ready to try it out? Download the latest APK directly to your Android device:

[![Download APK](https://img.shields.io/badge/Download-APK-2E7D32?style=for-the-badge&logo=android&logoColor=white)](YOUR_EAS_BUILD_LINK_HERE)
## ⚡️ Getting Started

To run this project locally, follow these steps:

### **1. Installation**
Clone the repository and install the dependencies:
```bash
git clone [https://github.com/your-username/mussick.git](https://github.com/your-username/mussick.git)
cd mussick
npm install
```

###2. Setup Environment
Ensure you have the Android/iOS development environment set up.

Android: Android Studio with an Emulator running.

iOS: Xcode (Mac only).

###3. Run the App
Start the Metro Bundler and launch on your device:

Bash
# For Android
npx expo run:android

# For iOS
npx expo run:ios
