const { UserPlaylist, PlaylistSong } = require('../../models/playlistDB');
const { v2Message } = require('../../utils/v2');

module.exports = {
  name: 'pl-delete',
  aliases: ['pldelete', 'delete'],
  category: 'Playlist',
  description: 'Delete a playlist',
  args: true,
  usage: '<playlist name>',
  userPrams: [],
  botPrams: ['EmbedLinks'],
  owner: false,
  player: false,
  inVoiceChannel: false,
  sameVoiceChannel: false,
  execute: async (message, args, client, prefix) => {
    if (!args[0]) {
      return message.reply(v2Message({ color: client.ankushcolor, description: `<:x_cross:1250674944057278535> Please specify a playlist name!`, thumbnailUrl: message.author.displayAvatarURL({ dynamic: true }) }));
    }

    const playlistName = args[0];

    try {
      const playlist = await UserPlaylist.findOne({ userId: message.author.id, playlistName });
      if (!playlist) {
        return message.reply(v2Message({ color: client.ankushcolor, description: `<:x_cross:1250674944057278535> You don't have a playlist named **${playlistName}**!`, thumbnailUrl: message.author.displayAvatarURL({ dynamic: true }) }));
      }

      await PlaylistSong.deleteMany({ playlistId: playlist._id });
      await UserPlaylist.deleteOne({ _id: playlist._id });

      return message.reply(v2Message({ color: client.ankushcolor, description: `<:x_tick:1250674883080224768> Successfully deleted your playlist **${playlistName}**!`, thumbnailUrl: message.author.displayAvatarURL({ dynamic: true }) }));
    } catch (error) {
      console.error('Error deleting playlist:', error);
      return message.reply(v2Message({ color: client.ankushcolor, description: `<:x_cross:1250674944057278535> An error occurred while deleting your playlist!`, thumbnailUrl: message.author.displayAvatarURL({ dynamic: true }) }));
    }
  },
};