import React, { useEffect, useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  Image, 
  ActivityIndicator, 
  TouchableOpacity, 
  ScrollView,
  Dimensions
} from 'react-native';
import { RouteProp, useRoute, useNavigation } from '@react-navigation/native';
import { Feather } from '@expo/vector-icons';
import { getArtistDetails, Song, Album } from '../services/api';
import { useMusicStore } from '../store/useMusicStore';

const { width } = Dimensions.get('window');

type ParamList = {
  ArtistDetails: { artist: any };
};

const ArtistDetailsScreen = () => {
  const route = useRoute<RouteProp<ParamList, 'ArtistDetails'>>();
  const navigation = useNavigation();
  const { artist: initialArtist } = route.params; // Initial data from search
  const { playTrack } = useMusicStore();
  
  const [details, setDetails] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'Songs' | 'Albums'>('Songs');

  useEffect(() => {
    fetchDetails();
  }, [initialArtist.id]);

  const fetchDetails = async () => {
    const data = await getArtistDetails(initialArtist.id);
    setDetails(data);
    setLoading(false);
  };

  const renderSongItem = ({ item, index }: { item: Song; index: number }) => (
    <TouchableOpacity style={styles.songItem} onPress={() => playTrack(item)}>
      <Text style={styles.songIndex}>{index + 1}</Text>
      <Image source={{ uri: item.artwork }} style={styles.songImg} />
      <View style={styles.songInfo}>
        <Text style={styles.songTitle} numberOfLines={1}>{item.title}</Text>
        <Text style={styles.songArtist} numberOfLines={1}>{item.artist}</Text>
      </View>
      <Feather name="play" size={18} color="#FF5733" />
    </TouchableOpacity>
  );

  const renderAlbumItem = ({ item }: { item: Album }) => (
    <TouchableOpacity 
      style={styles.albumCard}
      // ✅ FIX: Use (navigation as any).navigate(...)
      onPress={() => (navigation as any).navigate('AlbumDetails', { album: item })}
    >
      <Image source={{ uri: item.artwork }} style={styles.albumImg} />
      <Text style={styles.albumTitle} numberOfLines={1}>{item.title}</Text>
      <Text style={styles.albumYear}>{item.year}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      
      {/* 1. Header with Artist Image */}
      <View style={styles.header}>
        <Image source={{ uri: initialArtist.artwork }} style={styles.cover} />
        <View style={styles.overlay} />
        
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Feather name="arrow-left" size={24} color="#FFF" />
        </TouchableOpacity>

        <View style={styles.headerContent}>
          <Text style={styles.name}>{initialArtist.name}</Text>
          {details && (
            <Text style={styles.stats}>
              {details.fanCount.toLocaleString()} Fans • {details.topSongs.length} Songs
            </Text>
          )}
        </View>
      </View>

      {/* 2. Loading State */}
      {loading ? (
        <ActivityIndicator color="#FF5733" size="large" style={{ marginTop: 50 }} />
      ) : (
        <>
          {/* 3. Tabs (Songs / Albums) */}
          <View style={styles.tabs}>
            <TouchableOpacity 
              style={[styles.tab, activeTab === 'Songs' && styles.activeTab]} 
              onPress={() => setActiveTab('Songs')}
            >
              <Text style={[styles.tabText, activeTab === 'Songs' && styles.activeTabText]}>Top Songs</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.tab, activeTab === 'Albums' && styles.activeTab]} 
              onPress={() => setActiveTab('Albums')}
            >
              <Text style={[styles.tabText, activeTab === 'Albums' && styles.activeTabText]}>Albums</Text>
            </TouchableOpacity>
          </View>

          {/* 4. Content List */}
          {activeTab === 'Songs' ? (
            <FlatList
              // ✅ FIX: This key tells React "I am a new list" when tab changes
              key={activeTab} 
              data={details?.topSongs || []}
              keyExtractor={(item) => item.id}
              renderItem={renderSongItem}
              contentContainerStyle={styles.listContent}
            />
          ) : (
            <FlatList
              // ✅ FIX: This key is crucial for changing columns
              key={activeTab} 
              data={details?.albums || []}
              keyExtractor={(item) => item.id}
              renderItem={renderAlbumItem}
              numColumns={2} // Grid View
              contentContainerStyle={styles.gridContent}
            />
          )}
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFF' },
  header: { height: 280, justifyContent: 'flex-end' },
  cover: { ...StyleSheet.absoluteFillObject, width: '100%', height: '100%' },
  overlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.3)' },
  
  headerContent: { padding: 20 },
  name: { fontSize: 36, fontWeight: 'bold', color: '#FFF', textShadowColor: 'rgba(0,0,0,0.5)', textShadowRadius: 10 },
  stats: { color: '#EEE', fontSize: 14, marginTop: 5, fontWeight: '600' },
  
  backBtn: { position: 'absolute', top: 50, left: 20, padding: 8, backgroundColor: 'rgba(0,0,0,0.3)', borderRadius: 20 },

  tabs: { flexDirection: 'row', borderBottomWidth: 1, borderColor: '#EEE' },
  tab: { flex: 1, alignItems: 'center', paddingVertical: 15 },
  activeTab: { borderBottomWidth: 3, borderColor: '#FF5733' },
  tabText: { fontSize: 16, color: '#888', fontWeight: '600' },
  activeTabText: { color: '#FF5733' },

  listContent: { padding: 10, paddingBottom: 100 },
  gridContent: { padding: 10, paddingBottom: 100 },

  // Song Item Styles
  songItem: { flexDirection: 'row', alignItems: 'center', padding: 12, marginBottom: 5 },
  songIndex: { width: 30, color: '#888', fontSize: 14, textAlign: 'center' },
  songImg: { width: 50, height: 50, borderRadius: 6, marginHorizontal: 12 },
  songInfo: { flex: 1 },
  songTitle: { fontSize: 16, fontWeight: '500', color: '#333' },
  songArtist: { fontSize: 13, color: '#888' },

  // Album Card Styles
  albumCard: { flex: 1, margin: 8, maxWidth: (width / 2) - 24 },
  albumImg: { width: '100%', height: 160, borderRadius: 12, marginBottom: 8 },
  albumTitle: { fontSize: 14, fontWeight: 'bold', color: '#333' },
  albumYear: { fontSize: 12, color: '#888' },
});

export default ArtistDetailsScreen;