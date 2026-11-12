const { v2Message } = require('../../utils/v2');

module.exports = {
  name: '8d',
  category: 'Filters',
  cooldown: 5,
  description: 'Toggle 8D audio effect for the current track',
  args: false,
  usage: '',
  userPrams: [],
  botPrams: ['EmbedLinks'],
  owner: false,
  player: true,
  inVoiceChannel: true,
  sameVoiceChannel: true,
  execute: async (message, args, client, prefix) => {
    const player = client.manager.players.get(message.guild.id);

    if (!player) {
      return message.reply(v2Message({
        color: client.ankushcolor,
        description: '❌ | No song is currently playing in this server.',
        thumbnailUrl: message.author.displayAvatarURL({ dynamic: true }),
      }));
    }

    try {
      const is8DEnabled = player._8d;
      player.set8D(!is8DEnabled);

      return message.reply(v2Message({
        color: client.ankushcolor,
        description: `🎧 | 8D Audio has been ${!is8DEnabled ? 'enabled' : 'disabled'}`,
        fields: [
          { name: 'Current Track', value: `${player.queue.current.title || 'Unknown'}` },
          { name: 'Filter Status', value: `${!is8DEnabled ? '🟢 Active' : '🔴 Inactive'}` }
        ],
        footer: `Requested by ${message.author.tag}`,
      }));
    } catch (error) {
      console.error('8D filter error:', error);
      return message.reply(v2Message({
        color: '#ff0000',
        description: '❌ | An error occurred while toggling the 8D filter.',
      }));
    }
  }
};