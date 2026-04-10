import { ProviderFactory } from "./providers/provider.factory";
import { RPCManager } from "./rpc/rpc.manager";
import type { TrackInfo } from "./types";

// Replace with your own Client ID from Discord Developer Portal if you want custom assets
const CLIENT_ID = "1492247566539034794"; // Example/Default ID
const POLL_INTERVAL = 5000; // 5 seconds

async function main() {
  console.log("-----------------------------------------");
  console.log("🎵 Music Discord RPC (Bun) 🎵");
  console.log(`Platform: ${process.platform}`);
  console.log("-----------------------------------------");

  const provider = ProviderFactory.getProvider();
  const rpc = new RPCManager(CLIENT_ID);

  let lastTrack: TrackInfo | null = null;

  // Signal handling for clean exit
  process.on("SIGINT", async () => {
    console.log("\n[Main] Shutting down...");
    await rpc.clear();
    process.exit(0);
  });

  await rpc.connect();

  console.log(`[Main] Starting update loop (every ${POLL_INTERVAL / 1000}s)...`);

  while (true) {
    try {
      const currentTrack = await provider.getCurrentTrack();

      if (!currentTrack) {
        if (lastTrack !== null) {
          console.log("[Main] No music detected. Clearing RPC.");
          await rpc.updatePresence(null);
          lastTrack = null;
        }
      } else {
        const hasChanged = !lastTrack ||
          lastTrack.title !== currentTrack.title ||
          lastTrack.artist !== currentTrack.artist ||
          lastTrack.isPlaying !== currentTrack.isPlaying;

        if (hasChanged) {
          await rpc.updatePresence(currentTrack);
          lastTrack = currentTrack;
        } else {
          // Optional: update presence anyway if we want to sync time better?
          // For now, we only update if track info changed as requested.
        }
      }
    } catch (error) {
      console.error("[Main] Error in update loop:", error);
    }

    await new Promise(resolve => setTimeout(resolve, POLL_INTERVAL));
  }
}

main().catch(error => {
  console.error("[Main] Fatal error:", error);
  process.exit(1);
});
