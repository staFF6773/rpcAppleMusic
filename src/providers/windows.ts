import type { MusicProvider, TrackInfo } from "../types";
import { fetchArtwork } from "../utils/artwork";

export class WindowsProvider implements MusicProvider {
  async getCurrentTrack(): Promise<TrackInfo | null> {
    // On Windows, there isn't a simple built-in CLI to get the current media like osascript or playerctl.
    // However, we can use a PowerShell script that uses the Windows.Media.Control namespace (UWP APIs).
    // This is more complex but more robust than searching for window titles.

    const psScript = `
Add-Type -AssemblyName System.Runtime.WindowsRuntime
$asb = [Windows.Media.Control.GlobalSystemMediaTransportControlsSessionManager, Windows.Media.Control, ContentType=WindowsRuntime]::RequestAsync().GetResults()
$session = $asb.GetCurrentSession()
if ($session) {
    $info = $session.TryGetMediaPropertiesAsync().GetResults()
    $timeline = $session.GetTimelineProperties()
    $status = $session.GetPlaybackInfo().PlaybackStatus
    Write-Output ($info.Title + "|@|" + $info.Artist + "|@|" + $info.AlbumTitle + "|@|" + $status + "|@|" + $timeline.Position.TotalSeconds + "|@|" + $timeline.EndTime.TotalSeconds)
} else {
    Write-Output "NULL"
}
    `;

    try {
      const proc = Bun.spawn(["powershell", "-Command", psScript]);
      const output = await new Response(proc.stdout).text();
      const status = output.trim();

      if (status === "NULL" || !status) {
        return null;
      }

      const parts = status.split("|@|");
      if (parts.length < 5) return null;

      const [title, artist, album, state, position, duration] = parts;

      const artUrl = await fetchArtwork(title || "", artist || "");

      return {
        title: title ?? "Unknown Title",
        artist: artist ?? "Unknown Artist",
        album: album ?? "Unknown Album",
        isPlaying: (state ?? "").toLowerCase().includes("playing"),
        position: parseFloat((position ?? "0").replace(",", ".")),
        duration: duration ? parseFloat(duration.replace(",", ".")) : undefined,
        artUrl
      };
    } catch (error) {
      console.error("Error getting track info on Windows:", error);
      return null;
    }
  }
}

