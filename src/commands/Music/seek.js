const { v2Message } = require('../../utils/v2');

module.exports = {
  name: 'seek',
  category: 'Music',
  aliases: ['forwardto', 'jumpto'],
  description: 'Jump to a position in the currently playing track (seconds).',
  args: true,
  usage: '<seconds>',
  cooldown: 3,
  userPrams: [],
  botPrams: ['EmbedLinks'],
  owner: false,
  player: true,
  inVoiceChannel: true,
  sameVoiceChannel: true,
  execute: async (message, args, client) => {
    const player = client.manager.players.get(message.guild.id);
    const seconds = Number(args[0]);
    if (!player || !player.queue.current) {
      return message.reply(v2Message({ color: client.brandColor || '#FF9F0A', description: 'Nothing is currently playing.' }));
    }
    if (!Number.isFinite(seconds) || seconds < 0) {
      return message.reply(v2Message({ color: client.brandColor || '#FF9F0A', description: 'Provide a valid time in seconds, such as `!seek 90`.' }));
    }
    const duration = Number(player.queue.current.length || 0);
    const position = Math.floor(seconds * 1000);
    if (!player.queue.current.isStream && position >= duration) {
      return message.reply(v2Message({ color: client.brandColor || '#FF9F0A', description: 'The requested position must be before the end of the track.' }));
    }
    try {
      await player.seek(position);
      return message.reply(v2Message({ color: client.brandColor || '#FF9F0A', description: `Jumped to **${seconds} seconds**.` }));
    } catch (error) {
      console.error('[BlaZe seek]', error);
      return message.reply(v2Message({ color: client.brandColor || '#FF9F0A', description: 'Could not seek this track. Please try again.' }));
    }
  },
};
