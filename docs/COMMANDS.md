# Command index

Prefix commands are grouped by feature under `src/commands/`. The default prefix is `!!` and can be changed with `BOT_PREFIX` or the server prefix command.

| Category | Purpose |
|---|---|
| `General` | Help, invite, ping, profile, server information, statistics, support and uptime |
| `Music` | Playback, search, queue, transport controls, volume and autoplay |
| `Filters` | Audio effects and filter presets |
| `Playlist` | Create, save, load and manage playlists |
| `Favourite` | Save and replay liked tracks |
| `Settings` | Prefix, ignored channels, avatar and banner settings |
| `Dev` / `Owner` | Restricted maintenance and owner operations |

Slash command modules are located in `src/slashCommands/`. The authoritative command names, aliases, permissions and cooldowns are defined in each command module. Use the in-bot help command for the live command list.
