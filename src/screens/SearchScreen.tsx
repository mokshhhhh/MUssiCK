import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TextInput, 
  FlatList, 
  TouchableOpacity, 
  Image, 
  ActivityIndicator, 
  Keyboard 
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { searchSongs, Song } from '../services/api'; // Ensure this import matches your file
import { useMusicStore } from '../store/useMusicStore';

// ------------------------------------
// 1. Language Categories Configuration
// ------------------------------------
const LANGUAGES = [
  { id: '1', name: 'Hindi', color: '#E74C3C', query: 'Hindi Top 50' },
  { id: '2', name: 'English', color: '#3498DB', query: 'English Top 50' },
  { id: '3', name: 'Punjabi', color: '#F1C40F', query: 'Punjabi Top 50' },
  { id: '4', name: 'Tamil', color: '#9B59B6', query: 'Tamil Top 50' },
  { id: '5', name: 'Telugu', color: '#1ABC9C', query: 'Telugu Top 50' },
  { id: '6', name: 'Indie', color: '#34495E', query: 'Indie India' },
];

const SearchScreen = () => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Song[]>([]);
  const [loading, setLoading] = useState(false);
  
  const { playTrack } = useMusicStore();
  
  // Debounce search (wait 500ms after typing stops to search)
  useEffect(() => {
    if (!query) {
      setResults([]);
      return;
    }

    const timer = setTimeout(() => {
      handleSearch(query);
    }, 600);

    return () => clearTimeout(timer);
  }, [query]);

  const handleSearch = async (text: string) => {
    if (!text.trim()) return;
    setLoading(true);
    const data = await searchSongs(text);
    setResults(data);
    setLoading(false);
  };

  const handleLanguagePress = (langQuery: string) => {
    setQuery(langQuery); // Sets text in search bar
    Keyboard.dismiss();  // Hides keyboard
    // The useEffect above will trigger the actual search automatically
  };

  const clearSearch = () => {
    setQuery('');
    setResults([]);
    Keyboard.dismiss();
  };

  // ------------------------------------
  // Render Item: Song Result
  // ------------------------------------
  const renderSongItem = ({ item }: { item: Song }) => (
    <TouchableOpacity style={styles.songItem} onPress={() => playTrack(item)}>
      <Image source={{ uri: item.artwork }} style={styles.artwork} />
      <View style={styles.songInfo}>
        <Text style={styles.title} numberOfLines={1}>{item.title}</Text>
        <Text style={styles.artist} numberOfLines={1}>{item.artist}</Text>
      </View>
      <Feather name="play-circle" size={24} color="#FF5733" />
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <Text style={styles.headerTitle}>Search</Text>

      {/* Search Input */}
      <View style={styles.searchContainer}>
        <Feather name="search" size={20} color="#888" style={styles.searchIcon} />
        <TextInput
          style={styles.input}
          placeholder="Songs, Artists, or Albums..."
          placeholderTextColor="#999"
          value={query}
          onChangeText={setQuery}
          autoCorrect={false}
        />
        {query.length > 0 && (
          <TouchableOpacity onPress={clearSearch}>
            <Feather name="x" size={20} color="#888" />
          </TouchableOpacity>
        )}
      </View>

      {/* Content Switching: Loading vs Categories vs Results */}
      
      {loading ? (
        <ActivityIndicator size="large" color="#FF5733" style={{ marginTop: 40 }} />
      ) : query.length > 0 ? (
        // SHOW RESULTS LIST
        <FlatList
          data={results}
          keyExtractor={(item) => item.id}
          renderItem={renderSongItem}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            !loading && <Text style={styles.noResults}>No songs found.</Text>
          }
        />
      ) : (
        // SHOW BROWSE CATEGORIES (When search is empty)
        <View style={styles.categoriesContainer}>
          <Text style={styles.sectionTitle}>Explore by Language</Text>
          <View style={styles.grid}>
            {LANGUAGES.map((lang) => (
              <TouchableOpacity
                key={lang.id}
                style={[styles.card, { backgroundColor: lang.color }]}
                onPress={() => handleLanguagePress(lang.query)}
              >
                <Text style={styles.cardText}>{lang.name}</Text>
                {/* Decorative circle for visual flair */}
                <View style={styles.cardDecoration} /> 
              </TouchableOpacity>
            ))}
          </View>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingTop: 60, // Adjust for status bar
    paddingHorizontal: 16,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 20,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0F0F0',
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 50,
    marginBottom: 20,
  },
  searchIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#333',
    height: '100%',
  },
  // Results List Styles
  listContent: {
    paddingBottom: 100, // Space for mini player
  },
  songItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    backgroundColor: '#FAFAFA',
    padding: 8,
    borderRadius: 8,
  },
  artwork: {
    width: 50,
    height: 50,
    borderRadius: 6,
    marginRight: 12,
  },
  songInfo: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  artist: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  noResults: {
    textAlign: 'center',
    marginTop: 20,
    color: '#888',
    fontSize: 16,
  },
  // Category Grid Styles
  categoriesContainer: {
    flex: 1,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  card: {
    width: '48%', // 2 columns
    height: 100,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    justifyContent: 'flex-end',
    overflow: 'hidden', // Keeps decoration inside
    position: 'relative',
  },
  cardText: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: 'bold',
    zIndex: 2,
  },
  cardDecoration: {
    position: 'absolute',
    right: -20,
    bottom: -10,
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: 'rgba(255,255,255,0.2)',
    zIndex: 1,
    transform: [{ rotate: '25deg' }],
  },
});

export default SearchScreen;