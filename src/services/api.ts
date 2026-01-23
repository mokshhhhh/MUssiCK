export interface Song {
  id: string;
  title: string;
  artist: string;
  artwork: string;
  url: string;
  duration: number;
}

export interface Album {
  id: string;
  title: string;
  artist: string;
  year: string;
  artwork: string;
  songsCount: number;
}

export interface Artist {
  id: string;
  name: string;
  artwork: string;
  albumsCount: number;
  songsCount: number;
}
const BASE_URL = 'https://saavn.sumit.co';

export const searchSongs = async (query: string, page: number = 1, limit: number = 20): Promise<Song[]> => {
  try {
    const res = await fetch(`https://saavn.sumit.co/api/search/songs?query=${query}&page=${page}&limit=${limit}`);
    const json = await res.json();
    const results = json.data?.results || json.results || [];

    return results.map((item: any) => {
      // 1. Get highest quality image
      const imgObj = item.image?.[item.image.length - 1];
      const artwork = imgObj?.link || imgObj?.url || 'https://placehold.co/200x200.png';//place hold justin case

      // 2. Get highest quality audio , FORCE HTTPS in case android prevents audio
      const downObj = item.downloadUrl?.[item.downloadUrl.length - 1];
      let audioUrl = downObj?.link || downObj?.url || "";
      audioUrl = audioUrl.replace("http://", "https://"); // <--- CRITICAL FIX

      // 3. Robust Artist Mapping
      let artistName = "Unknown Artist";
      if (typeof item.primaryArtists === 'string') {
        artistName = item.primaryArtists;
      } else if (item.artists?.primary?.[0]?.name) {
        artistName = item.artists.primary.map((a: any) => a.name).join(', ');
      } else if (item.singers) {
        artistName = item.singers;
      }

      return {
        id: item.id,
        title: item.name,
        artist: artistName,
        artwork: artwork,
        url: audioUrl, 
        duration: item.duration ? parseInt(item.duration) : 0,
      };
    });
  } catch (error) {
    console.error("API Error:", error);
    return [];
  }
};

export const searchAlbums = async (query: string, page: number = 1, limit: number = 20): Promise<Album[]> => {
  try {
    const res = await fetch(`https://saavn.sumit.co/api/search/albums?query=${query}&page=${page}&limit=${limit}`);
    const json = await res.json();
    const results = json.data?.results || json.results || [];

    return results.map((item: any) => {
      // Get highest quality image
      const imgObj = item.image?.[item.image.length - 1];
      const artwork = imgObj?.link || imgObj?.url || 'https://placehold.co/200x200.png';

      // Robust Artist Mapping
      let artistName = "Unknown Artist";
      if (item.artist) {
        artistName = item.artist;
      } else if (typeof item.primaryArtists === 'string') {
        artistName = item.primaryArtists;
      } else if (item.artists?.primary?.[0]?.name) {
        artistName = item.artists.primary.map((a: any) => a.name).join(', ');
      } else if (item.singers) {
        artistName = item.singers;
      }

      return {
        id: item.id,
        title: item.name,
        artist: artistName,
        year: item.year || 'Unknown',
        artwork: artwork,
        songsCount: item.songCount || 0,
      };
    });
  } catch (error) {
    console.error("Albums API Error:", error);
    return [];
  }
};

export const getAlbumSongs = async (albumId: string): Promise<Song[]> => {
  try {
    const res = await fetch(`https://saavn.sumit.co/api/albums?id=${albumId}`);
    const json = await res.json();
    const albumData = json.data || json;

    if (!albumData || !albumData.songs) {
      return [];
    }

    return albumData.songs.map((item: any) => {
      // 1. Get highest quality image
      const imgObj = item.image?.[item.image.length - 1];
      const artwork = imgObj?.link || imgObj?.url || 'https://placehold.co/200x200.png';

      // 2. Get highest quality audio, FORCE HTTPS
      const downObj = item.downloadUrl?.[item.downloadUrl.length - 1];
      let audioUrl = downObj?.link || downObj?.url || "";
      audioUrl = audioUrl.replace("http://", "https://");

      // 3. Robust Artist Mapping
      let artistName = "Unknown Artist";
      if (typeof item.primaryArtists === 'string') {
        artistName = item.primaryArtists;
      } else if (item.artists?.primary?.[0]?.name) {
        artistName = item.artists.primary.map((a: any) => a.name).join(', ');
      } else if (item.singers) {
        artistName = item.singers;
      }

      return {
        id: item.id,
        title: item.name,
        artist: artistName,
        artwork: artwork,
        url: audioUrl,
        duration: item.duration ? parseInt(item.duration) : 0,
      };
    });
  } catch (error) {
    console.error("Get Album Songs API Error:", error);
    return [];
  }
};

