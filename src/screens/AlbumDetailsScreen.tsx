import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  Image,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import TrackPlayer from 'react-native-track-player';
import { Song, Album, getAlbumSongs } from '../services/api';

const { width } = Dimensions.get('window');

const AlbumDetailsScreen: React.FC = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { album }: { album: Album } = route.params as any;

  const [songs, setSongs] = useState<Song[]>([]);

  useEffect(() => {
    const fetchSongs = async () => {
      const fetchedSongs = await getAlbumSongs(album.id);
      setSongs(fetchedSongs);
    };
    fetchSongs();
  }, [album.id]);

  const shuffleArray = (array: Song[]) => {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  };

  const handleShuffle = async () => {
    const shuffled = shuffleArray(songs);
    await TrackPlayer.reset();
    await TrackPlayer.add(shuffled);
    await TrackPlayer.play();
  };

  const handlePlay = async () => {
    await TrackPlayer.reset();
    await TrackPlayer.add(songs);
    await TrackPlayer.play();
  };

  const renderSongItem = ({ item }: { item: Song }) => (
    <View style={styles.songItem}>
      <Image source={{ uri: item.artwork }} style={styles.songImage} />
      <View style={styles.songInfo}>
        <Text style={styles.songTitle} numberOfLines={1}>{item.title}</Text>
        <Text style={styles.songArtist} numberOfLines={1}>{item.artist}</Text>
      </View>
      <TouchableOpacity
        style={styles.playButton}
        onPress={async () => {
          await TrackPlayer.reset();
          await TrackPlayer.add(item);
          await TrackPlayer.play();
        }}
      >
        <Feather name="play" size={16} color="#FFF" />
      </TouchableOpacity>
    </View>
  );

  const ListHeaderComponent = () => (
    <View style={styles.heroContainer}>
      <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
        <Feather name="arrow-left" size={24} color="#000" />
      </TouchableOpacity>
      <Image source={{ uri: album.artwork }} style={styles.heroImage} />
      <Text style={styles.heroTitle}>{album.title}</Text>
      <Text style={styles.heroArtist}>{album.artist}</Text>
      <Text style={styles.heroMeta}>
        1 Album • {songs.length} Songs • 45 mins
      </Text>
      <View style={styles.buttonRow}>
        <TouchableOpacity style={styles.shuffleButton} onPress={handleShuffle}>
          <Feather name="shuffle" size={20} color="#FFF" />
          <Text style={styles.shuffleButtonText}>Shuffle</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.playButtonPill} onPress={handlePlay}>
          <Feather name="play-circle" size={20} color="#FF5733" />
          <Text style={styles.playButtonText}>Play</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        data={songs}
        keyExtractor={(item) => item.id}
        renderItem={renderSongItem}
        ListHeaderComponent={ListHeaderComponent}
        contentContainerStyle={styles.listContent}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF',
  },
  listContent: {
    paddingBottom: 20,
  },
  heroContainer: {
    alignItems: 'center',
    paddingTop: 50,
    paddingHorizontal: 20,
    paddingBottom: 30,
  },
  backButton: {
    position: 'absolute',
    top: 50,
    left: 20,
    padding: 10,
  },
  heroImage: {
    width: 250,
    height: 250,
    borderRadius: 12,
    alignSelf: 'center',
    marginTop: 60,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 6,
    elevation: 10,
  },
  heroTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000',
    textAlign: 'center',
    marginTop: 20,
  },
  heroArtist: {
    fontSize: 18,
    color: '#666',
    textAlign: 'center',
    marginTop: 5,
  },
  heroMeta: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
    marginTop: 10,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 20,
    marginVertical: 25,
  },
  shuffleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FF5733',
    paddingVertical: 12,
    paddingHorizontal: 35,
    borderRadius: 30,
  },
  shuffleButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  playButtonPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF0E6',
    paddingVertical: 12,
    paddingHorizontal: 35,
    borderRadius: 30,
  },
  playButtonText: {
    color: '#FF5733',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  songItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  songImage: {
    width: 50,
    height: 50,
    borderRadius: 12,
    marginRight: 15,
  },
  songInfo: {
    flex: 1,
  },
  songTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  songArtist: {
    fontSize: 14,
    color: '#666',
  },
  playButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#FF5733',
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default AlbumDetailsScreen;