export interface TrackInfo {
  title: string;
  artist: string;
  album: string;
  isPlaying: boolean;
  position: number; // in seconds
  duration?: number; // in seconds, if available
  artUrl?: string; // URL to the cover art
  source?: string; // Music app name, e.g. "Apple Music", "Spotify"
}

export interface MusicProvider {
  /**
   * Returns the current track information.
   * Should return null if no music is playing or the application is closed.
   */
  getCurrentTrack(): Promise<TrackInfo | null>;
}
