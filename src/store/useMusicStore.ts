import { create } from 'zustand';
import TrackPlayer, { Track, AppKilledPlaybackBehavior, Capability, RepeatMode } from 'react-native-track-player';
import AsyncStorage from '@react-native-async-storage/async-storage';
// Use standard native Toast or a library like 'react-native-toast-message'
import { ToastAndroid, Platform, Alert } from 'react-native';

// Playlist Interface
export interface Playlist {
  id: string;
  name: string;
  songs: Track[];
  artwork?: string;
}

interface MusicStore {
  activeTrack: Track | null;
  isPlaying: boolean;
  isPlayerVisible: boolean;
  queue: Track[];
  repeatMode: 'off' | 'track' | 'queue';
  favorites: Track[];
  playlists: Playlist[];

  playTrack: (track: Track) => Promise<void>;
  togglePlay: () => Promise<void>;
  setPlayerVisible: (visible: boolean) => void;
  resetPlayer: () => Promise<void>;
  addToQueue: (track: Track) => Promise<void>;
  playNext: (track: Track) => Promise<void>;
  setQueue: (queue: Track[]) => void;
  clearQueue: () => void;
  reorderQueue: (fromIndex: number, toIndex: number) => void;
  toggleRepeat: () => void;
  setRepeatMode: (mode: 'off' | 'track' | 'queue') => void;
  
  // New: Skip Navigation Actions
  skipToNext: () => Promise<void>;
  skipToPrevious: () => Promise<void>;
  
  // New: Favorites Actions
  toggleFavorite: (track: Track) => Promise<void>;
  loadFavorites: () => Promise<void>;
  isFavorite: (trackId: string) => boolean;
  
  // New: Playlist Actions
  createPlaylist: (name: string) => Promise<string>;
  deletePlaylist: (id: string) => Promise<void>;
  addTrackToPlaylist: (playlistId: string, track: Track) => Promise<void>;
  loadPlaylists: () => Promise<void>;
}

