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
    const endTimestamp = track.duration ? (startTimestamp + Math.floor(track.duration)) : undefined;
    
    try {
      await this.client.user?.setActivity({
        details: track.title,
        state: `by ${track.artist}${track.isPlaying ? "" : " (En pausa)"}`,
        largeImageKey: track.artUrl || "music_large",
        largeImageText: track.album || "Apple Music",
        smallImageKey: track.isPlaying ? "play_icon" : "pause_icon",
        smallImageText: track.isPlaying ? "Reproduciendo" : "Pausado",
        instance: false,
        buttons: [
          { label: "Escuchar en Apple Music", url: "https://music.apple.com" }
        ],
        startTimestamp: track.isPlaying ? startTimestamp : undefined,
        endTimestamp: track.isPlaying ? endTimestamp : undefined
      });
      console.log(`[RPC] Updated: ${track.title} - ${track.artist} (${track.isPlaying ? "Playing" : "Paused"})`);
    } catch (error) {
      console.error(`[RPC] Failed to update activity:`, (error as Error).message);
    }
  }

  async clear(): Promise<void> {
    if (this.isConnected) {
      await this.client.user?.clearActivity();
    }
  }
}
