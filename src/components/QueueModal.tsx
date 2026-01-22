import React from 'react';
import { View, Text, TouchableOpacity, Modal, Image, StyleSheet, FlatList, Dimensions } from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import TrackPlayer from 'react-native-track-player'; // Import TrackPlayer for skipping
import { useMusicStore } from '../store/useMusicStore';

const { height } = Dimensions.get('window');

interface QueueModalProps {
  visible: boolean;
  onClose: () => void;
}

const QueueModal: React.FC<QueueModalProps> = ({ visible, onClose }) => {
  // We only need the data from the store
  const { queue, activeTrack } = useMusicStore();

  // 1. Find where we currently are in the queue
  const currentIndex = queue.findIndex(track => track.id === activeTrack?.id);

  // 2. Logic to slice the list (Show Current + Upcoming only)
  // If we can't find current track, just show everything.
  const visibleQueue = currentIndex !== -1 ? queue.slice(currentIndex) : queue;

  const handleTrackSelect = async (selectedTrack: any) => {
    try {
      // Find the REAL index of this track in the full queue
      const indexToSkipTo = queue.findIndex(t => t.id === selectedTrack.id);
      
      if (indexToSkipTo !== -1) {
        // Just skip to that index. The player listener will update the UI.
        await TrackPlayer.skip(indexToSkipTo);
        await TrackPlayer.play(); // Ensure it plays
      }
    } catch (error) {
      console.log("Error skipping to track:", error);
    }
  };

  const renderQueueItem = ({ item, index }: { item: any; index: number }) => {
    // Check if this specific item is the active one
    const isCurrent = item.id === activeTrack?.id;

    return (
      <TouchableOpacity 
        style={[styles.queueItem, isCurrent && styles.activeItem]}
        onPress={() => handleTrackSelect(item)}
      >
        <Image 
            source={{ uri: item.artwork || 'https://placehold.co/100x100.png' }} 
            style={styles.artwork} 
        />
        
        <View style={styles.infoContainer}>
            <Text 
                style={[styles.title, isCurrent && styles.activeText]} 
                numberOfLines={1}
            >
                {item.title}
            </Text>
            <Text style={styles.artist} numberOfLines={1}>
                {item.artist}
            </Text>
        </View>

        {/* Play Icon/Equalizer visual for active track */}
        {isCurrent && (
            <Icon name="bar-chart-2" size={24} color="#FF5733" />
        )}
      </TouchableOpacity>
    );
  };

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      {/* Tap outside to close */}
      <TouchableOpacity style={styles.overlay} onPress={onClose} activeOpacity={1}>
        
        {/* The Bottom Sheet */}
        <TouchableOpacity style={styles.modalContent} activeOpacity={1}>
          
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Playing Next</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
                <Icon name="chevron-down" size={28} color="#FFF" />
            </TouchableOpacity>
          </View>

          {/* The List */}
          <FlatList
            data={visibleQueue}
            keyExtractor={(item, index) => `${item.id}-${index}`}
            renderItem={renderQueueItem}
            contentContainerStyle={{ paddingBottom: 40 }}
            ListEmptyComponent={
                <View style={styles.emptyContainer}>
                    <Text style={styles.emptyText}>Queue is empty</Text>
                </View>
            }
          />
          
        </TouchableOpacity>
      </TouchableOpacity>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#1E1E1E', // Dark Grey (Starboy Theme)
    height: height * 0.6, // Takes up 60% of screen
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
    padding: 20,
    paddingBottom: 0,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    paddingHorizontal: 10,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#FFF',
  },
  closeBtn: {
    padding: 5,
  },
  queueItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    marginBottom: 10,
    borderRadius: 12,
    paddingHorizontal: 10,
  },
  activeItem: {
    backgroundColor: '#333', // Slightly lighter highlight for current song
  },
  artwork: {
    width: 50,
    height: 50,
    borderRadius: 8,
    backgroundColor: '#444',
  },
  infoContainer: {
    flex: 1,
    marginLeft: 15,
    justifyContent: 'center',
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFF',
    marginBottom: 4,
  },
  activeText: {
    color: '#FF5733', // Orange highlight
  },
  artist: {
    fontSize: 14,
    color: '#888',
  },
  emptyContainer: {
    marginTop: 50,
    alignItems: 'center',
  },
  emptyText: {
    color: '#666',
    fontSize: 16,
  }
});

export default QueueModal;