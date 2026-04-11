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

  let loopCount = 0;

  while (true) {
    try {
      const currentTrack = await provider.getCurrentTrack();

      if (!currentTrack) {
        if (lastTrack !== null) {
          console.log(`[Main] No music detected. Clearing RPC.`);
          await rpc.updatePresence(null);
          lastTrack = null;
        }
      } else {
        const hasTrackChanged = !lastTrack ||
          lastTrack.title !== currentTrack.title ||
          lastTrack.artist !== currentTrack.artist;
        
        const hasStateChanged = !lastTrack || 
          lastTrack.isPlaying !== currentTrack.isPlaying;

        // Force update every 3 cycles (15s) even if no change, 
        // to keep time/presence fresh in Discord UI
        const forceUpdate = loopCount % 3 === 0;

        if (hasTrackChanged || hasStateChanged || forceUpdate) {
          if (hasTrackChanged) console.log(`[Main] Track changed: ${currentTrack.title}`);
          await rpc.updatePresence(currentTrack);
          lastTrack = currentTrack;
        }
      }
    } catch (error) {
      console.error("[Main] Error in update loop:", error);
    }

    loopCount++;
    await new Promise(resolve => setTimeout(resolve, POLL_INTERVAL));
  }
}

main().catch(error => {
  console.error("[Main] Fatal error:", error);
  process.exit(1);
});
