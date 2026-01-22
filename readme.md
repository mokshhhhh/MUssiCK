🎵 MUssiCK App
A premium, full-featured music streaming application built with React Native (Expo). MUssiCK offers a seamless audio experience with a modern UI, real-time player synchronization, and a robust backend integration for fetching high-quality metadata.

🚀 Key Features
Smart Home Feed:

Infinite Pagination: Seamlessly loads more songs as you scroll without performance drops.

Dynamic Suggestions: "Suggested" tab featuring trending artists, albums, and recently played tracks.

Real-time Sorting: Sort songs by Title, Artist, or Date instantly.

Advanced Audio Engine:

Background Playback: Music keeps playing when the app is minimized or the screen is locked.

Global Mini-Player: A persistent floating player visible across all tabs (Home, Search, Library).

Queue System: View upcoming tracks and manage your listening session.

Data Persistence (The "Memory"):

Favorites & Playlists: Your liked songs and custom playlists are saved locally using AsyncStorage, persisting even after you close the app.

Theme Memory: Remembers your preference for Dark/Light mode.

Robust Search & API:

Polite Fetching: Custom API service with request throttling (queuing) to prevent rate-limiting errors from public APIs.

Multi-Category Search: Search specifically for Songs, Albums, or Artists.

🛠 Tech Stack
Core Framework
React Native (Expo): For cross-platform compatibility and rapid development.

TypeScript: Ensuring type safety and fewer runtime bugs across the codebase.

State Management & Architecture
Zustand: Chosen over Redux for its simplicity and speed.

useMusicStore: Manages the "Brain" of the app (Current Track, Queue, Playing State).

persist Middleware: Automatically syncs Favorites and Playlists to the device's storage.

React Navigation: Nested navigation architecture handling the Bottom Tabs and the slide-up Modal Player.

Audio & Performance
React Native Track Player: The industry standard for handling native audio playback, background events, and lock-screen controls.

FlatList Optimization: Implemented with onEndReached thresholds for efficient memory usage during infinite scrolling.

🏗 Architecture Overview
The app follows a Service-Oriented Architecture to keep logic clean and separated:

The UI Layer (Screens):

Components like HomeScreen.tsx are "dumb" regarding data fetching details. They simply ask the Store or API service for data and render it.

The State Layer (Zustand Stores):

Acts as the single source of truth. When you press "Play" on a song, the Store updates the currentTrack state, which immediately updates the Mini-Player and the Full-Screen Player simultaneously.

The Service Layer (api.ts):

A custom networking layer that acts as a bridge between the app and the JioSaavn API.

Feature: Includes a "Global Request Queue" to throttle requests, preventing "Error 1027" (Rate Limiting) by ensuring requests are processed sequentially with a polite delay.

⚡️ Getting Started
To run this project locally, follow these steps:

1. Installation
Clone the repository and install the dependencies:

Bash
git clone https://github.com/your-username/mussick.git
cd mussick
npm install
2. Setup Environment
Ensure you have the Android/iOS development environment set up.

Android: Android Studio with an Emulator running.

iOS: Xcode (Mac only).

3. Run the App
Start the Metro Bundler and launch on your device:

Bash
# For Android
npx expo run:android

# For iOS
npx expo run:ios

⚠️ API Disclaimer
This project uses a third-party API for educational and demonstration purposes.

Primary Source: saavn.sumit.co (Stable)