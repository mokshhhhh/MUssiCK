import React, { useEffect, useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  Image, 
  FlatList, 
  TouchableOpacity, 
  ActivityIndicator, 
  Dimensions, 
  StatusBar 
} from 'react-native';
import { RouteProp, useRoute, useNavigation } from '@react-navigation/native';
import { Feather } from '@expo/vector-icons';
import { getAlbumSongs, Album, Song } from '../services/api';
import { useMusicStore } from '../store/useMusicStore';

// Get screen dimensions for the blurred image
const { width, height } = Dimensions.get('window');

type ParamList = {
  AlbumDetails: { album: Album };
};

const AlbumDetailsScreen = () => {
  const route = useRoute<RouteProp<ParamList, 'AlbumDetails'>>();
  const navigation = useNavigation();
  const { album } = route.params;
  const { playTrack, setQueue } = useMusicStore();

  const [songs, setSongs] = useState<Song[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSongs();
  }, [album.id]);

  const fetchSongs = async () => {
    const data = await getAlbumSongs(album.id);
    setSongs(data);
    setLoading(false);
  };

  const handlePlayAll = () => {
    if (songs.length > 0) {
      setQueue(songs);   // Set the whole album as queue
      playTrack(songs[0]); // Play first song
    }
  };

  const handleShuffleAll = () => {
    if (songs.length > 0) {
      // Create a shuffled copy of the songs array
      const shuffledSongs = [...songs].sort(() => Math.random() - 0.5);
      setQueue(shuffledSongs);   // Set the shuffled album as queue
      playTrack(shuffledSongs[0]); // Play first song from shuffled list
    }
  };

  // Helper: Convert seconds to "MM:SS"
  const formatDuration = (seconds: number) => {
    if (!seconds) return '--:--';
    const min = Math.floor(seconds / 60);
    const sec = Math.floor(seconds % 60);
    return `${min}:${sec < 10 ? '0' : ''}${sec}`;
  };

  const renderSongItem = ({ item, index }: { item: Song; index: number }) => (
    <TouchableOpacity style={styles.songRow} onPress={() => playTrack(item)}>
      <Text style={styles.songIndex}>{index + 1}</Text>
      <View style={styles.songInfo}>
        <Text style={styles.songTitle} numberOfLines={1}>{item.title}</Text>
        <Text style={styles.songArtist} numberOfLines={1}>{item.artist}</Text>
      </View>
      <Text style={styles.songDuration}>{formatDuration(item.duration)}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFF" />

      {/* Header (Back Button) */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Feather name="arrow-left" size={24} color="#333" />
        </TouchableOpacity>
      </View>

      {/* Main Content */}
      <FlatList
        data={songs}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={() => (
          <View style={styles.topSection}>
            {/* Album Art */}
            <Image source={{ uri: album.artwork }} style={styles.mainArtwork} />
            
            {/* Album Title */}
            <Text style={styles.albumTitle}>{album.title}</Text>
            <Text style={styles.albumArtist}>
              {album.artist} • {album.year === 'Unknown' ? '' : album.year}
            </Text>

            {/* Play and Shuffle Buttons */}
            <View style={styles.buttonRow}>
              <TouchableOpacity style={styles.shuffleButton} onPress={handleShuffleAll}>
                <Feather name="shuffle" size={20} color="#FF5733" />
                <Text style={styles.shuffleButtonText}>Shuffle</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.playButton} onPress={handlePlayAll}>
                <Feather name="play" size={20} color="#FFF" />
                <Text style={styles.playButtonText}>Play</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
        renderItem={renderSongItem}
        contentContainerStyle={styles.listContent}
        ListFooterComponent={
            loading ? <ActivityIndicator color="#FF5733" style={{ marginTop: 20 }} /> : <View style={{ height: 100 }} />
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    paddingTop: 50,
    paddingHorizontal: 20,
    zIndex: 10,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    borderRadius: 20,
  },
  listContent: {
    paddingBottom: 120, // Space for miniplayer
  },
  topSection: {
    alignItems: 'center',
    paddingTop: 20,
    paddingBottom: 30,
    paddingHorizontal: 20,
  },
  mainArtwork: {
    width: 220,
    height: 220,
    borderRadius: 12,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 10,
  },
  albumTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginBottom: 8,
  },
  albumArtist: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 20,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 20,
    marginTop: 10,
  },
  shuffleButton: {
    flexDirection: 'row',
    backgroundColor: '#FFF0E6',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 30,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#FF5733',
  },
  shuffleButtonText: {
    color: '#FF5733',
    fontWeight: 'bold',
    fontSize: 16,
    marginLeft: 8,
  },
  playButton: {
    flexDirection: 'row',
    backgroundColor: '#FF5733',
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderRadius: 30,
    alignItems: 'center',
    shadowColor: "#FF5733",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 5,
  },
  playButtonText: {
    color: '#FFF',
    fontWeight: 'bold',
    fontSize: 16,
    marginLeft: 8,
  },
  songRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  songIndex: {
    color: '#AAA',
    width: 30,
    fontSize: 14,
  },
  songInfo: {
    flex: 1,
  },
  songTitle: {
    color: '#333',
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 4,
  },
  songArtist: {
    color: '#888',
    fontSize: 12,
  },
  songDuration: {
    color: '#AAA',
    fontSize: 12,
  },
});

export default AlbumDetailsScreen;