export const searchArtists = async (query: string, page: number = 1, limit: number = 10): Promise<Artist[]> => {
  try {
    const res = await fetch(`https://saavn.sumit.co/api/search/artists?query=${query}&page=${page}&limit=${limit}`);
    const json = await res.json();
    const results = json.data?.results || json.results || [];

    return results.map((item: any) => {
      // Get highest quality image
      const imgObj = item.image?.[item.image.length - 1];
      const artwork = imgObj?.link || imgObj?.url || 'https://placehold.co/200x200.png';

      return {
        id: item.id,
        name: item.name,
        artwork: artwork,
        albumsCount: 0, // API doesn't always return this in search
        songsCount: 0,
      };
    });
  } catch (error) {
    console.error("Artists API Error:", error);
    return [];
  }
};

// Replace your existing getArtistDetails with this robust version

export const getArtistDetails = async (artistId: string) => {
  try {
    // 1. Initial Request (Try to get official data)
    const url = `${BASE_URL}/artists?id=${artistId}&page=1&count=50&n_song=50&n_album=50`;
    const res = await fetch(url);
    const json = await res.json();
    const data = json.data || json;

    if (!data) return null;

    // ---------------------------------------------------------
    // PROCESS SONGS
    // ---------------------------------------------------------
    let topSongs = (data.topSongs || data.songs || []).map((item: any) => {
      const imgObj = item.image?.[item.image.length - 1];
      const artwork = imgObj?.link || imgObj?.url || 'https://placehold.co/200x200.png';
      
      const downObj = item.downloadUrl?.[item.downloadUrl.length - 1];
      let audioUrl = downObj?.link || downObj?.url || "";
      audioUrl = audioUrl.replace("http://", "https://");

      return {
        id: item.id,
        title: item.name,
        artist: item.artist || item.primaryArtists || data.name,
        artwork: artwork,
        url: audioUrl,
        duration: item.duration ? parseInt(item.duration) : 0,
      };
    });

    // 🚨 FALLBACK: If we have fewer than 5 songs, FORCE a search to get more
    if (topSongs.length < 5 && data.name) {
      console.log("⚠️ Low song count, forcing fallback search for:", data.name);
      const searchResults = await searchSongs(data.name, 1, 20); // Fetch 20 more
      
      // Merge them, avoiding duplicates
      const existingIds = new Set(topSongs.map((s: any) => s.id));
      const newSongs = searchResults.filter((s: any) => !existingIds.has(s.id));
      topSongs = [...topSongs, ...newSongs];
    }

    // ---------------------------------------------------------
    // PROCESS ALBUMS
    // ---------------------------------------------------------
    let albums = (data.topAlbums || data.albums || []).map((item: any) => {
      const imgObj = item.image?.[item.image.length - 1];
      const artwork = imgObj?.link || imgObj?.url || 'https://placehold.co/200x200.png';

      return {
        id: item.id,
        title: item.name,
        artist: data.name,
        year: item.year || '',
        artwork: artwork,
        songsCount: 0, 
      };
    });

    // 🚨 FALLBACK: If we have fewer than 5 albums, FORCE an album search
    if (albums.length < 5 && data.name) {
      console.log("⚠️ Low album count, forcing album search for:", data.name);
      const albumResults = await searchAlbums(data.name, 1, 20); // Fetch 20 more
      
      // Merge them
      const existingIds = new Set(albums.map((a: any) => a.id));
      const newAlbums = albumResults.filter((a: any) => !existingIds.has(a.id));
      albums = [...albums, ...newAlbums];
    }

    return {
      name: data.name,
      bio: data.bio ? (typeof data.bio === 'string' ? JSON.parse(data.bio) : data.bio) : [],
      fanCount: data.fanCount || 0,
      topSongs, 
      albums,
    };
  } catch (error) {
    console.error("Get Artist Details Error:", error);
    return null;
  }
};