// BlaZe configuration. Load secrets from environment variables; never hard-code them here.
require('dotenv').config();
module.exports = {
  token: process.env.DISCORD_TOKEN || '',
  clientId: process.env.DISCORD_CLIENT_ID || '',
  prefix: process.env.BOT_PREFIX || '!!',
  ownerID: (process.env.BOT_OWNER_IDS || '').split(',').map((id) => id.trim()).filter(Boolean),
  SpotifyID: process.env.SPOTIFY_CLIENT_ID || '',
  SpotifySecret: process.env.SPOTIFY_CLIENT_SECRET || '',
  ankushcolor: process.env.BOT_COLOR || '#FF9900', // legacy key used by existing commands
  embedColor: process.env.BOT_COLOR || '#FF9900',
  supportServer: process.env.SUPPORT_SERVER || '',
  dblToken: process.env.DBL_TOKEN || '',
  mongourl: process.env.MONGO_URI || '',
  webhooks: {
    cmdLog: process.env.CMD_LOG_WEBHOOK || '',
    autoBlacklistLog: process.env.AUTO_BLACKLIST_LOG_WEBHOOK || '',
    guildJoinLog: process.env.GUILD_JOIN_LOG_WEBHOOK || '',
    guildLeaveLog: process.env.GUILD_LEAVE_LOG_WEBHOOK || '',
    playerStartLog: process.env.PLAYER_START_LOG_WEBHOOK || '',
    playerDestroyLog: process.env.PLAYER_DESTROY_LOG_WEBHOOK || '',
  },
  nodes: [{
    url: process.env.LAVALINK_URL || 'localhost:2333',
    name: process.env.LAVALINK_NAME || 'BlaZe-Lavalink',
    auth: process.env.LAVALINK_PASSWORD || 'change-this-password',
    secure: (process.env.LAVALINK_SECURE || 'false').toLowerCase() === 'true',
  }],
};
