import React, { useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  Image,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Platform,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useMusicStore } from '../store/useMusicStore';
import { Track } from 'react-native-track-player';

const FavoritesScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  
  // Add debug log at very top
  console.log("FavoritesScreen is rendering...");
  
  // Standard selector (reacts to changes)
  const favorites = useMusicStore((state) => state.favorites);
  const playTrack = useMusicStore((state) => state.playTrack);
  
  // Add a log to see if it receives updates
  console.log("Favorites Screen Rendered with:", favorites.length);

  const handlePlaySong = async (track: Track) => {
    console.log('FavoritesScreen - Playing song:', track);
    try {
      await playTrack(track);
    } catch (error) {
      Alert.alert('Error', 'Failed to play song');
    }
  };

  const renderSongItem = ({ item }: { item: Track }) => (
    <TouchableOpacity style={styles.songCard} onPress={() => handlePlaySong(item)}>
      <Image source={{ uri: item.artwork }} style={styles.artwork} />
      <View style={styles.songInfo}>
        <Text style={styles.title} numberOfLines={1}>
          {item.title}
        </Text>
        <Text style={styles.artist} numberOfLines={1}>
          {item.artist}
        </Text>
      </View>
      <TouchableOpacity style={styles.playButton}>
        <Text style={styles.playIcon}>▶</Text>
      </TouchableOpacity>
    </TouchableOpacity>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyIcon}>♡</Text>
      <Text style={styles.emptyTitle}>No favorites added yet.</Text>
      <TouchableOpacity 
        style={styles.exploreButton}
        onPress={() => navigation.navigate('Songs')}
      >
        <Text style={styles.exploreButtonText}>Explore Songs</Text>
      </TouchableOpacity>
    </View>
  );

  // Fail-safe: Always return something visible
  if (favorites.length === 0) {
    console.log("Rendering empty state");
    return renderEmptyState();
  }

  console.log("Rendering favorites list with", favorites.length, "items");
  return (
    <View style={styles.container}>
      <Text style={styles.header}>Favorites</Text>
      <FlatList
        data={favorites}
        keyExtractor={(item) => item.id}
        renderItem={renderSongItem}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
    padding: 16,
    paddingTop: 50,
  },
  header: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 20,
  },
  listContainer: {
    paddingBottom: 20,
  },
  songCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  artwork: {
    width: 50,
    height: 50,
    borderRadius: 8,
    marginRight: 12,
  },
  songInfo: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  artist: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  playButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FF5733',
    justifyContent: 'center',
    alignItems: 'center',
  },
  playIcon: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  emptyIcon: {
    fontSize: 64,
    color: '#666',
    marginBottom: 20,
  },
  emptyTitle: {
    fontSize: 18,
    color: '#666',
    textAlign: 'center',
    marginBottom: 30,
  },
  exploreButton: {
    backgroundColor: '#FF5733',
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 25,
  },
  exploreButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default FavoritesScreen;