export const useMusicStore = create<MusicStore>((set, get) => ({
  activeTrack: null,
  isPlaying: false,
  isPlayerVisible: false,
  queue: [],
  repeatMode: 'off',
  favorites: [],
  playlists: [],

  playTrack: async (track: Track) => {
    console.log('Playing track:', track);
    
    // FIX: When starting a new song (resetting), the queue must become just that song.
    set({ 
        activeTrack: track, 
        isPlaying: true, 
        isPlayerVisible: true,
        queue: [track] // <--- IMPORTANT: Reset UI queue to match player
    });

    try {
      await TrackPlayer.reset();
      await TrackPlayer.add(track);
      await TrackPlayer.play();
    } catch (error) {
      console.error('Error playing track:', error);
      set({ isPlaying: false, activeTrack: null });
    }
  },

  togglePlay: async () => {
    const { isPlaying } = get();
    try {
      if (isPlaying) {
        await TrackPlayer.pause();
      } else {
        await TrackPlayer.play();
      }
      set({ isPlaying: !isPlaying });
    } catch (error) {
      console.error('Error toggling play state:', error);
    }
  },

  setPlayerVisible: (visible: boolean) => {
    set({ isPlayerVisible: visible });
  },

  resetPlayer: async () => {
    try {
      await TrackPlayer.reset();
      set({
        activeTrack: null,
        isPlaying: false,
        isPlayerVisible: false,
        queue: [],
      });
    } catch (error) {
      console.error('Error resetting player:', error);
    }
  },

  addToQueue: async (track: Track) => {
    try {
      await TrackPlayer.add(track);
      const { queue } = get();
      set({ queue: [...queue, track] });
      
      if (Platform.OS === 'android') {
        ToastAndroid.show('Added to queue', ToastAndroid.SHORT);
      }
    } catch (error) {
      console.error('Error adding to queue:', error);
    }
  },

  // FIXED: Logic now inserts song instead of skipping
  playNext: async (track: Track) => {
    try {
      const currentTrackIndex = await TrackPlayer.getActiveTrackIndex();
      const { queue } = get();

      if (currentTrackIndex === undefined || currentTrackIndex === null) {
        // If nothing is playing, just play this
        get().playTrack(track);
        return;
      }

      // 1. Add to TrackPlayer right after current index
      const insertIndex = currentTrackIndex + 1;
      await TrackPlayer.add(track, insertIndex);

      // 2. Update Zustand Queue state
      const newQueue = [...queue];
      newQueue.splice(insertIndex, 0, track); // Insert at specific index
      set({ queue: newQueue });

      if (Platform.OS === 'android') {
        ToastAndroid.show('Playing next', ToastAndroid.SHORT);
      }
    } catch (error) {
      console.error('Error playing next track:', error);
    }
  },

  setQueue: (queue: Track[]) => {
    set({ queue });
  },

  clearQueue: () => {
    set({ queue: [] });
  },

  reorderQueue: (fromIndex: number, toIndex: number) => {
    const { queue } = get();
    const newQueue = [...queue];
    const [movedItem] = newQueue.splice(fromIndex, 1);
    newQueue.splice(toIndex, 0, movedItem);
    set({ queue: newQueue });
  },

  toggleRepeat: async () => {
    const { repeatMode } = get();
    let newMode: 'off' | 'track' | 'queue';
    
    if (repeatMode === 'off') {
      newMode = 'track';
    } else if (repeatMode === 'track') {
      newMode = 'queue';
    } else {
      newMode = 'off';
    }
    
    set({ repeatMode: newMode });
    
    // Update TrackPlayer repeat mode
    try {
      if (newMode === 'off') {
        await TrackPlayer.setRepeatMode(RepeatMode.Off);
      } else if (newMode === 'track') {
        await TrackPlayer.setRepeatMode(RepeatMode.Track);
      } else {
        await TrackPlayer.setRepeatMode(RepeatMode.Queue);
      }
    } catch (error) {
      console.error('Error setting repeat mode:', error);
    }
  },

  setRepeatMode: async (mode: 'off' | 'track' | 'queue') => {
    set({ repeatMode: mode });
    
    // Update TrackPlayer repeat mode
    try {
      if (mode === 'off') {
        await TrackPlayer.setRepeatMode(RepeatMode.Off);
      } else if (mode === 'track') {
        await TrackPlayer.setRepeatMode(RepeatMode.Track);
      } else {
        await TrackPlayer.setRepeatMode(RepeatMode.Queue);
      }
    } catch (error) {
      console.error('Error setting repeat mode:', error);
    }
  },

  // New: Skip Navigation Actions
  skipToNext: async () => {
    try {
      // 1. Check if there is a next song
      const current = await TrackPlayer.getActiveTrackIndex();
      const queue = await TrackPlayer.getQueue();
      
      if (current !== undefined && current < queue.length - 1) {
        await TrackPlayer.skipToNext();
        // Update activeTrack state immediately for snappy UI
        set({ activeTrack: queue[current + 1] });
      } else {
        // Optional: If at end of queue and repeat is on, loop back
        const { repeatMode } = get(); 
        // (Logic handled natively by TrackPlayer usually, but good to have safety)
      }
    } catch (e) {
      console.log('Skip Error', e);
    }
  },

  skipToPrevious: async () => {
    try {
      // 1. Check if there is a previous song
      const current = await TrackPlayer.getActiveTrackIndex();
      
      if (current !== undefined && current > 0) {
        await TrackPlayer.skipToPrevious();
        // Update activeTrack state immediately for snappy UI
        const queue = await TrackPlayer.getQueue();
        set({ activeTrack: queue[current - 1] });
      }
    } catch (e) {
      console.log('Skip Previous Error', e);
    }
  },

  toggleFavorite: async (track: Track) => {
    const { favorites } = get();
    console.log('Current Favorites before toggle:', favorites);
    
    const existingIndex = favorites.findIndex(fav => fav.id === track.id);
    
    let updatedFavorites: Track[];
    if (existingIndex >= 0) {
      // Remove from favorites
      updatedFavorites = favorites.filter(fav => fav.id !== track.id);
      console.log('Removed from favorites:', track.title);
    } else {
      // Add to favorites
      updatedFavorites = [...favorites, track];
      console.log('Added to favorites:', track.title);
    }
    
    // Update state
    set({ favorites: updatedFavorites });
    console.log('Updated Favorites:', updatedFavorites);
    
    // Save to AsyncStorage
    try {
      await AsyncStorage.setItem('favorites', JSON.stringify(updatedFavorites));
      console.log('Successfully saved favorites to AsyncStorage');
    } catch (error) {
      console.error('Error saving favorites to AsyncStorage:', error);
    }
  },

  loadFavorites: async () => {
    try {
      const storedFavorites = await AsyncStorage.getItem('favorites');
      if (storedFavorites) {
        const favorites = JSON.parse(storedFavorites);
        set({ favorites });
      }
    } catch (error) {
      console.error('Error loading favorites from AsyncStorage:', error);
    }
  },

  isFavorite: (trackId: string) => {
    const { favorites } = get();
    return favorites.some(fav => fav.id === trackId);
  },

  // New: Playlist Actions
  createPlaylist: async (name: string) => {
    const { playlists } = get();
    const newPlaylist: Playlist = {
      id: Date.now().toString(),
      name,
      songs: [],
      artwork: 'https://placehold.co/200x200/orange/white?text=Playlist',
    };
    
    const updatedPlaylists = [...playlists, newPlaylist];
    set({ playlists: updatedPlaylists });
    
    // Save to AsyncStorage
    try {
      await AsyncStorage.setItem('playlists', JSON.stringify(updatedPlaylists));
      console.log('Created playlist:', name);
      
      if (Platform.OS === 'android') {
        ToastAndroid.show(`Created "${name}"`, ToastAndroid.SHORT);
      }
      
      return newPlaylist.id;
    } catch (error) {
      console.error('Error saving playlist to AsyncStorage:', error);
      throw error;
    }
  },

  deletePlaylist: async (id: string) => {
    const { playlists } = get();
    const updatedPlaylists = playlists.filter(playlist => playlist.id !== id);
    set({ playlists: updatedPlaylists });
    
    // Save to AsyncStorage
    try {
      await AsyncStorage.setItem('playlists', JSON.stringify(updatedPlaylists));
      console.log('Deleted playlist:', id);
      
      if (Platform.OS === 'android') {
        ToastAndroid.show('Playlist deleted', ToastAndroid.SHORT);
      }
    } catch (error) {
      console.error('Error deleting playlist from AsyncStorage:', error);
    }
  },

  addTrackToPlaylist: async (playlistId: string, track: Track) => {
    const { playlists } = get();
    const playlistIndex = playlists.findIndex(playlist => playlist.id === playlistId);
    
    if (playlistIndex === -1) {
      throw new Error('Playlist not found');
    }
    
    const updatedPlaylists = [...playlists];
    const playlist = updatedPlaylists[playlistIndex];
    
    // Check if track already exists in playlist
    const trackExists = playlist.songs.some(song => song.id === track.id);
    if (trackExists) {
      if (Platform.OS === 'android') {
        ToastAndroid.show('Already in playlist', ToastAndroid.SHORT);
      }
      return;
    }
    
    // Add track to playlist
    playlist.songs.push(track);
    
    // Update artwork if playlist is empty (use first track's artwork)
    if (playlist.songs.length === 1 && track.artwork) {
      playlist.artwork = track.artwork;
    }
    
    set({ playlists: updatedPlaylists });
    
    // Save to AsyncStorage
    try {
      await AsyncStorage.setItem('playlists', JSON.stringify(updatedPlaylists));
      console.log(`Added "${track.title}" to "${playlist.name}"`);
      
      if (Platform.OS === 'android') {
        ToastAndroid.show(`Added to ${playlist.name}`, ToastAndroid.SHORT);
      }
    } catch (error) {
      console.error('Error adding track to playlist:', error);
    }
  },

  loadPlaylists: async () => {
    try {
      const storedPlaylists = await AsyncStorage.getItem('playlists');
      if (storedPlaylists) {
        const playlists = JSON.parse(storedPlaylists);
        set({ playlists });
        console.log('Loaded playlists:', playlists.length);
      }
    } catch (error) {
      console.error('Error loading playlists from AsyncStorage:', error);
    }
  },
}));