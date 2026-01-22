import React from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet } from 'react-native';
import { useMusicStore } from '../store/useMusicStore';
import { useProgress } from 'react-native-track-player';
import { Ionicons } from '@expo/vector-icons';

const MiniPlayer: React.FC = () => {
  const { activeTrack, isPlaying, togglePlay, setPlayerVisible } = useMusicStore();
  const { position, duration } = useProgress();

  // Hide if no active track
  if (!activeTrack) {
    return null;
  }

  // Safe progress calculation to prevent NaN
  const progressPercent = (duration > 0 && position >= 0) ? (position / duration) * 100 : 0;

  return (
    <View style={styles.container}>
      <TouchableOpacity 
        style={styles.mainContent}
        onPress={() => setPlayerVisible(true)}
        activeOpacity={0.8}
      >
        {/* Artwork */}
        <Image 
          source={{ uri: activeTrack.artwork || 'https://via.placeholder.com/40' }}
          style={styles.artwork}
        />
        
        {/* Track Info */}
        <View style={styles.trackInfo}>
          <Text style={styles.title} numberOfLines={1}>
            {activeTrack.title}
          </Text>
          <Text style={styles.artist} numberOfLines={1}>
            {activeTrack.artist}
          </Text>
        </View>
      </TouchableOpacity>
      
      {/* Play/Pause Button */}
      <TouchableOpacity 
        style={styles.playButton}
        onPress={(e) => {
          e.stopPropagation();
          togglePlay();
        }}
        activeOpacity={0.7}
      >
        <Ionicons 
          name={isPlaying ? 'pause' : 'play'} 
          size={20} 
          color="#fff" 
        />
      </TouchableOpacity>
      
      {/* Progress Bar */}
      <View style={styles.progressContainer}>
        <View style={[styles.progressBar, { width: `${progressPercent}%` }]} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 60, // Reduced from 80 to 60 - closer to tab bar
    left: 10,
    right: 10,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
  },
  mainContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  artwork: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: '#f0f0f0',
  },
  trackInfo: {
    flex: 1,
    marginLeft: 12,
    marginRight: 12,
  },
  title: {
    color: '#000',
    fontWeight: 'bold',
    fontSize: 14,
    marginBottom: 2,
  },
  artist: {
    color: '#666',
    fontSize: 12,
  },
  playButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FF5733',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#FF5733',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  progressContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 2,
    backgroundColor: '#f0f0f0',
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#FF5733',
  },
});

export default MiniPlayer;
