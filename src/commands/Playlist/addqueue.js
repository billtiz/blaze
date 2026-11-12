const { UserPlaylist, PlaylistSong } = require('../../models/playlistDB');
const { v2Message } = require('../../utils/v2');

module.exports = {
  name: 'pl-addqueue',
  aliases: ['pladdq', 'plq', 'addqueue'],
  category: 'Playlist',
  description: 'Add the entire queue to a playlist',
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
      if (!player || player.queue.length === 0) {
        return message.reply(v2Message({ color: client.ankushcolor, description: `<:x_cross:1250674944057278535> There are no tracks in the queue!`, thumbnailUrl: message.author.displayAvatarURL({ dynamic: true }) }));
      }

      const allTracks = player.queue.current ? [player.queue.current, ...player.queue] : [...player.queue];
      let addedCount = 0;
      let duplicateCount = 0;

      for (const track of allTracks) {
        const existingTrack = await PlaylistSong.findOne({ playlistId: playlist._id, trackURL: track.uri });
        if (!existingTrack) {
          await PlaylistSong.create({ playlistId: playlist._id, trackURL: track.uri, trackTitle: track.title, trackDuration: track.duration, addedBy: message.author.id });
          addedCount++;
        } else {
          duplicateCount++;
        }
      }

      return message.reply(v2Message({ color: client.ankushcolor, description: `<:x_tick:1250674883080224768> Successfully added **${addedCount}** tracks to your playlist **${playlistName}**!${duplicateCount > 0 ? `\n**${duplicateCount}** duplicate tracks were skipped.` : ''}`, thumbnailUrl: message.author.displayAvatarURL({ dynamic: true }) }));
    } catch (error) {
      console.error('Error adding queue to playlist:', error);
      return message.reply(v2Message({ color: client.ankushcolor, description: `<:x_cross:1250674944057278535> An error occurred while adding the queue to your playlist!`, thumbnailUrl: message.author.displayAvatarURL({ dynamic: true }) }));
    }
  },
};