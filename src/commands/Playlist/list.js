const { UserPlaylist, PlaylistSong } = require('../../models/playlistDB');
const { v2Message } = require('../../utils/v2');

module.exports = {
  name: 'pl-list',
  aliases: ['pllist', 'list'],
  category: 'Playlist',
  description: 'List all playlists or songs in a playlist',
  args: false,
  usage: '[playlist name]',
  userPrams: [],
  botPrams: ['EmbedLinks'],
  owner: false,
  player: false,
  inVoiceChannel: false,
  sameVoiceChannel: false,
  execute: async (message, args, client, prefix) => {
    try {
      if (!args[0]) {
        const playlists = await UserPlaylist.find({ userId: message.author.id }).sort({ playlistName: 1 });

        if (playlists.length === 0) {
          return message.reply(v2Message({ color: client.ankushcolor, description: `<:x_cross:1250674944057278535> You don't have any playlists yet!`, thumbnailUrl: message.author.displayAvatarURL({ dynamic: true }) }));
        }

        const playlistItems = [];
        for (let i = 0; i < playlists.length; i++) {
          const songCount = await PlaylistSong.countDocuments({ playlistId: playlists[i]._id });
          playlistItems.push(`**${i + 1}.** ${playlists[i].playlistName} - ${songCount} song(s)`);
        }

        return message.reply(v2Message({
          color: client.ankushcolor,
          title: `${message.author.username}'s Playlists`,
          description: playlistItems.join('\n'),
          footer: `Total Playlists: ${playlists.length}`,
          thumbnailUrl: message.author.displayAvatarURL({ dynamic: true }),
        }));
      } else {
        const playlistName = args[0];
        const playlist = await UserPlaylist.findOne({ userId: message.author.id, playlistName });

        if (!playlist) {
          return message.reply(v2Message({ color: client.ankushcolor, description: `<:x_cross:1250674944057278535> You don't have a playlist named **${playlistName}**!`, thumbnailUrl: message.author.displayAvatarURL({ dynamic: true }) }));
        }

        const songs = await PlaylistSong.find({ playlistId: playlist._id }).sort({ _id: 1 });

        if (songs.length === 0) {
          return message.reply(v2Message({ color: client.ankushcolor, description: `<:x_cross:1250674944057278535> Your playlist **${playlistName}** is empty!`, thumbnailUrl: message.author.displayAvatarURL({ dynamic: true }) }));
        }

        const songList = songs.map((song, index) => {
          const minutes = Math.floor(song.trackDuration / 60000);
          const seconds = Math.floor((song.trackDuration % 60000) / 1000);
          const duration = `${minutes}:${seconds.toString().padStart(2, '0')}`;
          return `**${index + 1}.** [${song.trackTitle}](${song.trackURL}) - ${duration}`;
        }).join('\n');

        return message.reply(v2Message({
          color: client.ankushcolor,
          title: `${playlistName} Playlist`,
          description: songList,
          footer: `Total Songs: ${songs.length}`,
          thumbnailUrl: message.author.displayAvatarURL({ dynamic: true }),
        }));
      }
    } catch (error) {
      console.error('Error listing playlist:', error);
      return message.reply(v2Message({ color: client.ankushcolor, description: `<:x_cross:1250674944057278535> An error occurred while listing your playlists!`, thumbnailUrl: message.author.displayAvatarURL({ dynamic: true }) }));
    }
  },
};