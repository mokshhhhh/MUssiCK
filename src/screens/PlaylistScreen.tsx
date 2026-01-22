import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  TouchableOpacity, 
  Image, 
  SafeAreaView, 
  Dimensions,
  Modal,
  TextInput,
  Platform
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useMusicStore } from '../store/useMusicStore';

const logo = require('../../assets/musik.png');
const { width } = Dimensions.get('window');

const PlaylistScreen = () => {
  const navigation = useNavigation<any>();
  const { playlists, createPlaylist } = useMusicStore();
  
  // State for the "Create Playlist" Modal
  const [isCreateModalVisible, setCreateModalVisible] = useState(false);
  const [newPlaylistName, setNewPlaylistName] = useState('');

  const handleCreatePlaylist = async () => {
    if (!newPlaylistName.trim()) return;
    
    // 1. Create playlist in the store
    await createPlaylist(newPlaylistName);
    
    // 2. Close modal & Clear input
    setCreateModalVisible(false);
    setNewPlaylistName('');
    
    // 3. Redirect to Search (as requested) - Use nested navigation
    navigation.navigate('MainTabs', { screen: 'Search' });
  };

  const renderHeader = () => (
    <View style={styles.listHeader}>
      {/* 1. Downloaded Songs Folder (Static) */}
      <TouchableOpacity style={styles.staticFolder}>
        <View style={[styles.folderIconContainer, { backgroundColor: '#E8F5E9' }]}>
          <Feather name="arrow-down-circle" size={24} color="#4CAF50" />
        </View>
        <View style={styles.folderInfo}>
          <Text style={styles.folderTitle}>Downloaded Songs</Text>
          <Text style={styles.folderSubtitle}>0 Songs</Text>
        </View>
        <Feather name="chevron-right" size={20} color="#CCC" />
      </TouchableOpacity>

      {/* 2. "Your Playlists" Title */}
      <Text style={styles.sectionTitle}>Your Playlists</Text>
      
      {playlists.length === 0 && (
         <View style={styles.emptyState}>
            <Text style={styles.emptyText}>No playlists yet.</Text>
            <TouchableOpacity onPress={() => setCreateModalVisible(true)}>
               <Text style={styles.emptyAction}>Create one now</Text>
            </TouchableOpacity>
         </View>
      )}
    </View>
  );

  const renderPlaylistItem = ({ item }: { item: any }) => (
    <TouchableOpacity 
      style={styles.playlistCard}
      // Future: navigation.navigate('PlaylistDetails', { playlist: item })
    >
      <View style={styles.playlistImageContainer}>
        {/* Show artwork of first song, or a placeholder */}
        <Image 
          source={{ uri: item.songs[0]?.artwork || 'https://placehold.co/100x100/orange/white?text=PL' }} 
          style={styles.playlistImage} 
        />
      </View>
      <View style={styles.playlistInfo}>
        <Text style={styles.playlistName} numberOfLines={1}>{item.name}</Text>
        <Text style={styles.playlistCount}>{item.songs.length} Songs</Text>
      </View>
      <Feather name="chevron-right" size={20} color="#CCC" />
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      
      {/* --- FIXED HEADER (Padding for Status Bar) --- */}
      <View style={styles.fixedTop}>
         <View style={styles.headerRow}>
            <Image source={logo} style={styles.logoImage} />
            <TouchableOpacity 
              style={styles.addButton}
              onPress={() => setCreateModalVisible(true)} // Opens Custom Modal
            >
              <Feather name="plus" size={24} color="#000" />
            </TouchableOpacity>
         </View>
      </View>

      {/* List Content */}
      <FlatList
        data={playlists}
        keyExtractor={(item) => item.id}
        renderItem={renderPlaylistItem}
        ListHeaderComponent={renderHeader}
        contentContainerStyle={styles.listContent}
      />

      {/* --- NEW: CUSTOM CREATE MODAL (Fixes Android Issue) --- */}
      <Modal
        visible={isCreateModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setCreateModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>New Playlist</Text>
            <Text style={styles.modalSubtitle}>Give your playlist a name.</Text>
            
            <TextInput
              style={styles.input}
              placeholder="My Awesome Playlist"
              placeholderTextColor="#999"
              value={newPlaylistName}
              onChangeText={setNewPlaylistName}
              autoFocus
            />

            <View style={styles.modalButtons}>
              <TouchableOpacity 
                style={styles.cancelButton} 
                onPress={() => setCreateModalVisible(false)}
              >
                <Text style={styles.cancelText}>Cancel</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.createButton} 
                onPress={handleCreatePlaylist}
              >
                <Text style={styles.createText}>Create</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  // --- FIXED LAYOUT STYLES ---
  fixedTop: {
    backgroundColor: '#F5F5F5',
    paddingTop: Platform.OS === 'android' ? 50 : 60, // Matches Home Screen
    paddingHorizontal: 20,
    paddingBottom: 15,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  logoImage: {
    width: 100,
    height: 40,
    resizeMode: 'contain',
  },
  addButton: {
    padding: 8,
    backgroundColor: '#FFF',
    borderRadius: 20,
    elevation: 2,
  },
  
  // List Styles
  listContent: {
    paddingBottom: 100,
  },
  listHeader: {
    paddingHorizontal: 20,
    marginBottom: 10,
  },
  
  // Static Folder (Downloads)
  staticFolder: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    padding: 15,
    borderRadius: 12,
    marginBottom: 25,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 5,
  },
  folderIconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  folderInfo: {
    flex: 1,
  },
  folderTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  folderSubtitle: {
    fontSize: 12,
    color: '#888',
  },

  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  emptyState: {
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    color: '#999',
    marginBottom: 5,
  },
  emptyAction: {
    color: '#FF5733',
    fontWeight: 'bold',
  },

  // Playlist Item
  playlistCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    padding: 12,
    marginHorizontal: 20,
    marginBottom: 12,
    borderRadius: 12,
    elevation: 2,
  },
  playlistImageContainer: {
    width: 60,
    height: 60,
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: '#EEE',
  },
  playlistImage: {
    width: '100%',
    height: '100%',
  },
  playlistInfo: {
    flex: 1,
    marginLeft: 15,
  },
  playlistName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  playlistCount: {
    fontSize: 12,
    color: '#888',
    marginTop: 2,
  },

  // --- MODAL STYLES ---
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: '80%',
    backgroundColor: '#FFF',
    borderRadius: 20,
    padding: 25,
    alignItems: 'center',
    elevation: 5,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  modalSubtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 20,
    textAlign: 'center',
  },
  input: {
    width: '100%',
    borderBottomWidth: 1,
    borderBottomColor: '#CCC',
    paddingVertical: 10,
    fontSize: 16,
    marginBottom: 25,
    color: '#333',
  },
  modalButtons: {
    flexDirection: 'row',
    width: '100%',
    justifyContent: 'flex-end',
    gap: 20,
  },
  cancelButton: {
    padding: 10,
  },
  cancelText: {
    color: '#666',
    fontWeight: 'bold',
  },
  createButton: {
    backgroundColor: '#FF5733',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
  },
  createText: {
    color: '#FFF',
    fontWeight: 'bold',
  },
});

export default PlaylistScreen;