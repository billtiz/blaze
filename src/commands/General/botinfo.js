const { v2Message } = require('../../utils/v2');

module.exports = {
  name: 'botinfo',
  category: 'General',
  aliases: ['about', 'bi'],
  description: 'Shows BlaZe bot information and runtime statistics.',
  args: false,
  usage: '',
  cooldown: 5,
  userPrams: [],
  botPrams: ['EmbedLinks'],
  owner: false,
  execute: async (message, args, client) => {
    const memory = process.memoryUsage();
    const uptime = Math.floor(process.uptime());
    const days = Math.floor(uptime / 86400);
    const hours = Math.floor((uptime % 86400) / 3600);
    const minutes = Math.floor((uptime % 3600) / 60);
    return message.reply(v2Message({
      color: client.brandColor || client.ankushcolor || '#FF9F0A',
      title: 'BlaZe™ | Bot Information',
      description: 'An all-in-one Discord music experience.',
      thumbnailUrl: client.user.displayAvatarURL({ size: 256 }),
      fields: [
        { name: 'Servers', value: `${client.guilds.cache.size}`, inline: true },
        { name: 'Users (cached)', value: `${client.users.cache.size}`, inline: true },
        { name: 'Ping', value: `${client.ws.ping} ms`, inline: true },
        { name: 'Uptime', value: `${days}d ${hours}h ${minutes}m`, inline: true },
        { name: 'Memory', value: `${Math.round(memory.rss / 1024 / 1024)} MB RSS`, inline: true },
        { name: 'Node.js', value: process.version, inline: true },
      ],
    }));
  },
};
