const { UserPlaylist, PlaylistSong } = require('../../models/playlistDB');
const { v2Message } = require('../../utils/v2');

module.exports = {
  name: 'pl-addnowplaying',
  aliases: ['pladdnp', 'plnp', 'addnowplaying'],
  category: 'Playlist',
  description: 'Add the currently playing song to a playlist',
  args: true,
  usage: '<playlist name>',
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

    const playlistName = args[0];

    try {
      const playlist = await UserPlaylist.findOne({ userId: message.author.id, playlistName });
      if (!playlist) {
        return message.reply(v2Message({ color: client.ankushcolor, description: `<:x_cross:1250674944057278535> You don't have a playlist named **${playlistName}**!`, thumbnailUrl: message.author.displayAvatarURL({ dynamic: true }) }));
      }

      const player = client.manager.players.get(message.guild.id);
      if (!player || !player.queue.current) {
        return message.reply(v2Message({ color: client.ankushcolor, description: `<:x_cross:1250674944057278535> There is no track currently playing!`, thumbnailUrl: message.author.displayAvatarURL({ dynamic: true }) }));
      }

      const track = player.queue.current;
      const existingTrack = await PlaylistSong.findOne({ playlistId: playlist._id, trackURL: track.uri });
      if (existingTrack) {
        return message.reply(v2Message({ color: client.ankushcolor, description: `<:x_cross:1250674944057278535> This track is already in your playlist!`, thumbnailUrl: message.author.displayAvatarURL({ dynamic: true }) }));
      }

      await PlaylistSong.create({ playlistId: playlist._id, trackURL: track.uri, trackTitle: track.title, trackDuration: track.duration, addedBy: message.author.id });

      return message.reply(v2Message({ color: client.ankushcolor, description: `<:x_tick:1250674883080224768> Successfully added [${track.title}](${track.uri}) to your playlist **${playlistName}**!`, thumbnailUrl: message.author.displayAvatarURL({ dynamic: true }) }));
    } catch (error) {
      console.error('Error adding now playing track to playlist:', error);
      return message.reply(v2Message({ color: client.ankushcolor, description: `<:x_cross:1250674944057278535> An error occurred while adding the track to your playlist!`, thumbnailUrl: message.author.displayAvatarURL({ dynamic: true }) }));
    }
  },
};