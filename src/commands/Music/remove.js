const { v2Message } = require('../../utils/v2');

module.exports = {
  name: 'remove',
  category: 'Music',
  aliases: ['rm'],
  description: 'Remove a song from the queue.',
  args: false,
  usage: '<Number of song in queue>',
  userPrams: [],
  cooldown: 3,
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
        description: 'No song/s currently playing within this guild.',
        thumbnailUrl: message.author.displayAvatarURL({ dynamic: true }),
      }));
    }

    if (!args[0] || isNaN(args[0])) {
      return message.reply(v2Message({
        color: client.ankushcolor,
        description: `Invalid input! Please provide the number of the song to remove from the queue. Usage: \`${prefix}remove <queue number>\`.`,
        thumbnailUrl: message.author.displayAvatarURL({ dynamic: true }),
      }));
    }

    const position = Number(args[0]) - 1;

    if (position < 0 || position >= player.queue.length) {
      return message.reply(v2Message({
        color: client.ankushcolor,
        description: `Invalid position! Please provide a number between 1 and ${player.queue.length}.`,
        thumbnailUrl: message.author.displayAvatarURL({ dynamic: true }),
      }));
    }

    const song = player.queue[position];
    player.queue.splice(position, 1);

    return message.reply(v2Message({
      color: client.ankushcolor,
      description: `Removed **${song.title.length > 50 ? `${song.title.slice(0, 50)}...` : song.title}** from the queue.`,
      thumbnailUrl: message.author.displayAvatarURL({ dynamic: true }),
    }));
  },
};
