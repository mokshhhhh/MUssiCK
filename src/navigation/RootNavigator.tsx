import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';

// 1. Import your Tab Navigator (This replaces just 'HomeScreen')
import TabNavigator from './TabNavigator';

// 2. Import the missing screens
import PlayerScreen from '../screens/PlayerScreen';
import QueueScreen from '../screens/QueueScreen';
import AlbumDetailsScreen from '../screens/AlbumDetailsScreen';
import ArtistDetailsScreen from '../screens/ArtistDetailsScreen';

// 3. Import types for your params
import { Album, Artist } from '../services/api';

export type RootStackParamList = {
  MainTabs: undefined; // The bottom tab bar
  Player: undefined;
  Queue: undefined;
  AlbumDetails: { album: Album };   // Needs an album object
  ArtistDetails: { artist: Artist }; // Needs an artist object
};

const Stack = createStackNavigator<RootStackParamList>();

const RootNavigator: React.FC = () => {
  return (
    // 4. Set 'MainTabs' as the starting screen
    <Stack.Navigator initialRouteName="MainTabs">
      
      {/* The Tab Navigator (Home, Search, Library) */}
      <Stack.Screen 
        name="MainTabs" 
        component={TabNavigator} 
        options={{ headerShown: false }} 
      />

      {/* The Modal Player */}
      <Stack.Screen 
        name="Player" 
        component={PlayerScreen} 
        options={{ 
          presentation: 'modal', // Makes it slide up like a card
          headerShown: false 
        }} 
      />

      {/* Other Screens */}
      <Stack.Screen name="Queue" component={QueueScreen} />
      
      <Stack.Screen 
        name="AlbumDetails" 
        component={AlbumDetailsScreen} 
        options={{ headerShown: false }} 
      />
      
      <Stack.Screen 
        name="ArtistDetails" 
        component={ArtistDetailsScreen} 
        options={{ headerShown: false }} 
      />

    </Stack.Navigator>
  );
};

export default RootNavigator;