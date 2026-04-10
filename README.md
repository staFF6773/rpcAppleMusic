# Multi-Platform Music Discord Rich Presence

A modular, high-performance Discord Rich Presence (RPC) implementation built with the Bun runtime. This application synchronizes the playback status of music players across macOS, Windows, and Linux systems with Discord.

## Overview

This project provides a robust solution for displaying real-time music metadata on a Discord profile. Unlike standard implementations, it is designed for the Bun runtime and utilizes platform-specific APIs to ensure efficient resource usage and accurate track detection.

## Features

- **Cross-Platform Compatibility**: Native support for macOS (AppleScript), Windows (PowerShell/SMTC), and Linux (MPRIS via playerctl).
- **Web Player Support**: Specialized detection and metadata parsing for web-based players, specifically Apple Music on Chromium.
- **Dynamic Artwork**: Automatic cover art retrieval via the iTunes Search API with fallback mechanisms.
- **Playback Synchronization**: Displays track title, artist, album, and a native Discord progress bar when duration data is available.
- **State Awareness**: Distinguishes between playing and paused states, updating the RPC interface accordingly.
- **Optimized Performance**: Built with Bun for minimal overhead and responsive updates.

## Prerequisites

- **Bun Runtime**: Version 1.0.0 or higher.
- **Discord**: Desktop client must be running locally.
- **Linux Users**: `playerctl` must be installed for MPRIS support.

## Installation

Install the necessary dependencies using Bun:

```bash
bun install
```

## Usage

### Configuration

The application uses a default Discord Client ID. To use custom assets or a specific application name, modify the `CLIENT_ID` constant in `src/index.ts`.

### Execution

Start the application:

```bash
bun start
```

For development with hot-reloading:

```bash
bun dev
```

## Architecture

The project follows a modular provider-based architecture:

- **MusicProvider Interface**: Standardizes data retrieval across different operating systems.
- **ProviderFactory**: Handles runtime detection and instantiates the correct provider for the current environment.
- **RPCManager**: Manages the persistent IPC connection to Discord and handles activity updates.
- **Artwork Utility**: Provides a centralized logic for cleaning metadata and fetching external visual assets.

## License

This project is released under the MIT License.
