import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import TabNavigator from './TabNavigator';
import PlayerScreen from '../screens/PlayerScreen';
import QueueScreen from '../screens/QueueScreen';
import AlbumDetailsScreen from '../screens/AlbumDetailsScreen';
import { Album } from '../services/api';

export type RootStackParamList = {
  MainTabs: undefined;
  Player: undefined;
  Queue: undefined;
  AlbumDetails: { album: Album };
};

const Stack = createStackNavigator<RootStackParamList>();

const RootNavigator: React.FC = () => {
  return (
    <Stack.Navigator initialRouteName="MainTabs">
      <Stack.Screen name="MainTabs" component={TabNavigator} options={{ headerShown: false }} />
      <Stack.Screen
        name="Player"
        component={PlayerScreen}
        options={{ presentation: 'modal' }}
      />
      <Stack.Screen name="Queue" component={QueueScreen} />
      <Stack.Screen name="AlbumDetails" component={AlbumDetailsScreen} options={{ headerShown: false }} />
    </Stack.Navigator>
  );
};

export default RootNavigator;