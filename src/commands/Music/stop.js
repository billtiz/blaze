const { v2Message } = require("../../utils/v2");

module.exports = {
  name: 'stop',
  category: 'Music',
  description: 'Stops the player and clears the queue.',
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

    // Cleanup autoplay data
    if (player.data.get("autoplay")) {
      player.data.delete("autoplay");
      player.data.delete("autoplaySystem");
      player.data.delete("playHistory");
      player.data.delete("artistCooldown");
      player.data.delete("requester");
    }

    player.queue.clear();
    await player.destroy().catch(() => null);

    return message.reply(v2Message({
      color: client.ankushcolor,
      description: '⏹️ Stopped the player and cleared the queue.',
      thumbnailUrl: message.author.displayAvatarURL({ dynamic: true }),
    }));
  },
};
