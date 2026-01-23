import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Modal } from 'react-native';
import { useProgress } from 'react-native-track-player';
import TrackPlayer from 'react-native-track-player';
import { useMusicStore } from '../store/useMusicStore';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

interface PlayerScreenProps {
  visible?: boolean;
  onClose?: () => void;
}

const PlayerScreen: React.FC<PlayerScreenProps> = ({ visible, onClose }) => {
  const { activeTrack, isPlaying, togglePlay, skipToNext, skipToPrevious, toggleFavorite, isFavorite } = useMusicStore();
  const { position, duration } = useProgress();
  const navigation = useNavigation<any>();

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const seekBy = async (seconds: number) => {
    try {
      const newPosition = Math.max(0, Math.min(position + seconds, duration));
      await TrackPlayer.seekTo(newPosition);
    } catch (error) {
      console.error('Error seeking:', error);
    }
  };

  const progress = duration > 0 ? (position / duration) * 100 : 0;
  const isFavorited = activeTrack ? isFavorite(activeTrack.id) : false;

  if (!activeTrack) return null;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="fullScreen"
      statusBarTranslucent
    >
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Ionicons name="chevron-down" size={28} color="#333" />
          </TouchableOpacity>
          <View style={styles.headerButtons}>
            <TouchableOpacity 
              onPress={() => navigation.navigate('Queue')}
              style={styles.headerButton}
            >
              <Ionicons name="list" size={24} color="#333" />
            </TouchableOpacity>
            <TouchableOpacity 
              onPress={() => activeTrack && toggleFavorite(activeTrack)}
              style={styles.headerButton}
            >
              <Ionicons 
                name={isFavorited ? "heart" : "heart-outline"} 
                size={24} 
                color={isFavorited ? "#FF6B35" : "#333"} 
              />
            </TouchableOpacity>
          </View>
        </View>

        {/* Artwork */}
        <View style={styles.artworkContainer}>
          <Image 
            source={{ uri: activeTrack.artwork || 'https://via.placeholder.com/300' }}
            style={styles.artwork}
          />
        </View>

        {/* Track Info */}
        <View style={styles.trackInfo}>
          <Text style={styles.title}>{activeTrack.title}</Text>
          <Text style={styles.artist}>{activeTrack.artist}</Text>
        </View>

        {/* Progress */}
        <View style={styles.progressContainer}>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: `${progress}%` }]} />
          </View>
          <View style={styles.timeLabels}>
            <Text style={styles.timeText}>{formatTime(position)}</Text>
            <Text style={styles.timeText}>{formatTime(duration)}</Text>
          </View>
          
          {/* +/- 5 Second Controls */}
          <View style={styles.seekControls}>
            <TouchableOpacity 
              onPress={() => seekBy(-5)} 
              style={styles.seekButton}
            >
              <Ionicons name="remove" size={16} color="#666" />
              <Text style={styles.seekText}>5</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              onPress={() => seekBy(5)} 
              style={styles.seekButton}
            >
              <Ionicons name="add" size={16} color="#666" />
              <Text style={styles.seekText}>5</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Controls */}
        <View style={styles.controls}>
          <TouchableOpacity onPress={skipToPrevious} style={styles.controlButton}>
            <Ionicons name="play-skip-back" size={32} color="#333" />
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.playPauseButton}
            onPress={togglePlay}
          >
            <Ionicons 
              name={isPlaying ? 'pause' : 'play'} 
              size={40} 
              color="#fff" 
            />
          </TouchableOpacity>
          
          <TouchableOpacity onPress={skipToNext} style={styles.controlButton}>
            <Ionicons name="play-skip-forward" size={32} color="#333" />
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    paddingTop: 50,
    paddingHorizontal: 20,
  },
  content: {
    flex: 1,
    justifyContent: 'space-between',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 40,
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F5F5F5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerButtons: {
    flexDirection: 'row',
    gap: 15,
  },
  headerButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F5F5F5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  artworkContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  artwork: {
    width: 300,
    height: 300,
    borderRadius: 20,
    backgroundColor: '#F5F5F5',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 10,
  },
  trackInfo: {
    alignItems: 'center',
    marginBottom: 40,
    maxWidth: '100%',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginBottom: 8,
  },
  artist: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  progressContainer: {
    marginBottom: 30,
  },
  progressBar: {
    height: 4,
    backgroundColor: '#F5F5F5',
    borderRadius: 2,
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#FF6B35',
    borderRadius: 2,
  },
  timeLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  timeText: {
    color: '#666',
    fontSize: 12,
  },
  seekControls: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 15,
  },
  seekButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
    gap: 4,
  },
  seekText: {
    fontSize: 12,
    color: '#666',
    fontWeight: '500',
  },
  controls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 40,
    paddingBottom: 40,
  },
  controlButton: {
    padding: 10,
  },
  playPauseButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#FF6B35',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#FF6B35',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 12,
  },
});

export default PlayerScreen;