export interface Song {
  id: string;
  title: string;
  artist: string;
  artwork: string;
  url: string;
}

export interface Album {
  id: string;
  title: string;
  artist: string;
  year: string;
  artwork: string;
  songsCount: number;
}

const BASE_URL = 'https://saavn.sumit.co';

export const searchSongs = async (query: string): Promise<Song[]> => {
  try {
    const res = await fetch(`https://saavn.sumit.co/api/search/songs?query=${query}`);
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
      };
    });
  } catch (error) {
    console.error("API Error:", error);
    return [];
  }
};

export const searchAlbums = async (query: string): Promise<Album[]> => {
  try {
    const res = await fetch(`https://saavn.sumit.co/api/search/albums?query=${query}`);
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
      };
    });
  } catch (error) {
    console.error("Get Album Songs API Error:", error);
    return [];
  }
};