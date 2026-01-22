import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Image,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  ActivityIndicator,
  Dimensions,
  Platform,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Artist, Song, Album, searchAlbums } from '../services/api';
import { useMusicStore } from '../store/useMusicStore';

const logo = require('../../assets/musik.png');
const { width } = Dimensions.get('window');

type RouteParams = {
  artist: Artist;
};

const ArtistDetailsScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const route = useRoute();
  const { artist } = route.params as RouteParams;
  const { playTrack } = useMusicStore();
  const [songs, setSongs] = useState<Song[]>([]);
  const [albums, setAlbums] = useState<Album[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingAlbums, setLoadingAlbums] = useState(true);

  useEffect(() => {
    // Load artist's songs and albums
    loadArtistData();
  }, [artist]);

  const loadArtistData = async () => {
    try {
      setLoading(true);
      setLoadingAlbums(true);

      // Load artist's songs (using search as placeholder)
      const songsResponse = await fetch(`https://saavn.sumit.co/api/search/songs?query=${encodeURIComponent(artist.name)}`);
      const songsData = await songsResponse.json();
      const songsResults = songsData.data?.results || songsData.results || [];
      
      // Filter songs to only include those by this artist
      const artistSongs = songsResults.filter((song: any) => 
        song.artist?.toLowerCase() === artist.name.toLowerCase() ||
          song.primaryArtists?.toLowerCase().includes(artist.name.toLowerCase())
      );
      
      setSongs(artistSongs.map((item: any) => ({
        id: item.id,
        title: item.title || item.name,
        artist: item.artist || item.primaryArtists,
        artwork: item.image?.[item.image.length - 1]?.link || item.image || 'https://placehold.co/300x300.png',
        url: item.downloadUrl?.[item.downloadUrl.length - 1]?.link || item.url,
      })));

      // Load artist's albums
      const albumsData = await searchAlbums(artist.name);
      setAlbums(albumsData);

    } catch (error) {
      console.error('Error loading artist data:', error);
    } finally {
      setLoading(false);
      setLoadingAlbums(false);
    }
  };

  const handlePlaySong = (song: Song) => {
    playTrack(song);
  };

  const handleAlbumPress = (album: Album) => {
    navigation.navigate('AlbumDetails', { album });
  };

  const renderSongItem = ({ item }: { item: Song }) => (
    <TouchableOpacity 
      style={styles.songItem}
      onPress={() => handlePlaySong(item)}
    >
      <Image 
        source={{ uri: item.artwork }} 
        style={styles.songArtwork} 
      />
      <View style={styles.songInfo}>
        <Text style={styles.songTitle} numberOfLines={1}>
          {item.title}
        </Text>
        <Text style={styles.songArtist} numberOfLines={1}>
          {item.artist}
        </Text>
      </View>
      <TouchableOpacity style={styles.playButton}>
        <Feather name="play" size={20} color="#FF5733" />
      </TouchableOpacity>
    </TouchableOpacity>
  );

  const renderAlbumItem = ({ item }: { item: Album }) => (
    <TouchableOpacity 
      style={styles.albumCard}
      onPress={() => handleAlbumPress(item)}
    >
      <Image source={{ uri: item.artwork }} style={styles.albumImage} />
      <View style={styles.albumInfo}>
        <Text style={styles.albumTitle} numberOfLines={1}>{item.title}</Text>
        <Text style={styles.albumYear} numberOfLines={1}>{item.year}</Text>
        <Text style={styles.albumSongs}>{item.songsCount} songs</Text>
      </View>
    </TouchableOpacity>
  );

  const renderHeader = () => (
    <View style={styles.headerSection}>
      <View style={styles.artistHeader}>
        <Image 
          source={{ uri: artist.artwork }} 
          style={styles.artistImage} 
        />
        <View style={styles.artistInfo}>
          <Text style={styles.artistName}>{artist.name}</Text>
          <Text style={styles.artistStats}>
            {artist.songsCount || 0} Songs • {artist.albumsCount || 0} Albums
          </Text>
          <TouchableOpacity style={styles.followButton}>
            <Feather name="plus" size={16} color="#FF5733" />
            <Text style={styles.followButtonText}>Follow</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Popular Songs</Text>
      </View>
    </View>
  );

  const renderAlbumsHeader = () => (
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionTitle}>Albums</Text>
    </View>
  );

  if (loading || loadingAlbums) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor="#F5F5F5" />
        <View style={styles.fixedTop}>
          <View style={styles.headerContainer}>
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
              <Feather name="arrow-left" size={24} color="#333" />
            </TouchableOpacity>
            <Image source={logo} style={styles.logo} />
          </View>
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#FF5733" />
          <Text style={styles.loadingText}>Loading artist data...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#F5F5F5" />
      <View style={styles.fixedTop}>
        <View style={styles.headerContainer}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Feather name="arrow-left" size={24} color="#333" />
          </TouchableOpacity>
          <Image source={logo} style={styles.logo} />
        </View>
      </View>

      <FlatList
        data={songs}
        keyExtractor={(item) => item.id}
        renderItem={renderSongItem}
        ListHeaderComponent={renderHeader}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContainer}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Feather name="music" size={48} color="#CCC" />
            <Text style={styles.emptyText}>No songs found</Text>
            <Text style={styles.emptySubText}>This artist doesn't have any songs available</Text>
          </View>
        }
      />

      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Albums</Text>
      </View>
      
      <FlatList
        data={albums}
        keyExtractor={(item) => item.id}
        renderItem={renderAlbumItem}
        numColumns={2}
        columnWrapperStyle={styles.albumGrid}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContainer}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Feather name="disc" size={48} color="#CCC" />
            <Text style={styles.emptyText}>No albums found</Text>
            <Text style={styles.emptySubText}>This artist doesn't have any albums available</Text>
          </View>
        }
        ListFooterComponent={<View style={{ height: 100 }} />}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  fixedTop: {
    backgroundColor: '#F5F5F5',
    paddingTop: Platform.OS === 'android' ? 50 : 60,
    paddingHorizontal: 16,
  },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  backButton: {
    padding: 8,
  },
  logo: {
    width: 100,
    height: 40,
    resizeMode: 'contain',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#888',
  },
  headerSection: {
    backgroundColor: '#FFF',
    marginBottom: 10,
  },
  artistHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
  },
  artistImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginRight: 16,
  },
  artistInfo: {
    flex: 1,
  },
  artistName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  artistStats: {
    fontSize: 16,
    color: '#888',
    marginBottom: 12,
  },
  followButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FF5733',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    alignSelf: 'flex-start',
  },
  followButtonText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 6,
  },
  sectionHeader: {
    backgroundColor: '#FFF',
    paddingHorizontal: 20,
    paddingBottom: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  listContainer: {
    paddingHorizontal: 16,
  },
  songItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginBottom: 8,
    borderRadius: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  songArtwork: {
    width: 50,
    height: 50,
    borderRadius: 8,
    marginRight: 12,
  },
  songInfo: {
    flex: 1,
  },
  songTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  songArtist: {
    fontSize: 14,
    color: '#888',
  },
  playButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFF',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#FF5733',
  },
  albumCard: {
    width: (width / 2) - 20,
    backgroundColor: '#FFF',
    marginBottom: 16,
    borderRadius: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  albumImage: {
    width: '100%',
    height: (width / 2) - 20,
    borderRadius: 8,
  },
  albumInfo: {
    padding: 12,
  },
  albumTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  albumYear: {
    fontSize: 14,
    color: '#888',
    marginBottom: 4,
  },
  albumSongs: {
    fontSize: 12,
    color: '#666',
  },
  albumGrid: {
    justifyContent: 'space-between',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#888',
    marginTop: 12,
  },
  emptySubText: {
    fontSize: 14,
    color: '#AAA',
    marginTop: 4,
    textAlign: 'center',
  },
});

export default ArtistDetailsScreen;
