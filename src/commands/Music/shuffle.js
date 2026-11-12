const { v2Message } = require("../../utils/v2");

module.exports = {
  name: 'shuffle',
  aliases: ['sh'],
  category: 'Music',
  description: 'Shuffles The queue!',
  args: false,
  usage: '',
  userPrams: [],
  cooldown: 5,
  botPrams: ['EmbedLinks'],
  owner: false,
  player: true,
  inVoiceChannel: true,
  sameVoiceChannel: true,
  execute: async (message, args, client, prefix) => {
    const player = client.manager.players.get(message.guild.id);

    if (!player.queue.current) {
      return message.reply(v2Message({
        color: client.ankushcolor,
        description: 'No song is currently playing in this guild.',
        thumbnailUrl: message.author.displayAvatarURL({ dynamic: true }),
      }));
    }

    if (player.queue.length < 3) {
      return message.reply(v2Message({
        color: client.ankushcolor,
        description: 'There must be at least 3 songs in the queue to shuffle.',
      }));
    }

    player.queue.shuffle();

    return message.reply(v2Message({
      color: client.ankushcolor,
      description: 'The queue has been shuffled!',
    }));
  },
};
