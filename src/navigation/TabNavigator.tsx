import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Feather } from '@expo/vector-icons';
import HomeScreen from '../screens/HomeScreen';
import SearchScreen from '../screens/SearchScreen';
import PlaylistsScreen from '../screens/PlaylistsScreen';
import SettingsScreen from '../screens/SettingsScreen';

const TabNavigator: React.FC = () => {
  const [activeTab, setActiveTab] = useState('Home');
  const [homeKey, setHomeKey] = useState(0);

  const renderScreen = () => {
    switch (activeTab) {
      case 'Home':
        return <HomeScreen key="home" />;
      case 'Search':
        return <SearchScreen key="search" />;
      case 'Playlists':
        return <PlaylistsScreen key="playlists" />;
      case 'Settings':
        return <SettingsScreen key="settings" />;
      default:
        return <HomeScreen key="home" />;
    }
  };

  const tabs = [
    { name: 'Home', icon: 'home' },
    { name: 'Search', icon: 'search' },
    { name: 'Playlists', icon: 'book' },
    { name: 'Settings', icon: 'settings' },
  ];

  return (
    <View style={styles.container}>
      <View style={styles.screenContainer}>
        {renderScreen()}
      </View>
      <View style={styles.tabBar}>
        {tabs.map((tab) => (
          <TouchableOpacity
            key={tab.name}
            style={styles.tab}
            onPress={() => setActiveTab(tab.name)}
          >
            <Feather
              name={tab.icon as any}
              size={20}
              color={activeTab === tab.name ? '#333333' : '#A0A0A0'}
            />
            <Text style={[styles.label, activeTab === tab.name && styles.activeLabel]}>
              {tab.name}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  screenContainer: {
    flex: 1,
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: '#FFF',
    height: 60,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  tab: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  label: {
    fontSize: 12,
    color: '#A0A0A0',
  },
  activeLabel: {
    color: '#333333',
  },
});

export default TabNavigator;