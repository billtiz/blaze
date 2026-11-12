const { UserPlaylist, PlaylistSong } = require('../../models/playlistDB');
const { v2Message } = require('../../utils/v2');

module.exports = {
  name: 'pl-dupes',
  aliases: ['pldupes', 'dupes'],
  category: 'Playlist',
  description: 'Find and remove duplicate tracks in a playlist',
  args: true,
  usage: '<playlist name> [remove]',
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
    const shouldRemove = args[1]?.toLowerCase() === 'remove';

    try {
      const playlist = await UserPlaylist.findOne({ userId: message.author.id, playlistName });
      if (!playlist) {
        return message.reply(v2Message({ color: client.ankushcolor, description: `<:x_cross:1250674944057278535> You don't have a playlist named **${playlistName}**!`, thumbnailUrl: message.author.displayAvatarURL({ dynamic: true }) }));
      }

      const songs = await PlaylistSong.find({ playlistId: playlist._id }).sort({ _id: 1 });
      if (songs.length === 0) {
        return message.reply(v2Message({ color: client.ankushcolor, description: `<:x_cross:1250674944057278535> Your playlist **${playlistName}** is empty!`, thumbnailUrl: message.author.displayAvatarURL({ dynamic: true }) }));
      }

      // Find duplicates
      const seen = new Map();
      const duplicates = [];

      for (const song of songs) {
        if (seen.has(song.trackURL)) {
          duplicates.push(song);
        } else {
          seen.set(song.trackURL, song);
        }
      }

      if (duplicates.length === 0) {
        return message.reply(v2Message({ color: client.ankushcolor, description: `<:x_tick:1250674883080224768> No duplicate tracks found in **${playlistName}**!`, thumbnailUrl: message.author.displayAvatarURL({ dynamic: true }) }));
      }

      if (shouldRemove) {
        const dupeIds = duplicates.map(d => d._id);
        await PlaylistSong.deleteMany({ _id: { $in: dupeIds } });
        return message.reply(v2Message({ color: client.ankushcolor, description: `<:x_tick:1250674883080224768> Removed **${duplicates.length}** duplicate track(s) from **${playlistName}**!`, thumbnailUrl: message.author.displayAvatarURL({ dynamic: true }) }));
      } else {
        const dupeList = duplicates.slice(0, 10).map((song, index) => {
          return `**${index + 1}.** ${song.trackTitle}`;
        }).join('\n');

        return message.reply(v2Message({
          color: client.ankushcolor,
          title: `Duplicates in ${playlistName}`,
          description: `Found **${duplicates.length}** duplicate track(s):\n\n${dupeList}${duplicates.length > 10 ? `\n...and ${duplicates.length - 10} more` : ''}`,
          footer: `Use "${prefix}pl-dupes ${playlistName} remove" to remove them`,
          thumbnailUrl: message.author.displayAvatarURL({ dynamic: true }),
        }));
      }
    } catch (error) {
      console.error('Error checking for duplicates:', error);
      return message.reply(v2Message({ color: client.ankushcolor, description: `<:x_cross:1250674944057278535> An error occurred while checking for duplicates!`, thumbnailUrl: message.author.displayAvatarURL({ dynamic: true }) }));
    }
  },
};