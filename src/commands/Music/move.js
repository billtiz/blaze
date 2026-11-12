const { v2Message } = require('../../utils/v2');

module.exports = {
  name: 'move',
  category: 'Music',
  aliases: ['skipto', 'jump'],
  description: 'Move a track to a new position in the queue.',
  args: true,
  usage: '<track>',
  userPrams: [],
  cooldown: 5,
  botPrams: ['EmbedLinks'],
  owner: false,
  player: true,
  inVoiceChannel: true,
  sameVoiceChannel: true,
  execute: async (message, args, client, prefix) => {
    const player = client.manager.players.get(message.guild.id);

    if (!player || !player.queue.current) {
      return message.reply(v2Message({
        color: client.ankushcolor,
        description: 'No song is currently playing in this guild.',
        thumbnailUrl: message.author.displayAvatarURL({ dynamic: true }),
      }));
    }

    const position = Number(args[0]);
    if (!position || position > player.queue.length || position <= 0) {
      return message.reply(v2Message({
        color: client.ankushcolor,
        description: `Invalid position! Please provide a number between 1 and ${player.queue.length}.`,
        thumbnailUrl: message.author.displayAvatarURL({ dynamic: true }),
      }));
    }

    if (position === 1) {
      player.skip();
      return message.reply(v2Message({
        color: client.ankushcolor,
        description: 'Track has been moved to the first position and skipped.',
        thumbnailUrl: message.author.displayAvatarURL({ dynamic: true }),
      }));
    }

    const track = player.queue.splice(position - 1, 1)[0];
    player.queue.unshift(track);
    player.skip();

    return message.reply(v2Message({
      color: client.ankushcolor,
      description: `Moved track to position ${position} and skipped the current track.`,
      thumbnailUrl: message.author.displayAvatarURL({ dynamic: true }),
    }));
  },
};
