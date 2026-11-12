const { v2Message } = require("../../utils/v2");

module.exports = {
  name: "pause",
  category: "Music",
  description: "Pause the currently playing music",
  args: false,
  usage: "",
  userPrams: [],
  cooldown: 5,
  botPrams: ["EmbedLinks"],
  owner: false,
  player: true,
  inVoiceChannel: true,
  sameVoiceChannel: true,
  execute: async (message, args, client, prefix) => {
    const player = client.manager.players.get(message.guild.id);

    if (!player || !player.queue.current) {
      return message.reply(v2Message({
        color: client.ankushcolor,
        description: "No song is currently playing in this guild.",
        thumbnailUrl: message.author.displayAvatarURL({ dynamic: true }),
      }));
    }

    if (player.shoukaku.paused) {
      return message.reply(v2Message({
        color: client.ankushcolor,
        description: "The player is already paused.",
        thumbnailUrl: message.author.displayAvatarURL({ dynamic: true }),
      }));
    }

    await player.pause(true);

    const song = player.queue.current;
    return message.reply(v2Message({
      color: client.ankushcolor,
      description: `The song **${song.title}** has been paused.`,
      thumbnailUrl: message.author.displayAvatarURL({ dynamic: true }),
    }));
  },
};
