const { v2Message } = require('../../utils/v2');

module.exports = {
  name: 'resume',
  aliases: ['r'],
  category: 'Music',
  description: 'Resume currently playing music',
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

    if (!player || !player.queue.current) {
      return message.reply(v2Message({
        color: client.ankushcolor,
        description: 'No song/s currently playing within this guild.',
        thumbnailUrl: message.author.displayAvatarURL({ dynamic: true }),
      }));
    }

    const songTitle =
      player.queue.current.title.length > 20
        ? `${player.queue.current.title.slice(0, 20)}...`
        : player.queue.current.title;

    if (!player.shoukaku.paused) {
      return message.reply(v2Message({
        color: client.ankushcolor,
        description: 'The music is already playing.',
        thumbnailUrl: message.author.displayAvatarURL({ dynamic: true }),
      }));
    }

    await player.pause(false);

    return message.reply(v2Message({
      color: client.ankushcolor,
      description: `Resumed playing **${songTitle}**.`,
      thumbnailUrl: message.author.displayAvatarURL({ dynamic: true }),
    }));
  },
};
