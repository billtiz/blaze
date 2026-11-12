# BlaZe — All-in-One Discord Bot

<p align="center">
  <img alt="Node.js" src="https://img.shields.io/badge/Node.js-20%2B-339933?logo=nodedotjs&logoColor=white">
  <img alt="Discord.js" src="https://img.shields.io/badge/Discord.js-v14-5865F2?logo=discord&logoColor=white">
  <img alt="Kazagumo" src="https://img.shields.io/badge/Kazagumo-Lavalink-7C3AED">
  <img alt="License" src="https://img.shields.io/badge/License-MIT-green.svg">
  <img alt="TensorFlow optional" src="https://img.shields.io/badge/TensorFlow-optional%20integration-FF6F00?logo=tensorflow&logoColor=white">
</p>

BlaZe is an all-in-one Discord music bot built with Discord.js v14 and the Kazagumo/Shoukaku audio stack. It includes music playback, queue controls, filters, favourites, playlists, settings, and utility commands.

## Features

- Music playback, track search, queue management, and audio filters
- Personal playlists and favourites
- Lavalink player events and reconnect handling
- Prefix and channel settings
- Hybrid sharding support
- Utility commands and slash-command handlers

## Technology

- **JavaScript:** primary language for the bot runtime, commands, and event handling
- **TypeScript:** type-checking and typed maintenance support
- **Python:** offline project diagnostics
- **TensorFlow:** optional integration badge only; TensorFlow is not currently a runtime dependency or an implemented bot feature

The bot runs on Node.js. The JavaScript/TypeScript/Python percentages are not enforced as a fixed 70/20/10 split in this codebase.

## Requirements

- Node.js 20 or newer
- MongoDB database
- A reachable Lavalink v4 node
- A Discord application and bot token

## Installation

1. Clone or download this repository.
2. Install dependencies:
   ```bash
   npm install
   ```
3. Copy `.env.example` to `.env` and add your own configuration values.
4. Start the bot:
   ```bash
   npm start
   ```
5. For development, run:
   ```bash
   npm run dev
   ```

Never commit `.env`, bot tokens, webhook URLs, Spotify secrets, or database credentials. If a credential was ever exposed, rotate it before deploying.

## Project checks

```bash
npm run check
npm run typecheck
npm run python:check
```

Run all checks together with `npm test`.

## Configuration

See `.env.example` for the environment variable names. Configure your Discord application, database, and Lavalink connection before starting the bot.

## License

This project is distributed under the MIT License. See [LICENSE](LICENSE) for the full license text.
