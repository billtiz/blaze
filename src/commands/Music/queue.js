const { convertTime } = require('../../utils/convert.js');
const { v2Message } = require('../../utils/v2');

module.exports = {
  name: 'queue',
  category: 'Music',
  aliases: ['q'],
  description: 'Show the music queue and now playing.',
  args: false,
  usage: '',
  userPrams: [],
  cooldown: 5,
  botPrams: ['EmbedLinks'],
  owner: false,
  player: true,
  inVoiceChannel: false,
  sameVoiceChannel: false,
  execute: async (message, args, client, prefix) => {
    const player = client.manager.players.get(message.guild.id);

    if (!player || !player.queue.current) {
      return message.reply(v2Message({
        color: client.ankushcolor,
        description: 'There is no music currently playing. Use the play command to add songs to the queue.',
        thumbnailUrl: message.author.displayAvatarURL({ dynamic: true }),
      }));
    }

    const totalSongsPerPage = 5;
    const totalPages = Math.ceil(player.queue.length / totalSongsPerPage);
    let page = 1;

    if (args[0]) {
      const pageArg = parseInt(args[0], 10);
      if (isNaN(pageArg) || pageArg < 1 || pageArg > totalPages) {
        return message.channel.send(v2Message({
          color: client.ankushcolor,
          description: `Invalid page number. Please provide a number between 1 and ${totalPages}.`,
          thumbnailUrl: message.author.displayAvatarURL({ dynamic: true }),
        }));
      }
      page = pageArg;
    }

    const start = (page - 1) * totalSongsPerPage;
    const end = page * totalSongsPerPage;
    const tracks = player.queue.slice(start, end);

    let desc = `Now Playing: **${player.queue.current.title}**\n\n`;
    tracks.forEach((track, index) => {
      desc += `**${start + index + 1}. ${track.title}**\n`;
      desc += `Artist: ${track.author}\n`;
      desc += `Duration: ${track.isStream ? '◉ LIVE' : convertTime(track.length)}\n`;
      desc += `Requested by: ${track.requester.username}\n\n`;
    });

    return message.reply(v2Message({
      color: client.ankushcolor,
      title: 'Music Queue',
      description: desc,
      footer: `Page ${page} of ${totalPages}`,
    }));
  },
};
