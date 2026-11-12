const Logger = require('./base/logger.js');
const Prefix = require('./models/prefix');

// Show startup banner
Logger.banner();

// Load prefix data into client.prefixes Map
async function loadPrefixes(client) {
  const prefixes = await Prefix.find();
  client.prefixes = new Map();
  prefixes.forEach(prefixRecord => {
      client.prefixes.set(prefixRecord.id, prefixRecord.prefix);
  });
}
const { initializeDatabase } = require('./database');
const MusicBot = require("./structures/MusicClient");
const client = new MusicBot();

module.exports = client;

async function initializeBot() {
  if (!client.config.token) throw new Error('DISCORD_TOKEN is missing. Add it to your environment.');
  if (!client.config.mongourl) throw new Error('MONGO_URI is missing. Add your MongoDB connection string to your environment.');
  Logger.section("DATABASE");
  await initializeDatabase();
  Logger.success("Database connected");
  await loadPrefixes(client);
  Logger.success(`Loaded ${client.prefixes.size} prefix configs`);
  Logger.sectionEnd();

  Logger.section("MUSIC PLAYER");
  client._loadPlayer();
  Logger.success("Kazagumo player initialized");
  Logger.sectionEnd();

  Logger.section("EVENTS");
  client._loadClientEvents();
  client._loadNodeEvents();
  client._loadPlayerEvents();
  Logger.sectionEnd();

  Logger.section("COMMANDS");
  client._loadCommands();
  client._loadSlashCommands();
  Logger.sectionEnd();

  Logger.section("CONNECTING");
  Logger.info("Logging in to Discord...");
  Logger.sectionEnd();
  client.connect();
}

initializeBot();

process.on('unhandledRejection', (reason, p) => {
  Logger.log(`Unhandled Rejection: ${reason}`, "error");
});

process.on('uncaughtException', (err, origin) => {
  Logger.log(`Uncaught Exception: ${err.message}`, "error");
});
