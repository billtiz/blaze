const { v2Message } = require("../../utils/v2");

module.exports = {
  name: 'skip',
  aliases: ['s', 'sk'],
  category: 'Music',
  description: 'Skip the currently playing song.',
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

    if (player.shoukaku.paused) {
      return message.reply(v2Message({
        color: client.ankushcolor,
        description: 'Resume the player first to skip the track!',
        thumbnailUrl: message.author.displayAvatarURL({ dynamic: true }),
      }));
    }

    const title = player.queue.current.title.length > 30
      ? player.queue.current.title.slice(0, 30) + '...'
      : player.queue.current.title;

    await player.skip();

    return message.reply(v2Message({
      color: client.ankushcolor,
      description: `⏭️ Skipped **${title}**`,
      thumbnailUrl: message.author.displayAvatarURL({ dynamic: true }),
    }));
  },
};