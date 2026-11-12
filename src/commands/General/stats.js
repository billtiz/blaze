const os = require('os');
const process = require('process');
const { hasVotePermission } = require('../../utils/voteCheck');
const { v2Message } = require('../../utils/v2');

module.exports = {
  name: 'stats',
  category: 'General',
  aliases: ['st', 'status', 'botinfo'],
  cooldown: 5,
  description: 'Displays comprehensive bot statistics including system resources, performance metrics, and version information.',
  args: false,
  usage: '',
  userPerms: [],
  botPerms: ['EmbedLinks'],
  owner: false,
  execute: async (message, args, client, prefix) => {
    try {
      const hasVoted = await hasVotePermission(message.author.id, client);
      if (!hasVoted) {
        return message.reply("This command requires you to vote for the bot! Use the `vote` command to learn more.");
      }
      
      const totalMembers = client.guilds.cache.reduce((acc, guild) => acc + (guild.memberCount || 0), 0);
      const uptimeTimestamp = Math.floor((Date.now() - client.uptime) / 1000);
      const serverCount = client.guilds.cache.size;
      const usedMemory = (process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2);
      const totalMemory = (os.totalmem() / 1024 / 1024 / 1024).toFixed(2);
      const memoryPercentage = ((process.memoryUsage().heapUsed / os.totalmem()) * 100).toFixed(1);
      const cpus = os.cpus();
      const cpuModel = cpus && cpus.length > 0 ? cpus[0].model.trim() : 'Unknown CPU';
      const cpuCores = cpus ? cpus.length : 0;
      
      let discordJSVersion = 'Unknown';
      try { discordJSVersion = require("discord.js").version; } catch (e) {}
      
      const botStatsText = [
        `<a:red_dot:1330454614067380275> Users: \`${totalMembers.toLocaleString()}\``,
        `<a:red_dot:1330454614067380275> Servers: \`${serverCount.toLocaleString()}\``,
        `<a:red_dot:1330454614067380275> Commands: \`${client.commands.size}\``,
        `<a:red_dot:1330454614067380275> Uptime: <t:${uptimeTimestamp}:R>`
      ].join('\n');

      const sysInfoText = [
        `<a:red_dot:1330454614067380275> CPU: \`${cpuModel}\``,
        `<a:red_dot:1330454614067380275> CPU Cores: \`${cpuCores}\``,
        `<a:red_dot:1330454614067380275> Memory: \`${usedMemory}MB / ${totalMemory}GB (${memoryPercentage}%)\``,
        `<a:red_dot:1330454614067380275> Platform: \`${os.platform()} ${os.arch()}\``
      ].join('\n');

      const techText = [
        `<a:red_dot:1330454614067380275> API Latency: \`${client.ws.ping}ms\``,
        `<a:red_dot:1330454614067380275> Node.js: \`${process.version}\``,
        `<a:red_dot:1330454614067380275> Discord.js: \`v${discordJSVersion}\``
      ].join('\n');

      await message.reply(v2Message({
        color: client.config?.embedColor || '#ff0000',
        title: `${client.user.username} Statistics`,
        description: `[**Support Server**](https://discord.com)`,
        fields: [
          { name: '__Bot Statistics__', value: botStatsText },
          { name: '__System Information__', value: sysInfoText },
          { name: '__Technical Details__', value: techText },
        ],
        thumbnailUrl: client.user.displayAvatarURL({ dynamic: true, size: 256 }),
        footer: `Requested by ${message.author.tag}`,
      })).catch(err => {
        console.error('Error sending stats:', err);
        message.channel.send('Failed to display statistics.').catch(() => {});
      });
    } catch (error) {
      console.error('Error in stats command:', error);
      await message.reply('An error occurred while fetching bot statistics.').catch(() => {});
    }
  }
};