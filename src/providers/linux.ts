import type { MusicProvider, TrackInfo } from "../types";
import { fetchArtwork } from "../utils/artwork";

export class LinuxProvider implements MusicProvider {
  async getCurrentTrack(): Promise<TrackInfo | null> {
    try {
      // Get all players that are playing or paused
      // mpris:artUrl is the property for artwork, mpris:length is duration in micros
      const format = "{{title}}|@|{{artist}}|@|{{album}}|@|{{status}}|@|{{position}}|@|{{mpris:artUrl}}|@|{{mpris:length}}";
      const proc = Bun.spawn(["playerctl", "-a", "metadata", "--format", format]);
      const output = await new Response(proc.stdout).text();
      const status = output.trim();

      if (!status || status.includes("No players found")) {
        return null;
      }

      const playerLines = status.split("\n").filter(l => l.trim().length > 0);
      
      let selectedLine: string | undefined = playerLines[0];
      
      for (const line of playerLines) {
        if (line.toLowerCase().includes("apple music")) {
          selectedLine = line;
          break;
        }
      }

      if (!selectedLine) return null;

      const parts = selectedLine.split("|@|");
      if (parts.length < 5) return null;

      let [title, artist, album, state, positionMicros, artUrl, durationMicros] = parts;

      title = (title || "").trim();
      artist = (artist || "").trim();
      album = (album || "").trim();
      artUrl = (artUrl || "").trim();

      // Clean up common web player title formats
      if (title.toLowerCase().includes("apple music")) {
        const segments = title.split(" - ");
        if (segments.length >= 2) {
          title = segments[0];
          if (!artist || artist === "Unknown Artist") {
            artist = segments[1];
          }
        }
      }

      // If artUrl is a local file (common on Linux), Discord won't be able to show it.
      if (!artUrl || artUrl.startsWith("file://")) {
        artUrl = await fetchArtwork(title || "", artist || "") || artUrl;
      }

      return {
        title: title || "Unknown Title",
        artist: artist || "Unknown Artist",
        album: album || "Apple Music",
        isPlaying: state?.toLowerCase() === "playing",
        position: parseInt(positionMicros ?? "0") / 1000000,
        duration: durationMicros ? parseInt(durationMicros) / 1000000 : undefined,
        artUrl: artUrl || undefined
      };
    } catch (error) {
      return null;
    }
  }
}
