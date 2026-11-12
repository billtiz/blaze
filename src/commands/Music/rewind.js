const { convertTime } = require("../../utils/convert");
const ms = require('ms');
const { v2Message } = require('../../utils/v2');

module.exports = {
  name: 'rewind',
  aliases: ['rd', 'rw'],
  category: 'Music',
  description: 'Rewind the player to the provided timestamp.',
  args: false,
  usage: '<time>',
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
        description: 'No song/s currently playing within this guild.',
        thumbnailUrl: message.author.displayAvatarURL({ dynamic: true }),
      }));
    }

    if (!player.queue.current.isSeekable) {
      return message.reply(v2Message({
        color: '#ff0000',
        title: '⚠️ Cannot Rewind',
        description: 'This track does not support rewinding.',
        footer: 'Try with a different song',
      }));
    }

    const song = player.queue.current;
    let position = 10000;

    if (args.length > 0) {
      const timeArg = args.join(" ");
      try {
        const parsedTime = ms(timeArg);
        if (parsedTime) {
          position = parsedTime;
        } else {
          return message.reply(v2Message({
            color: '#ff0000',
            title: '⚠️ Invalid Time Format',
            description: 'Please provide a valid time format (e.g., 10s, 1m, 2m30s)',
          }));
        }
      } catch (error) {
        return message.reply(v2Message({
          color: '#ff0000',
          title: '⚠️ Invalid Time Format',
          description: 'Please provide a valid time format (e.g., 10s, 1m, 2m30s)',
        }));
      }
    }

    let seekPosition = player.shoukaku.position - position;

    if (seekPosition <= 0) {
      return message.reply(v2Message({
        color: '#ff0000',
        title: '⚠️ Invalid Rewind Time',
        description: 'Cannot rewind beyond the start of the track!',
        fields: [
          { name: 'Current Position', value: `${convertTime(player.shoukaku.position)}` },
          { name: 'Requested Rewind', value: `${convertTime(position)}` }
        ],
      }));
    }

    player.shoukaku.seekTo(seekPosition);

    return message.reply(v2Message({
      color: '#00ff00',
      title: '⏪ Rewound Track',
      description: `Successfully rewound **${song.title}**`,
      fields: [
        { name: 'Rewound by', value: `${convertTime(position)}` },
        { name: 'New Position', value: `${convertTime(seekPosition)}` }
      ],
      footer: `Requested by ${message.author.tag}`,
    }));
  }
};