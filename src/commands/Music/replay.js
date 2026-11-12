const { v2Message } = require('../../utils/v2');

module.exports = {
  name: 'replay',
  aliases: ['rplay'],
  category: 'Music',
  description: 'Replays the current song from the beginning.',
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
      player.queue.current.title.length > 30
        ? `${player.queue.current.title.slice(0, 30)}...`
        : player.queue.current.title;

    if (!player.queue.current.isSeekable) {
      return message.reply(v2Message({
        color: client.ankushcolor,
        description: 'The current song cannot be replayed because it is not seekable.',
        thumbnailUrl: message.author.displayAvatarURL({ dynamic: true }),
      }));
    }

    player.shoukaku.seekTo(0);

    return message.reply(v2Message({
      color: client.ankushcolor,
      description: `Replaying **${songTitle}** from the beginning.`,
      thumbnailUrl: message.author.displayAvatarURL({ dynamic: true }),
    }));
  },
};
