import type { MusicProvider, TrackInfo } from "../types";
import { fetchArtwork } from "../utils/artwork";

export class MacOSProvider implements MusicProvider {
  async getCurrentTrack(): Promise<TrackInfo | null> {
    const appleScript = `
      tell application "Music"
        if it is running then
          set musicState to player state
          if musicState is playing or musicState is paused then
            set trackName to name of current track
            set trackArtist to artist of current track
            set trackAlbum to album of current track
            set trackPosition to player position
            set trackDuration to duration of current track
            return trackName & "|@|" & trackArtist & "|@|" & trackAlbum & "|@|" & (musicState as string) & "|@|" & trackPosition & "|@|" & trackDuration
          end if
        end if
      end tell
      return "NULL"
    `;

    try {
      const proc = Bun.spawn(["osascript", "-e", appleScript]);
      const output = await new Response(proc.stdout).text();
      const status = output.trim();

      if (status === "NULL" || !status) {
        return null;
      }

      const parts = status.split("|@|");
      if (parts.length < 6) return null;

      const [title, artist, album, state, position, duration] = parts;

      const artUrl = await fetchArtwork(title || "", artist || "", album || "");

      return {
        title: title ?? "Unknown Title",
        artist: artist ?? "Unknown Artist",
        album: album ?? "Unknown Album",
        isPlaying: state?.toLowerCase() === "playing",
        position: parseFloat((position ?? "0").replace(",", ".")),
        duration: parseFloat((duration ?? "0").replace(",", ".")),
        artUrl,
        source: "Apple Music"
      };
    } catch (error) {
      console.error("Error getting track info on macOS:", error);
      return null;
    }
  }
}

