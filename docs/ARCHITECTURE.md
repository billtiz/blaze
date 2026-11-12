# BlaZe architecture

## Startup flow

1. `index.js` reads the configuration and starts the Discord hybrid-sharding cluster manager.
2. `src/blaze.js` validates required settings, connects to MongoDB and loads stored prefixes.
3. `src/structures/MusicClient.js` creates the Discord client, configures Kazagumo/Shoukaku and loads command and event modules.
4. `src/events/` contains Discord client, Lavalink node and player lifecycle handlers.
5. `src/commands/` and `src/slashCommands/` contain user-facing command modules.

## Main boundaries

- **Commands:** validate user input and call client/player services.
- **Events:** respond to Discord, Lavalink and player lifecycle events.
- **Models and schemas:** persist server settings, playlists, user data and operational state.
- **Utilities:** shared formatting, component payloads, playback helpers and vote checks.
- **Services:** reusable application services and typed helper functions.

## Configuration

Runtime configuration is loaded from environment variables by `src/config.js`. `.env.example` documents supported keys. Secrets must be supplied through the deployment environment and must never be committed.

## External services

BlaZe requires a Discord application, MongoDB and a reachable Lavalink v4 server. Spotify and Top.gg integrations are optional and require their own credentials.
