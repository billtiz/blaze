const { UserPlaylist, PlaylistSong } = require('../../models/playlistDB');
const { v2Message } = require('../../utils/v2');

module.exports = {
  name: 'pl-add',
  aliases: ['pladd', 'add'],
  category: 'Playlist',
  description: 'Add a song to a playlist',
  args: true,
  usage: '<playlist name> <song url>',
  userPrams: [],
  botPrams: ['EmbedLinks'],
  owner: false,
  player: true,
  inVoiceChannel: true,
  sameVoiceChannel: true,
  execute: async (message, args, client, prefix) => {
    if (!args[0]) {
      return message.reply(v2Message({ color: client.ankushcolor, description: `<:x_cross:1250674944057278535> Please specify a playlist name!`, thumbnailUrl: message.author.displayAvatarURL({ dynamic: true }) }));
    }

    if (!args[1]) {
      return message.reply(v2Message({ color: client.ankushcolor, description: `<:x_cross:1250674944057278535> Please specify a song URL!`, thumbnailUrl: message.author.displayAvatarURL({ dynamic: true }) }));
    }

    const playlistName = args[0];
    const trackURL = args[1];

    try {
      const playlist = await UserPlaylist.findOne({ userId: message.author.id, playlistName });
      if (!playlist) {
        return message.reply(v2Message({ color: client.ankushcolor, description: `<:x_cross:1250674944057278535> You don't have a playlist named **${playlistName}**!`, thumbnailUrl: message.author.displayAvatarURL({ dynamic: true }) }));
      }

      const player = client.manager.players.get(message.guild.id);
      let res;

      try {
        res = await player.search(trackURL, message.author);
        if (res.loadType === 'LOAD_FAILED') {
          return message.reply(v2Message({ color: client.ankushcolor, description: `<:x_cross:1250674944057278535> Failed to load the track!`, thumbnailUrl: message.author.displayAvatarURL({ dynamic: true }) }));
        }
      } catch (err) {
        return message.reply(v2Message({ color: client.ankushcolor, description: `<:x_cross:1250674944057278535> Failed to load the track!`, thumbnailUrl: message.author.displayAvatarURL({ dynamic: true }) }));
      }

      const tracks = res.tracks;
      if (!tracks.length) {
        return message.reply(v2Message({ color: client.ankushcolor, description: `<:x_cross:1250674944057278535> No tracks found for the URL!`, thumbnailUrl: message.author.displayAvatarURL({ dynamic: true }) }));
      }

      const track = tracks[0];

      const existingTrack = await PlaylistSong.findOne({ playlistId: playlist._id, trackURL: track.uri });
      if (existingTrack) {
        return message.reply(v2Message({ color: client.ankushcolor, description: `<:x_cross:1250674944057278535> This track is already in your playlist!`, thumbnailUrl: message.author.displayAvatarURL({ dynamic: true }) }));
      }

      await PlaylistSong.create({ playlistId: playlist._id, trackURL: track.uri, trackTitle: track.title, trackDuration: track.duration, addedBy: message.author.id });

      return message.reply(v2Message({ color: client.ankushcolor, description: `<:x_tick:1250674883080224768> Successfully added [${track.title}](${track.uri}) to your playlist **${playlistName}**!`, thumbnailUrl: message.author.displayAvatarURL({ dynamic: true }) }));
    } catch (error) {
      console.error('Error adding track to playlist:', error);
      return message.reply(v2Message({ color: client.ankushcolor, description: `<:x_cross:1250674944057278535> An error occurred while adding the track to your playlist!`, thumbnailUrl: message.author.displayAvatarURL({ dynamic: true }) }));
    }
  },
};