import type { MusicProvider, TrackInfo } from "../types";
import { MacOSProvider } from "./macos";
import { LinuxProvider } from "./linux";
import { WindowsProvider } from "./windows";

export class ProviderFactory {
  static getProvider(): MusicProvider {
    const platform = process.platform;

    switch (platform) {
      case "darwin":
        return new MacOSProvider();
      case "linux":
        return new LinuxProvider();
      case "win32":
        return new WindowsProvider();
      default:
        throw new Error(`Platform ${platform} is not supported.`);
    }
  }
}
