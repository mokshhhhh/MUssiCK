import React, { useState } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  Alert,
  Platform,
  ToastAndroid,
  Image,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import TrackPlayer, { Track } from 'react-native-track-player';
import { useMusicStore, Playlist } from '../store/useMusicStore';

interface AddToPlaylistModalProps {
  visible: boolean;
  onClose: () => void;
  track: Track | null;
}

const AddToPlaylistModal: React.FC<AddToPlaylistModalProps> = ({
  visible,
  onClose,
  track,
}) => {
  const { playlists, createPlaylist, addTrackToPlaylist } = useMusicStore();
  const [loading, setLoading] = useState(false);

  const handleCreateNewPlaylist = () => {
    if (!track) return;

    Alert.prompt(
      'New Playlist',
      'Enter playlist name:',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Create',
          onPress: async (playlistName?: string) => {
            if (!playlistName || playlistName.trim() === '') {
              if (Platform.OS === 'android') {
                ToastAndroid.show('Please enter a playlist name', ToastAndroid.SHORT);
              }
              return;
            }

            setLoading(true);
            try {
              const newPlaylistId = await createPlaylist(playlistName.trim());
              await addTrackToPlaylist(newPlaylistId, track);
              onClose();
            } catch (error) {
              console.error('Error creating playlist:', error);
              if (Platform.OS === 'android') {
                ToastAndroid.show('Failed to create playlist', ToastAndroid.SHORT);
              }
            } finally {
              setLoading(false);
            }
          },
        },
      ],
      'plain-text',
      ''
    );
  };

  const handleAddToExistingPlaylist = async (playlist: Playlist) => {
    if (!track || loading) return;

    setLoading(true);
    try {
      await addTrackToPlaylist(playlist.id, track);
      onClose();
    } catch (error) {
      console.error('Error adding to playlist:', error);
      if (Platform.OS === 'android') {
        ToastAndroid.show('Failed to add to playlist', ToastAndroid.SHORT);
      }
    } finally {
      setLoading(false);
    }
  };

  const renderPlaylistItem = ({ item }: { item: Playlist }) => (
    <TouchableOpacity
      style={styles.playlistItem}
      onPress={() => handleAddToExistingPlaylist(item)}
      disabled={loading}
    >
      <View style={styles.playlistInfo}>
        <Image
          source={{ uri: item.artwork || 'https://placehold.co/50x50/orange/white?text=📁' }}
          style={styles.playlistImage}
        />
        <View style={styles.playlistText}>
          <Text style={styles.playlistName} numberOfLines={1}>
            {item.name}
          </Text>
          <Text style={styles.playlistCount}>
            {item.songs.length} {item.songs.length === 1 ? 'song' : 'songs'}
          </Text>
        </View>
      </View>
      <Feather name="chevron-right" size={20} color="#CCC" />
    </TouchableOpacity>
  );

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Feather name="x" size={24} color="#333" />
          </TouchableOpacity>
          <Text style={styles.title}>Add to Playlist</Text>
          <View style={styles.placeholder} />
        </View>

        {/* New Playlist Button */}
        <TouchableOpacity
          style={styles.newPlaylistButton}
          onPress={handleCreateNewPlaylist}
          disabled={loading}
        >
          <Feather name="plus" size={20} color="#FF5733" />
          <Text style={styles.newPlaylistText}>New Playlist</Text>
        </TouchableOpacity>

        {/* Playlists List */}
        <FlatList
          data={playlists}
          keyExtractor={(item) => item.id}
          renderItem={renderPlaylistItem}
          style={styles.list}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Feather name="folder" size={48} color="#CCC" />
              <Text style={styles.emptyText}>No playlists yet</Text>
              <Text style={styles.emptySubText}>Create your first playlist!</Text>
            </View>
          }
        />
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: '#FFF',
    borderBottomWidth: 1,
    borderBottomColor: '#EEE',
  },
  closeButton: {
    padding: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  placeholder: {
    width: 40,
  },
  newPlaylistButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    paddingVertical: 15,
    paddingHorizontal: 20,
    marginHorizontal: 16,
    marginBottom: 10,
    borderRadius: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  newPlaylistText: {
    fontSize: 16,
    color: '#FF5733',
    marginLeft: 12,
    fontWeight: '600',
  },
  list: {
    flex: 1,
    paddingHorizontal: 16,
  },
  playlistItem: {
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
  playlistInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  playlistImage: {
    width: 50,
    height: 50,
    borderRadius: 8,
    marginRight: 12,
  },
  playlistText: {
    flex: 1,
  },
  playlistName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 2,
  },
  playlistCount: {
    fontSize: 14,
    color: '#888',
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
  },
});

export default AddToPlaylistModal;
