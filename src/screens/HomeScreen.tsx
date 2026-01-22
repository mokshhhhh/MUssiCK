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
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import TrackPlayer from 'react-native-track-player';
import { useNavigation } from '@react-navigation/native';
import { RootStackParamList } from '../navigation/RootNavigator';
import { searchSongs, Song, Album, searchAlbums, getAlbumSongs } from '../services/api';

const logo = require('../../assets/musik.png');

const { width } = Dimensions.get('window');

const mockRecentlyPlayed = [
  { id: '1', title: 'Song 1', artist: 'Artist 1', artwork: 'https://placehold.co/200x200.png?text=Song1' },
  { id: '2', title: 'Song 2', artist: 'Artist 2', artwork: 'https://placehold.co/200x200.png?text=Song2' },
  { id: '3', title: 'Song 3', artist: 'Artist 3', artwork: 'https://placehold.co/200x200.png?text=Song3' },
  { id: '4', title: 'Song 4', artist: 'Artist 4', artwork: 'https://placehold.co/200x200.png?text=Song4' },
  { id: '5', title: 'Song 5', artist: 'Artist 5', artwork: 'https://placehold.co/200x200.png?text=Song5' },
];

const mockArtists = [
  { id: '1', name: 'Artist A', artwork: 'https://placehold.co/100x100.png?text=A' },
  { id: '2', name: 'Artist B', artwork: 'https://placehold.co/100x100.png?text=B' },
  { id: '3', name: 'Artist C', artwork: 'https://placehold.co/100x100.png?text=C' },
  { id: '4', name: 'Artist D', artwork: 'https://placehold.co/100x100.png?text=D' },
  { id: '5', name: 'Artist E', artwork: 'https://placehold.co/100x100.png?text=E' },
];

const HomeScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const [activeTab, setActiveTab] = useState('Suggested');
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

  useEffect(() => {
    const fetchSongs = async () => {
      const response = await searchSongs('Hindi');
      const limitedSongs = response.slice(0, 20);
      setAllSongs(limitedSongs);
      setTotalCount(limitedSongs.length);
    };
    fetchSongs();
  }, []);

  const applySort = (songs: Song[], criterion: string, order: string) => {
    const sorted = [...songs].sort((a, b) => {
      let valA = criterion === 'artist' ? a.artist : a.title;
      let valB = criterion === 'artist' ? b.artist : b.title;

      // Safety check for nulls
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
    if (activeTab === 'Albums' && allAlbums.length === 0) {
      const fetchAlbums = async () => {
        const response = await searchAlbums('Hindi');
        setAllAlbums(response.slice(0, 20));
      };
      fetchAlbums();
    }
  }, [activeTab]);

  useEffect(() => {
    const sorted = sortAlbums(allAlbums, albumSortBy, albumSortOrder);
    setSortedAlbums(sorted);
  }, [allAlbums, albumSortBy, albumSortOrder]);

  const fetchAlbumSongs = async (albumId: string) => {
    const songs = await getAlbumSongs(albumId);
    setAlbumSongs(songs);
  };

  const tabs = ['Suggested', 'Favorites', 'Albums', 'Songs'];

  const renderRecentlyPlayed = ({ item }: { item: any }) => (
    <View style={styles.recentCard}>
      <Image source={{ uri: item.artwork }} style={styles.recentImage} />
      <Text style={styles.recentTitle} numberOfLines={1}>{item.title}</Text>
      <Text style={styles.recentArtist} numberOfLines={1}>{item.artist}</Text>
    </View>
  );

  const renderArtist = ({ item }: { item: any }) => (
    <View style={styles.artistCard}>
      <Image source={{ uri: item.artwork }} style={styles.artistImage} />
      <Text style={styles.artistName} numberOfLines={1}>{item.name}</Text>
    </View>
  );

  const renderSongItem = ({ item }: { item: any }) => (
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
      <TouchableOpacity
        style={styles.menuButton}
        onPress={() => {
          setSelectedSong(item);
          setMenuVisible(true);
        }}
      >
        <Feather name="more-vertical" size={16} color="#666" />
      </TouchableOpacity>
    </View>
  );

  const renderSongsList = () => (
    <FlatList
      data={sortedSongs}
      keyExtractor={(item) => item.id}
      key="songs-list"
      ListHeaderComponent={() => (
        <View style={{ paddingHorizontal: 20, paddingVertical: 10, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <Text style={{ fontSize: 18, fontWeight: 'bold', color: '#333' }}>
            {totalCount.toLocaleString()} songs
          </Text>
          <TouchableOpacity onPress={() => setFilterVisible(true)} style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Text style={{ fontSize: 14, color: '#666' }}>By {sortBy === 'title' ? 'Title' : 'Artist'}</Text>
            <TouchableOpacity onPress={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')} style={{ marginLeft: 5 }}>
              <Feather name={sortOrder === 'asc' ? 'arrow-up' : 'arrow-down'} size={16} color="#666" />
            </TouchableOpacity>
          </TouchableOpacity>
        </View>
      )}
      renderItem={renderSongItem}
      style={{ flex: 1 }}
    />
  );

  const renderSuggestedView = () => (
    <ScrollView style={{ flex: 1 }}>
      <Text style={styles.sectionTitle}>Recently Played</Text>
      <FlatList
        data={mockRecentlyPlayed}
        keyExtractor={(item) => item.id}
        renderItem={renderRecentlyPlayed}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.horizontalList}
      />
      <Text style={styles.sectionTitle}>Artists</Text>
      <FlatList
        data={mockArtists}
        keyExtractor={(item) => item.id}
        renderItem={renderArtist}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.horizontalList}
      />
    </ScrollView>
  );

  const renderAlbumsList = () => {
    if (selectedAlbum) {
      return (
        <View style={{ flex: 1 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 10 }}>
            <TouchableOpacity onPress={() => setSelectedAlbum(null)} style={{ marginRight: 10 }}>
              <Feather name="arrow-left" size={24} color="#FF5733" />
            </TouchableOpacity>
            <View>
              <Text style={{ fontSize: 18, fontWeight: 'bold', color: '#333' }}>{selectedAlbum.title}</Text>
              <Text style={{ fontSize: 14, color: '#666' }}>{selectedAlbum.artist} • {selectedAlbum.year}</Text>
            </View>
          </View>
          <FlatList
            data={albumSongs}
            keyExtractor={(item) => item.id}
            renderItem={renderSongItem}
            style={{ flex: 1 }}
          />
        </View>
      );
    }
    return (
      <FlatList
        data={sortedAlbums}
        keyExtractor={(item) => item.id}
        numColumns={2}
        key="albums-grid"
        columnWrapperStyle={{ justifyContent: 'space-between', paddingHorizontal: 20 }}
        renderItem={renderAlbumItem}
        style={{ flex: 1 }}
      />
    );
  };

  const renderAlbumItem = ({ item }: { item: Album }) => (
    <TouchableOpacity onPress={() => navigation.navigate('AlbumDetails', { album: item })}>
      <View style={styles.albumCard}>
        <Image source={{ uri: item.artwork }} style={styles.albumCardImage} />
        <View style={styles.albumCardText}>
          <View style={styles.albumCardTitleRow}>
            <Text style={styles.albumCardTitle} numberOfLines={1}>{item.title}</Text>
            <TouchableOpacity>
              <Feather name="more-vertical" size={16} color="#666" />
            </TouchableOpacity>
          </View>
          <Text style={styles.albumCardSubtitle} numberOfLines={1}>{item.artist} | {item.year}</Text>
          <Text style={styles.albumCardMeta}>{item.songsCount} songs</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderContent = () => {
    switch (activeTab) {
      case 'Suggested':
        return renderSuggestedView();
      case 'Songs':
        return renderSongsList();
      case 'Albums':
        return renderAlbumsList();
      case 'Favorites':
        return (
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <Text>No Favorites Yet</Text>
          </View>
        );
      default:
        return renderSuggestedView();
    }
  };

  const SongMenuModal = ({ visible, onClose, song }: { visible: boolean; onClose: () => void; song: Song | null }) => {
    if (!song) return null;

    const options = [
      { icon: 'arrow-right-circle', label: 'Play Next' },
      { icon: 'list', label: 'Add to Queue' },
      { icon: 'plus-circle', label: 'Add to Playlist' },
      { icon: 'disc', label: 'Go to Album' },
      { icon: 'user', label: 'Go to Artist' },
    ];

    return (
      <Modal
        animationType="slide"
        transparent={true}
        visible={visible}
        onRequestClose={onClose}
      >
        <TouchableOpacity style={styles.overlay} onPress={onClose}>
          <View style={styles.modalSheet}>
            <View style={styles.modalHeader}>
              <Image source={{ uri: song.artwork }} style={styles.modalThumb} />
              <View style={styles.modalInfo}>
                <Text style={styles.modalTitle} numberOfLines={1}>{song.title}</Text>
                <Text style={styles.modalArtist} numberOfLines={1}>{song.artist}</Text>
              </View>
              <TouchableOpacity>
                <Feather name="heart" size={20} color="#FF5733" />
              </TouchableOpacity>
            </View>
            <View style={styles.optionsList}>
              {options.map((option, index) => (
                <TouchableOpacity key={index} style={styles.optionItem}>
                  <Feather name={option.icon as any} size={24} color="#FFF" />
                  <Text style={styles.optionText}>{option.label}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </TouchableOpacity>
      </Modal>
    );
  };

  const FilterModal = () => {
    const isSongsTab = activeTab === 'Songs';
    const options = isSongsTab ? ['Ascending', 'Descending', 'Artist', 'Album', 'Year', 'Date Added', 'Date Modified', 'Composer'] : ['Year', 'Artist', 'Title'];

    const handleOptionPress = (option: string) => {
      if (isSongsTab) {
        if (option === 'Ascending') {
          setSortOrder('asc');
        } else if (option === 'Descending') {
          setSortOrder('desc');
        } else if (option === 'Artist') {
          setSortBy('artist');
        } else if (option === 'Title') {
          setSortBy('title');
        }
      } else {
        if (option === 'Year') {
          setAlbumSortBy('year');
        } else if (option === 'Artist') {
          setAlbumSortBy('artist');
        } else if (option === 'Title') {
          setAlbumSortBy('title');
        }
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
          {tabs.map((tab) => (
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
    paddingTop: 50,
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
    paddingBottom: 10,
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
  scrollableContent: {
    flex: 1,
    marginTop: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
    marginTop: 10,
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
  centeredContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  centeredText: {
    fontSize: 16,
    color: '#666',
  },
  songList: {
    paddingHorizontal: 16,
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
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalSheet: {
    backgroundColor: '#1E1E1E',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalThumb: {
    width: 50,
    height: 50,
    borderRadius: 8,
    marginRight: 12,
  },
  modalInfo: {
    flex: 1,
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFF',
  },
  modalArtist: {
    fontSize: 14,
    color: '#CCC',
  },
  optionsList: {
    marginTop: 10,
  },
  optionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
  },
  optionText: {
    fontSize: 16,
    color: '#FFF',
    marginLeft: 15,
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