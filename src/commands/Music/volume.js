const { v2Message } = require("../../utils/v2");

module.exports = {
  name: 'volume',
  aliases: ['vol', 'v'],
  category: 'Music',
  description: 'Adjusts the volume of the player.',
  args: false,
  usage: '<1-100>',
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

    if (!args[0]) {
      return message.reply(v2Message({
        color: client.ankushcolor,
        description: `The current volume is **${player.volume}%**.`,
        thumbnailUrl: message.author.displayAvatarURL({ dynamic: true }),
      }));
    }

    const volume = Number(args[0]);

    if (isNaN(volume) || volume < 1 || volume > 100) {
      return message.reply(v2Message({
        color: client.ankushcolor,
        description: 'Please provide a number between 1 and 100.',
        thumbnailUrl: message.author.displayAvatarURL({ dynamic: true }),
      }));
    }

    await player.setVolume(volume);

    return message.reply(v2Message({
      color: client.ankushcolor,
      description: `Volume set to **${volume}%**.`,
      thumbnailUrl: message.author.displayAvatarURL({ dynamic: true }),
    }));
  },
};