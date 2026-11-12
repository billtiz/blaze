const { v2Message } = require('../../utils/v2');

module.exports = {
  name: 'uptime',
  category: 'General',
  description: 'Displays the bot\'s uptime.',
  args: false,
  cooldown: 5,
  usage: '',
  userPrams: [],
  botPrams: ['EmbedLinks'],
  owner: false,
  execute: async (message, args, client, prefix) => {
    const uptime = client.uptime;
    const days = Math.floor(uptime / (1000 * 60 * 60 * 24));
    const hours = Math.floor((uptime % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((uptime % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((uptime % (1000 * 60)) / 1000);
    const uptimeString = `${days}d ${hours}h ${minutes}m ${seconds}s`;

    message.reply(v2Message({
      color: '#00ff00',
      title: 'Bot Uptime',
      description: `The bot has been running for **${uptimeString}**.`,
    }));
  },
};
