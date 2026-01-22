import 'react-native-gesture-handler';
import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import TrackPlayer from 'react-native-track-player';
import RootNavigator from './src/navigation/RootNavigator';
import MiniPlayer from './src/components/MiniPlayer';
import PlayerScreen from './src/screens/PlayerScreen';
import { useMusicStore } from './src/store/useMusicStore';

function AppContent() {
  const { isPlayerVisible, setPlayerVisible } = useMusicStore();

  return (
    <>
      <RootNavigator />
      <MiniPlayer />
      <PlayerScreen 
        visible={isPlayerVisible} 
        onClose={() => setPlayerVisible(false)} 
      />
      <StatusBar style="auto" />
    </>
  );
}

export default function App() {
  useEffect(() => {
    const setup = async () => {
      try {
        await TrackPlayer.setupPlayer();
        console.log("Track Player Ready");
      } catch (e) {
        console.log("Player already setup");
      }
    };
    setup();
  }, []);

  return (
    <SafeAreaProvider>
      <NavigationContainer>
        <AppContent />
      </NavigationContainer>
    </SafeAreaProvider>
  );
}
