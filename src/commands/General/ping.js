const { v2Message } = require("../../utils/v2");

module.exports = {
  name: 'ping',
  category: 'General',
  aliases: ['latency'],
  cooldown: 5,
  description: 'Displays the bot latency and API response time',
  args: false,
  usage: '',
  userPrams: [],
  botPrams: ['EmbedLinks'],
  owner: false,
  execute: async (message, args, client, prefix) => {
    const apiPing = client.ws.ping;
    
    const sent = await message.reply(v2Message({ color: client.ankushcolor, description: '🏓 Calculating Ping...' }));
    const messageLatency = sent.createdTimestamp - message.createdTimestamp;
    
    await sent.edit(v2Message({
      color: '#00FF00',
      title: '🏓 Pong!',
      fields: [
        { name: 'Bot Latency', value: `${messageLatency}ms` },
        { name: 'API Latency', value: `${apiPing}ms` }
      ],
      footer: `Requested by ${message.author.tag}`,
    }));
  }
}