const { UserPlaylist, PlaylistSong } = require('../../models/playlistDB');
const { v2Message } = require('../../utils/v2');

module.exports = {
  name: 'pl-remove',
  aliases: ['plrm', 'remove'],
  category: 'Playlist',
  description: 'Remove a song from a playlist',
  args: true,
  usage: '<playlist name> <song index or URL>',
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

    if (!args[1]) {
      return message.reply(v2Message({ color: client.ankushcolor, description: `<:x_cross:1250674944057278535> Please specify a song index or URL to remove!`, thumbnailUrl: message.author.displayAvatarURL({ dynamic: true }) }));
    }

    const playlistName = args[0];
    const songIdentifier = args[1];

    try {
      const playlist = await UserPlaylist.findOne({ userId: message.author.id, playlistName });
      if (!playlist) {
        return message.reply(v2Message({ color: client.ankushcolor, description: `<:x_cross:1250674944057278535> You don't have a playlist named **${playlistName}**!`, thumbnailUrl: message.author.displayAvatarURL({ dynamic: true }) }));
      }

      const songs = await PlaylistSong.find({ playlistId: playlist._id }).sort({ _id: 1 });
      if (songs.length === 0) {
        return message.reply(v2Message({ color: client.ankushcolor, description: `<:x_cross:1250674944057278535> Your playlist **${playlistName}** is empty!`, thumbnailUrl: message.author.displayAvatarURL({ dynamic: true }) }));
      }

      let songToRemove;

      // Check if it's an index
      const index = parseInt(songIdentifier, 10);
      if (!isNaN(index) && index >= 1 && index <= songs.length) {
        songToRemove = songs[index - 1];
      } else {
        // Try to find by URL
        songToRemove = songs.find(s => s.trackURL === songIdentifier);
      }

      if (!songToRemove) {
        return message.reply(v2Message({ color: client.ankushcolor, description: `<:x_cross:1250674944057278535> Could not find a song matching **${songIdentifier}** in your playlist!`, thumbnailUrl: message.author.displayAvatarURL({ dynamic: true }) }));
      }

      await PlaylistSong.deleteOne({ _id: songToRemove._id });

      return message.reply(v2Message({ color: client.ankushcolor, description: `<:x_tick:1250674883080224768> Successfully removed **${songToRemove.trackTitle}** from your playlist **${playlistName}**!`, thumbnailUrl: message.author.displayAvatarURL({ dynamic: true }) }));
    } catch (error) {
      console.error('Error removing track from playlist:', error);
      return message.reply(v2Message({ color: client.ankushcolor, description: `<:x_cross:1250674944057278535> An error occurred while removing the track from your playlist!`, thumbnailUrl: message.author.displayAvatarURL({ dynamic: true }) }));
    }
  },
};