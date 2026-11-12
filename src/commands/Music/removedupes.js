const { v2Message } = require('../../utils/v2');

module.exports = {
  name: 'removedupes',
  category: 'Music',
  description: 'Remove duplicate songs from the queue.',
  aliases: ['removedp', 'removeduplicate', 'remdupe'],
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

    const tracks = player.queue;
    const uniqueTracks = [];

    for (const track of tracks) {
      if (!uniqueTracks.some((t) => t.uri === track.uri)) {
        uniqueTracks.push(track);
      }
    }

    const removedCount = tracks.length - uniqueTracks.length;

    player.queue.clear();
    for (const track of uniqueTracks) {
      player.queue.add(track);
    }

    return message.reply(v2Message({
      color: client.ankushcolor,
      description: removedCount > 0
        ? `Removed **${removedCount}** duplicate song(s) from the queue.`
        : 'No duplicate songs found in the queue.',
      thumbnailUrl: message.author.displayAvatarURL({ dynamic: true }),
    }));
  },
};
