import React, { useState } from 'react';
import {
  View,
  Text,
  Modal,
  StyleSheet,
  TouchableOpacity,
  Image,
  Dimensions,
  ToastAndroid,
  Platform,
  Alert,
  TouchableWithoutFeedback,
} from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import {useMusicStore} from '../store/useMusicStore';
import AddToPlaylistModal from './AddToPlaylistModal';

const { width } = Dimensions.get('window');

interface SongMenuProps {
  visible: boolean;
  onClose: () => void;
  song: any; // Accepts the song object from your API/List
}

const SongMenuModal: React.FC<SongMenuProps> = ({ visible, onClose, song }) => {
  const { playNext, addToQueue, toggleFavorite, isFavorite } = useMusicStore();
  const [showPlaylistModal, setShowPlaylistModal] = useState(false);

  if (!song) return null;

  // Helper for user feedback (Android Toast or iOS Alert)
  const showFeedback = (message: string) => {
    if (Platform.OS === 'android') {
      ToastAndroid.show(message, ToastAndroid.SHORT);
    } else {
      Alert.alert('Success', message);
    }
  };

  const handlePlayNext = async () => {
    await playNext(song);
    showFeedback('Playing Next');
    onClose();
  };

  const handleAddToQueue = async () => {
    await addToQueue(song);
    showFeedback('Added to Queue');
    onClose();
  };

  const handleToggleFavorite = async () => {
    await toggleFavorite(song);
    const isFav = isFavorite(song.id);
    showFeedback(isFav ? 'Removed from Favorites' : 'Added to Favorites');
    onClose();
  };

  const handleAddToPlaylist = () => {
    setShowPlaylistModal(true);
    onClose();
  };

  // Generic handler for buttons not implemented yet
  const handlePlaceholder = (action: string) => {
    showFeedback(`${action} coming soon!`);
    onClose();
  };

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      {/* 1. Transparent Overlay (Closes modal when tapped) */}
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.overlay} />
      </TouchableWithoutFeedback>

      {/* 2. The Bottom Sheet Content */}
      <View style={styles.sheetContainer}>
        {/* Header: Drag Indicator */}
        <View style={styles.dragIndicator} />

        {/* Song Header Section */}
        <View style={styles.headerRow}>
          <Image
            source={{ uri: song.artwork || 'https://placehold.co/100x100.png' }}
            style={styles.artwork}
          />
          <View style={styles.headerInfo}>
            <Text style={styles.title} numberOfLines={1}>
              {song.title}
            </Text>
            <Text style={styles.artist} numberOfLines={1}>
              {song.artist}
            </Text>
          </View>
          <TouchableOpacity onPress={handleToggleFavorite}>
            <Icon name={isFavorite(song.id) ? "heart" : "heart"} size={24} color={isFavorite(song.id) ? "#FF5733" : "#FFF"} />
          </TouchableOpacity>
        </View>

        {/* Divider */}
        <View style={styles.divider} />

        {/* Menu Options List */}
        <View style={styles.menuList}>
          
          <MenuOption 
            icon="arrow-right-circle" 
            label="Play Next" 
            onPress={handlePlayNext} 
          />
          
          <MenuOption 
            icon="list" 
            label="Add to Playing Queue" 
            onPress={handleAddToQueue} 
          />
          
          <MenuOption 
            icon="plus-circle" 
            label="Add to Playlist" 
            onPress={handleAddToPlaylist} 
          />
          
          <MenuOption 
            icon="disc" 
            label="Go to Album" 
            onPress={() => handlePlaceholder('Go to Album')} 
          />
          
          <MenuOption 
            icon="user" 
            label="Go to Artist" 
            onPress={() => handlePlaceholder('Go to Artist')} 
          />
          
          <MenuOption 
            icon="info" 
            label="Details" 
            onPress={() => handlePlaceholder('Details')} 
          />

          <MenuOption 
            icon="share-2" 
            label="Share" 
            onPress={() => handlePlaceholder('Share')} 
          />

        </View>
      </View>

      {/* Add to Playlist Modal */}
      <AddToPlaylistModal
        visible={showPlaylistModal}
        onClose={() => setShowPlaylistModal(false)}
        track={song}
      />
    </Modal>
  );
};

// Helper Component for consistency
const MenuOption = ({ icon, label, onPress }: { icon: string; label: string; onPress: () => void }) => (
  <TouchableOpacity style={styles.menuOption} onPress={onPress}>
    <Icon name={icon} size={22} color="#FFF" style={styles.menuIcon} />
    <Text style={styles.menuLabel}>{label}</Text>
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)', // Semi-transparent dimming
  },
  sheetContainer: {
    position: 'absolute',
    bottom: 0,
    width: width,
    backgroundColor: '#1E1E1E', // Dark Grey background
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: 20,
    paddingBottom: 30,
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
  },
  dragIndicator: {
    width: 40,
    height: 4,
    backgroundColor: '#444',
    borderRadius: 2,
    alignSelf: 'center',
    marginTop: 10,
    marginBottom: 20,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  artwork: {
    width: 50,
    height: 50,
    borderRadius: 8,
    backgroundColor: '#333',
  },
  headerInfo: {
    flex: 1,
    marginLeft: 15,
    marginRight: 10,
    justifyContent: 'center',
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFF',
    marginBottom: 4,
  },
  artist: {
    fontSize: 14,
    color: '#AAA',
  },
  divider: {
    height: 1,
    backgroundColor: '#333',
    marginBottom: 10,
  },
  menuList: {
    marginTop: 5,
  },
  menuOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
  },
  menuIcon: {
    marginRight: 20,
  },
  menuLabel: {
    fontSize: 16,
    color: '#FFF',
    fontWeight: '500',
  },
});

export default SongMenuModal;