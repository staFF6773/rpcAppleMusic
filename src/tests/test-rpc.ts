import { RPCManager } from "../rpc/rpc.manager";
import type { TrackInfo } from "../types";

const CLIENT_ID = "1492247566539034794";
const rpc = new RPCManager(CLIENT_ID);

async function test() {
  console.log("🚀 Starting RPC Verification Test...");
  await rpc.connect();

  const dummyTrack: TrackInfo = {
    title: "Test Song",
    artist: "Test Artist",
    album: "Test Album",
    isPlaying: true,
    position: 0,
    duration: 300,
    source: "Verification Script"
  };

  console.log("📡 Sending test activity to Discord...");
  await rpc.updatePresence(dummyTrack);

  console.log("✅ Activity sent. Check your Discord profile!");
  console.log("Note: Buttons may only be visible to others or in your 'Full Profile' view.");

  // Keep alive for 30 seconds
  console.log("Waiting 30s before exit...");
  setTimeout(() => {
    console.log("Done.");
    process.exit(0);
  }, 30000);
}

test().catch(console.error);
