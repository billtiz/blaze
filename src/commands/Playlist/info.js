const { UserPlaylist, PlaylistSong } = require('../../models/playlistDB');
const { v2Message } = require('../../utils/v2');

module.exports = {
  name: 'pl-info',
  aliases: ['plinfo', 'info'],
  category: 'Playlist',
  description: 'Get information about a playlist',
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

      const songs = await PlaylistSong.find({ playlistId: playlist._id }).sort({ _id: 1 });

      const creationDate = new Date(playlist.createdOn * 1000).toLocaleDateString('en-US', {
        year: 'numeric', month: 'long', day: 'numeric'
      });

      let desc = `**Songs:** ${songs.length}\n**Created On:** ${creationDate}`;
      let fields = [];

      if (songs.length > 0) {
        const sampleSongs = songs.slice(0, 5).map((song, index) => {
          return `**${index + 1}.** [${song.trackTitle}](${song.trackURL})`;
        }).join('\n');
        fields.push({ name: 'Sample Songs', value: sampleSongs });
      }

      return message.reply(v2Message({
        color: client.ankushcolor,
        title: `${playlistName} Playlist Info`,
        description: desc,
        fields,
        footer: songs.length > 5 ? `And ${songs.length - 5} more songs. Use "${prefix}playlist-list ${playlistName}" to see all songs.` : undefined,
        thumbnailUrl: message.author.displayAvatarURL({ dynamic: true }),
      }));
    } catch (error) {
      console.error('Error getting playlist info:', error);
      return message.reply(v2Message({ color: client.ankushcolor, description: `<:x_cross:1250674944057278535> An error occurred while getting playlist info!`, thumbnailUrl: message.author.displayAvatarURL({ dynamic: true }) }));
    }
  },
};