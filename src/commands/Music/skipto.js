const { v2Message } = require("../../utils/v2");

module.exports = {
  name: 'skipto',
  aliases: ['st', 'jumpto'],
  category: 'Music',
  description: 'Skip to a specific song in the queue.',
  args: true,
  usage: '<position>',
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
        description: 'No song/s currently playing within this guild.',
        thumbnailUrl: message.author.displayAvatarURL({ dynamic: true }),
      }));
    }

    const position = Number(args[0]);

    if (!position || position < 1 || position > player.queue.length) {
      return message.reply(v2Message({
        color: client.ankushcolor,
        description: `Invalid position! Please provide a number between 1 and ${player.queue.length}.`,
        thumbnailUrl: message.author.displayAvatarURL({ dynamic: true }),
      }));
    }

    // Remove songs before the target position
    player.queue.splice(0, position - 1);
    await player.skip();

    return message.reply(v2Message({
      color: client.ankushcolor,
      description: `⏭️ Skipped to position **${position}** in the queue.`,
      thumbnailUrl: message.author.displayAvatarURL({ dynamic: true }),
    }));
  },
};