import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  Image,
  StyleSheet,
  Dimensions,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Modal,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import TrackPlayer from 'react-native-track-player';
import { useNavigation } from '@react-navigation/native';
import { RootStackParamList } from '../navigation/RootNavigator';
import { searchSongs, Song, Album, searchAlbums, getAlbumSongs, searchArtists, Artist } from '../services/api';
import { useMusicStore } from '../store/useMusicStore';
import SongMenuModal from '../components/SongMenuModal';

const logo = require('../../assets/musik.png');

const { width } = Dimensions.get('window');

const HomeScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const { playTrack } = useMusicStore();
  
  const [activeTab, setActiveTab] = useState('Suggested');
  const tabs = ['Suggested', 'Songs', 'Albums', 'Artists'];

  // --- State ---
  const [allSongs, setAllSongs] = useState<Song[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [menuVisible, setMenuVisible] = useState(false);
  const [selectedSong, setSelectedSong] = useState<Song | null>(null);
  const [filterVisible, setFilterVisible] = useState(false);
  
  const [sortBy, setSortBy] = useState('title');
  const [sortOrder, setSortOrder] = useState('asc');
  const [sortedSongs, setSortedSongs] = useState<Song[]>([]);
  
  const [allAlbums, setAllAlbums] = useState<Album[]>([]);
  const [albumSortBy, setAlbumSortBy] = useState('year');
  const [albumSortOrder, setAlbumSortOrder] = useState('desc');
  const [sortedAlbums, setSortedAlbums] = useState<Album[]>([]);
  const [selectedAlbum, setSelectedAlbum] = useState<Album | null>(null);
  const [albumSongs, setAlbumSongs] = useState<Song[]>([]);
  
  const [artists, setArtists] = useState<Artist[]>([]);

  // Pagination State (For Songs Tab)
  const [page, setPage] = useState(1);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasMoreData, setHasMoreData] = useState(true);

  // Real Data State (For Suggested Tab)
  const [recentlyPlayed, setRecentlyPlayed] = useState<Song[]>([]);
  const [suggestedArtists, setSuggestedArtists] = useState<Artist[]>([]);
  const [trendingAlbums, setTrendingAlbums] = useState<Album[]>([]);

  // --- 1. Pagination Logic for Songs Tab ---
  const loadSongs = async (pageNum: number) => {
    if (isLoadingMore) return;
    setIsLoadingMore(true);

    try {
      const newSongs = await searchSongs('Hindi', pageNum, 20);
      
      if (newSongs.length > 0) {
        if (pageNum === 1) {
          setAllSongs(newSongs);
        } else {
          setAllSongs(prev => [...prev, ...newSongs]);
        }
        setTotalCount(prev => (pageNum === 1 ? newSongs.length : prev + newSongs.length)); 
      } else {
        setHasMoreData(false);
      }
    } catch (error) {
      console.error("Error loading songs:", error);
    } finally {
      setIsLoadingMore(false);
    }
  };

  const handleLoadMore = () => {
    if (!isLoadingMore && hasMoreData) {
      const nextPage = page + 1;
      setPage(nextPage);
      loadSongs(nextPage);
    }
  };

  useEffect(() => {
    loadSongs(1);
  }, []);

  // --- 2. Sorting Logic ---
  const applySort = (songs: Song[], criterion: string, order: string) => {
    const sorted = [...songs].sort((a, b) => {
      let valA = criterion === 'artist' ? a.artist : a.title;
      let valB = criterion === 'artist' ? b.artist : b.title;

      valA = valA ? valA.toLowerCase() : '';
      valB = valB ? valB.toLowerCase() : '';

      if (valA < valB) return order === 'asc' ? -1 : 1;
      if (valA > valB) return order === 'asc' ? 1 : -1;
      return 0;
    });
    return sorted;
  };

  const sortAlbums = (albums: Album[], criterion: string, order: string) => {
    const sorted = [...albums].sort((a, b) => {
      let valA, valB;
      if (criterion === 'year') {
        valA = parseInt(a.year) || 0;
        valB = parseInt(b.year) || 0;
      } else {
        valA = criterion === 'artist' ? a.artist : a.title;
        valB = criterion === 'artist' ? b.artist : b.title;
        valA = valA ? valA.toLowerCase() : '';
        valB = valB ? valB.toLowerCase() : '';
      }

      if (valA < valB) return order === 'asc' ? -1 : 1;
      if (valA > valB) return order === 'asc' ? 1 : -1;
      return 0;
    });
    return sorted;
  };

  useEffect(() => {
    const sorted = applySort(allSongs, sortBy, sortOrder);
    setSortedSongs(sorted);
  }, [allSongs, sortBy, sortOrder]);

  useEffect(() => {
    const sorted = sortAlbums(allAlbums, albumSortBy, albumSortOrder);
    setSortedAlbums(sorted);
  }, [allAlbums, albumSortBy, albumSortOrder]);

  // --- 3. Tab Specific Data Fetching ---
  useEffect(() => {
    if (activeTab === 'Albums' && allAlbums.length === 0) {
      const fetchAlbums = async () => {
        const response = await searchAlbums('Hindi');
        setAllAlbums(response.slice(0, 20));
      };
      fetchAlbums();
    }
  }, [activeTab]);

  useEffect(() => {
    if (activeTab === 'Artists' && artists.length === 0) {
      // UPDATED: Fetch 25 Specific Popular Artists (Ensures Images & Quality)
      const fetchArtistsData = async () => {
        const popularArtists = [
          'Arijit Singh', 'Shreya Ghoshal', 'The Weeknd', 'Taylor Swift', 
          'Diljit Dosanjh', 'Badshah', 'Neha Kakkar', 'Atif Aslam',
          'Sonu Nigam', 'Sunidhi Chauhan', 'Drake', 'BTS', 
          'Justin Bieber', 'Ed Sheeran', 'Guru Randhawa', 'Jubin Nautiyal', 
          'Udit Narayan', 'Alka Yagnik', 'Kumar Sanu', 'Darshan Raval',
          'Mika Singh', 'Yo Yo Honey Singh', 'Kishore Kumar', 'Lata Mangeshkar', 'Armaan Malik'
        ];

        let foundArtists: Artist[] = [];
        
        // Fetch in parallel for speed, but process individually
        // Note: We search for specific names, so we expect high quality results
        for (const name of popularArtists) {
            try {
                const results = await searchArtists(name);
                if (results && results.length > 0) {
                    // Prefer exact matches or those with valid artwork
                    const validArtist = results.find(a => a.artwork && a.artwork.trim() !== '') || results[0];
                    if (validArtist) {
                        foundArtists.push(validArtist);
                    }
                }
            } catch (e) {
                console.log(`Failed to fetch artist: ${name}`);
            }
        }
        
        // Remove duplicate IDs just in case
        const uniqueArtists = foundArtists.filter((artist, index, self) => 
          index === self.findIndex((a) => a.id === artist.id)
        );
        
        setArtists(uniqueArtists);
      };
      fetchArtistsData();
    }
  }, [activeTab]);

  // --- 4. Suggested Tab Real Data ---
  useEffect(() => {
    const fetchSuggestedData = async () => {
      try {
        const weekndSongs = await searchSongs('Starboy The Weeknd');
        const arijitSongs = await searchSongs('Arijit Singh');
        const combinedRecent = [...(weekndSongs.slice(0, 1)), ...(arijitSongs.slice(0, 4))];
        setRecentlyPlayed(combinedRecent);

        // Specific artists for Suggested widget (Horizontal)
        const targetArtists = ['Arijit Singh', 'Pritam', 'Badshah', 'Jonita Gandhi', 'Eminem', 'The Weeknd', 'Javed Ali', 'Sonu Nigam'];
        let foundArtists: Artist[] = [];
        for (const name of targetArtists) {
          try {
            const results = await searchArtists(name);
            if (results && results.length > 0) {
                const bestMatch = results.find(a => a.artwork && a.artwork.trim() !== '') || results[0];
                foundArtists.push(bestMatch);
            }
          } catch (e) { console.log(e); }
        }
        setSuggestedArtists(foundArtists);

        const albumsResponse = await searchAlbums('Trending');
        setTrendingAlbums(albumsResponse.slice(0, 8));
        
      } catch (error) {
        console.error('Error fetching suggested data:', error);
      }
    };

    if (activeTab === 'Suggested' && recentlyPlayed.length === 0) {
      fetchSuggestedData();
    }
  }, [activeTab]);

  const fetchAlbumSongs = async (albumId: string) => {
    const songs = await getAlbumSongs(albumId);
    setAlbumSongs(songs);
  };

  // --- Render Functions ---

  const renderRecentlyPlayed = ({ item }: { item: Song }) => (
    <TouchableOpacity style={styles.recentCard} onPress={() => playTrack(item)}>
      <Image source={{ uri: item.artwork }} style={styles.recentImage} />
      <Text style={styles.recentTitle} numberOfLines={1}>{item.title}</Text>
      <Text style={styles.recentArtist} numberOfLines={1}>{item.artist}</Text>
    </TouchableOpacity>
  );

  const renderArtistHorizontal = ({ item }: { item: Artist }) => (
    <TouchableOpacity style={styles.artistCard} onPress={() => navigation.navigate('ArtistDetails', { artist: item })}>
      <Image 
        source={{ uri: item.artwork || item.image?.[2]?.link || item.image?.[0]?.link || 'https://placehold.co/100x100/FF5733/ffffff?text=A' }} 
        style={styles.artistImage}
      />
      <Text style={styles.artistName} numberOfLines={1}>{item.name}</Text>
    </TouchableOpacity>
  );

  const renderTrendingAlbumItem = ({ item }: { item: Album }) => (
    <View style={styles.trendingAlbumCard}>
      <Image source={{ uri: item.artwork }} style={styles.trendingAlbumImage} />
      <Text style={styles.trendingAlbumTitle} numberOfLines={1}>{item.title}</Text>
      <Text style={styles.trendingAlbumArtist} numberOfLines={1}>{item.artist}</Text>
    </View>
  );

  const renderSongItem = ({ item }: { item: any }) => (
    <View style={styles.songItem}>
      <Image source={{ uri: item.artwork }} style={styles.songImage} />
      <View style={styles.songInfo}>
        <Text style={styles.songTitle} numberOfLines={1}>{item.title}</Text>
        <Text style={styles.songArtist} numberOfLines={1}>{item.artist}</Text>
      </View>
      <TouchableOpacity style={styles.playButton} onPress={() => playTrack(item)}>
        <Feather name="play" size={16} color="#FFF" />
      </TouchableOpacity>
      <TouchableOpacity style={styles.menuButton} onPress={() => { setSelectedSong(item); setMenuVisible(true); }}>
        <Feather name="more-vertical" size={16} color="#666" />
      </TouchableOpacity>
    </View>
  );

  const renderSongsList = () => (
    <FlatList
      data={sortedSongs}
      keyExtractor={(item, index) => `${item.id}-${index}`}
      key="songs-list"
      onEndReached={handleLoadMore}
      onEndReachedThreshold={0.5}
      ListHeaderComponent={() => (
        <View style={{ paddingHorizontal: 20, paddingVertical: 10, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <Text style={{ fontSize: 18, fontWeight: 'bold', color: '#333' }}>
            {totalCount > 0 ? `${totalCount.toLocaleString()}+ songs` : 'Songs'}
          </Text>
          <TouchableOpacity onPress={() => setFilterVisible(true)} style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Text style={{ fontSize: 14, color: '#666' }}>By {sortBy === 'title' ? 'Title' : 'Artist'}</Text>
            <Feather name={sortOrder === 'asc' ? 'arrow-up' : 'arrow-down'} size={16} color="#666" style={{ marginLeft: 5 }} />
          </TouchableOpacity>
        </View>
      )}
      ListFooterComponent={() => (
        isLoadingMore ? (
          <View style={{ padding: 20, alignItems: 'center' }}>
            <ActivityIndicator size="small" color="#FF5733" />
          </View>
        ) : <View style={{ height: 80 }} />
      )}
      renderItem={renderSongItem}
      style={{ flex: 1 }}
    />
  );

  const renderAlbumItem = ({ item }: { item: Album }) => (
    <TouchableOpacity onPress={() => navigation.navigate('AlbumDetails', { album: item })}>
      <View style={styles.albumCard}>
        <Image source={{ uri: item.artwork }} style={styles.albumCardImage} />
        <View style={styles.albumCardText}>
          <Text style={styles.albumCardTitle} numberOfLines={1}>{item.title}</Text>
          <Text style={styles.albumCardSubtitle} numberOfLines={1}>{item.artist} | {item.year}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderAlbumsList = () => (
    <FlatList
      key="albums-grid"
      data={sortedAlbums}
      keyExtractor={(item) => item.id}
      numColumns={2}
      columnWrapperStyle={{ justifyContent: 'space-between', paddingHorizontal: 20 }}
      renderItem={renderAlbumItem}
      style={{ flex: 1 }}
      ListFooterComponent={<View style={{ height: 80 }} />}
    />
  );

  const renderArtistListItem = ({ item }: { item: Artist }) => (
    <TouchableOpacity style={styles.artistListCard} onPress={() => navigation.navigate('ArtistDetails', { artist: item })}>
      <View style={styles.artistImageContainer}>
        <Image 
          source={{ uri: item.artwork || item.image?.[2]?.link || item.image?.[0]?.link || 'https://placehold.co/100x100/FF5733/ffffff?text=A' }} 
          style={styles.artistListImage} 
        />
      </View>
      <View style={styles.artistInfo}>
        <Text style={styles.artistListName} numberOfLines={1}>{item.name}</Text>
      </View>
      <Feather name="chevron-right" size={20} color="#CCC" />
    </TouchableOpacity>
  );

  const renderArtistsList = () => (
    <FlatList
      key="artists-list"
      data={artists}
      keyExtractor={(item) => item.id}
      renderItem={renderArtistListItem}
      style={{ flex: 1, paddingTop: 10 }}
      ListFooterComponent={<View style={{ height: 80 }} />}
    />
  );

  const renderSuggestedView = () => (
    <ScrollView 
      style={{ flex: 1 }}
      keyboardShouldPersistTaps="never"
    >
      <Text style={styles.sectionTitle}>Trending Songs</Text>
      <FlatList
        data={recentlyPlayed}
        keyExtractor={(item) => item.id}
        renderItem={renderRecentlyPlayed}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.horizontalList}
      />

      <Text style={styles.sectionTitle}>Artists</Text>
      <FlatList
        data={suggestedArtists}
        keyExtractor={(item) => item.id}
        renderItem={renderArtistHorizontal}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.horizontalList}
      />

      <Text style={styles.sectionTitle}>Trending Albums</Text>
      <FlatList
        data={trendingAlbums}
        keyExtractor={(item) => item.id}
        renderItem={renderTrendingAlbumItem}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.horizontalList}
      />
      
      <View style={{ height: 100 }} />
    </ScrollView>
  );

  const renderContent = () => {
    switch (activeTab) {
      case 'Suggested': return renderSuggestedView();
      case 'Songs': return renderSongsList();
      case 'Albums': return renderAlbumsList();
      case 'Artists': return renderArtistsList();
      default: return renderSuggestedView();
    }
  };

  const FilterModal = () => {
    const isSongsTab = activeTab === 'Songs';
    const options = isSongsTab ? ['Ascending', 'Descending', 'Artist', 'Album', 'Year', 'Date Added', 'Date Modified', 'Composer', 'Genre', 'Duration', 'Track Number', 'Playlist'] : ['Year', 'Artist', 'Title'];

    const handleOptionPress = (option: string) => {
      if (isSongsTab) {
        if (option === 'Ascending') setSortOrder('asc');
        else if (option === 'Descending') setSortOrder('desc');
        else if (option === 'Artist') setSortBy('artist');
        else if (option === 'Title') setSortBy('title');
      } else {
        if (option === 'Year') setAlbumSortBy('year');
        else if (option === 'Artist') setAlbumSortBy('artist');
        else if (option === 'Title') setAlbumSortBy('title');
      }
      setFilterVisible(false);
    };

    const isSelected = (option: string) => {
      if (isSongsTab) {
        if (option === 'Ascending') return sortOrder === 'asc';
        if (option === 'Descending') return sortOrder === 'desc';
        if (option === 'Artist') return sortBy === 'artist';
        return false;
      } else {
        if (option === 'Year') return albumSortBy === 'year';
        if (option === 'Artist') return albumSortBy === 'artist';
        if (option === 'Title') return albumSortBy === 'title';
        return false;
      }
    };

    return (
      <Modal
        transparent
        animationType="fade"
        visible={filterVisible}
        onRequestClose={() => setFilterVisible(false)}
      >
        <TouchableOpacity
          style={styles.filterOverlay}
          onPress={() => setFilterVisible(false)}
        >
          <View style={styles.filterMenu}>
            {options.map((option) => (
              <TouchableOpacity
                key={option}
                style={styles.filterItem}
                onPress={() => handleOptionPress(option)}
              >
                <Text style={[styles.filterText, isSelected(option) && styles.selectedFilterText]}>{option}</Text>
                <Feather
                  name={isSelected(option) ? 'arrow-up' : 'arrow-down'}
                  size={20}
                  color={isSelected(option) ? '#FF5733' : '#666'}
                />
              </TouchableOpacity>
            ))}
          </View>
        </TouchableOpacity>
      </Modal>
    );
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#F5F5F5' }}>
      <View style={styles.fixedTop}>
        <Image source={logo} style={styles.headerImage} />
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.tabBar}
          contentContainerStyle={styles.tabContainer}
        >
          {tabs.map((tab: string) => (
            <TouchableOpacity
              key={tab}
              style={[styles.tab, activeTab === tab && styles.activeTab]}
              onPress={() => setActiveTab(tab)}
            >
              <Text style={[styles.tabText, activeTab === tab && styles.activeTabText]}>
                {tab}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
      {renderContent()}
      <SongMenuModal
        visible={menuVisible}
        onClose={() => setMenuVisible(false)}
        song={selectedSong}
      />
      <FilterModal />
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
  headerImage: {
    width: 100,
    height: 40,
    resizeMode: 'contain',
    alignSelf: 'flex-start',
    marginBottom: 10,
  },
  tabBar: {
    paddingBottom: 5,
  },
  tabContainer: {
    paddingHorizontal: 16,
  },
  tab: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 8,
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: '#FF5733',
  },
  tabText: {
    fontSize: 14,
    color: '#A0A0A0',
  },
  activeTabText: {
    color: '#FF5733',
    fontWeight: 'bold',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
    marginTop: 15,
    paddingHorizontal: 16,
  },
  horizontalList: {
    paddingBottom: 10,
    paddingHorizontal: 16,
  },
  recentCard: {
    width: 110,
    marginRight: 12,
    alignItems: 'center',
  },
  recentImage: {
    width: 110,
    height: 110,
    borderRadius: 12,
  },
  recentTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 8,
    textAlign: 'center',
  },
  recentArtist: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
  artistCard: {
    alignItems: 'center',
    marginRight: 20,
  },
  artistImage: {
    width: 70,
    height: 70,
    borderRadius: 35,
  },
  artistName: {
    fontSize: 14,
    color: '#333',
    marginTop: 8,
    textAlign: 'center',
  },
  trendingAlbumCard: {
    width: 130,
    marginRight: 15,
  },
  trendingAlbumImage: {
    width: 130,
    height: 130,
    borderRadius: 8,
    marginBottom: 8,
  },
  trendingAlbumTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
  },
  trendingAlbumArtist: {
    fontSize: 12,
    color: '#888',
  },
  artistListCard: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#FFF',
    marginHorizontal: 16,
    marginBottom: 10,
    borderRadius: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  artistImageContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#EEE',
    overflow: 'hidden',
  },
  artistListImage: {
    width: '100%',
    height: '100%',
  },
  artistInfo: {
    flex: 1,
    marginLeft: 15,
    justifyContent: 'center',
  },
  artistListName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 4,
  },
  artistStats: {
    fontSize: 13,
    color: '#888',
  },
  songItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  songImage: {
    width: 55,
    height: 55,
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
    marginRight: 8,
  },
  menuButton: {
    padding: 4,
  },
  albumCard: {
    width: Dimensions.get('window').width / 2 - 30,
    marginBottom: 20,
  },
  albumCardImage: {
    width: '100%',
    aspectRatio: 1,
    borderRadius: 16,
    marginBottom: 10,
  },
  albumCardText: {
    paddingHorizontal: 5,
  },
  albumCardTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 2,
  },
  albumCardTitle: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
  },
  albumCardSubtitle: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  albumCardMeta: {
    fontSize: 11,
    color: '#666',
    marginTop: 2,
  },
  filterOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  filterMenu: {
    position: 'absolute',
    top: 180,
    right: 20,
    backgroundColor: '#252525',
    borderRadius: 12,
    width: 200,
    padding: 10,
  },
  filterItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
  },
  filterText: {
    fontSize: 14,
    color: '#FFF',
  },
  selectedFilterText: {
    color: '#FF5733',
  },
});

export default HomeScreen;