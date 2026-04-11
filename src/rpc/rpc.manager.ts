import { Client } from "@xhayper/discord-rpc";
import type { TrackInfo } from "../types";

export class RPCManager {
  private client: Client;
  private clientId: string;
  private isConnected: boolean = false;

  constructor(clientId: string) {
    this.clientId = clientId;
    this.client = new Client({
      clientId: this.clientId
    });

    this.client.on("ready", () => {
      console.log(`[RPC] Ready! Connected to Discord.`);
      this.isConnected = true;
    });

    this.client.on("close", () => {
      console.log(`[RPC] Disconnected from Discord.`);
      this.isConnected = false;
    });
  }

  async connect(): Promise<void> {
    if (this.isConnected) return;

    try {
      console.log(`[RPC] Attempting to connect to Discord...`);
      await this.client.login();
    } catch (error) {
      console.error(`[RPC] Connection error:`, (error as Error).message);
      if ((error as Error).message.includes("TIMEOUT") || (error as Error).message.includes("closed") || (error as Error).message.includes("Could not connect")) {
        console.log("[RPC] Retrying in 10 seconds...");
        setTimeout(() => this.connect(), 10000);
      }
    }
  }

  async updatePresence(track: TrackInfo | null): Promise<void> {
    if (!this.isConnected) {
      this.connect();
      return;
    }

    if (!track) {
      await this.client.user?.clearActivity();
      return;
    }

    const startTimestamp = Math.floor(Date.now() / 1000 - track.position);
    const endTimestamp = track.duration
      ? startTimestamp + Math.floor(track.duration)
      : undefined;

    const searchQuery = encodeURIComponent(`${track.title} ${track.artist}`);
    const artistQuery = encodeURIComponent(track.artist);

    const state = track.isPlaying
      ? `${track.artist} — ${track.album}`
      : `${track.artist} — ${track.album} (Paused)`;

    const source = track.source || "Apple Music";

    try {
      const activity = {
        type: 2, // LISTENING (shows "Listening to...")
        details: track.title,
        state,
        largeImageKey: track.artUrl || "music_large",
        largeImageText: track.album || source,
        smallImageKey: track.isPlaying ? "play_icon" : "pause_icon",
        smallImageText: track.isPlaying
          ? `🎶 Listening on ${source}`
          : `⏸ Paused on ${source}`,
        instance: false,
        buttons: [
          {
            label: "Search on Apple Music",
            url: `https://music.apple.com/search?term=${searchQuery}`
          },
          {
            label: "View Artist",
            url: `https://music.apple.com/search?term=${artistQuery}`
          }
        ],
        startTimestamp,
        endTimestamp: track.isPlaying ? endTimestamp : undefined
      };

      await this.client.user?.setActivity(activity);
      console.log(`[RPC] Activity Set (Listening): ${track.title} by ${track.artist}`);
    } catch (error) {
      console.error(`[RPC] Failed to update activity:`, (error as Error).message);
    }
  }

  async clear(): Promise<void> {
    if (this.isConnected) {
      console.log(`[RPC] Clearing activity...`);
      await this.client.user?.clearActivity();
    }
  }
}
