const { v2Message } = require('../../utils/v2');

module.exports = {
  name: 'bass',
  category: 'Filters',
  cooldown: 5,
  description: 'Toggle bass boost effect for the current track',
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
      const isBassEnabled = player.bass;
      player.setBass(!isBassEnabled);

      return message.reply(v2Message({
        color: client.ankushcolor,
        description: `🔊 | Bass boost has been ${!isBassEnabled ? 'enabled' : 'disabled'}`,
        fields: [
          { name: 'Now Playing', value: `${player.queue.current.title || 'Unknown'}` },
          { name: 'Bass Status', value: `${!isBassEnabled ? '🟢 Enhanced' : '⚪ Normal'}` }
        ],
        footer: `Use ${prefix}bass to toggle the effect`,
      }));
    } catch (error) {
      console.error('Bass filter error:', error);
      return message.reply(v2Message({
        color: '#ff0000',
        description: '❌ | An error occurred while toggling the bass boost.',
      }));
    }
  }
};