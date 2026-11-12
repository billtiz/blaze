const { v2Message } = require('../../utils/v2');

module.exports = {
  name: 'clearfilters',
  category: 'Filters',
  aliases: ['clear', 'clearfilter'],
  cooldown: 5,
  description: 'Reset all active audio filters',
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

    if (!player.queue || !player.queue.current) {
      return message.reply(v2Message({
        color: client.ankushcolor,
        description: '❌ | No song is currently playing.',
        thumbnailUrl: message.author.displayAvatarURL({ dynamic: true }),
      }));
    }

    try {
      player.clearfilter();
      return message.reply(v2Message({
        color: client.ankushcolor,
        description: '🔄 | All audio filters have been reset',
        fields: [
          { name: 'Now Playing', value: player.queue.current.title || 'Unknown' },
          { name: 'Filter Status', value: '⚪ All Disabled' }
        ],
        footer: 'Audio has been restored to original quality',
      }));
    } catch (error) {
      console.error('Clear filters error:', error);
      return message.reply(v2Message({
        color: '#ff0000',
        description: '❌ | An error occurred while clearing the audio filters.',
      }));
    }
  }
};