const { ActionRowBuilder, StringSelectMenuBuilder, StringSelectMenuOptionBuilder } = require('discord.js');
const FavPlay = require('../../models/playlist');
const { v2Message } = require('../../utils/v2');

module.exports = {
  name: 'showliked',
  aliases: ['liked', 'favorites', 'favourites', 'fav'],
  category: 'Favourite',
  description: 'Show all songs in your favorites playlist',
  args: false,
  cooldown: 5,
  usage: '[page]',
  userParams: [],
  botParams: ['EmbedLinks'],
  owner: false,
  player: false,
  inVoiceChannel: false,
  sameVoiceChannel: false,
  execute: async (message, args, client) => {
    try {
      const Name = "Fav";
      const data = await FavPlay.findOne({ userId: message.author.id, playlistName: Name });

      if (!data) {
        return message.reply(v2Message({ color: '#ff0000', description: "❌ | You don't have a favorites playlist yet! Use the `like` command while a song is playing to add it to your favorites." }));
      }

      if (!data.playlist || data.playlist.length === 0) {
        return message.reply(v2Message({ color: '#ff0000', description: "❌ | Your favorites playlist is empty! Use the `like` command while a song is playing to add it to your favorites." }));
      }

      const songsPerPage = 10;
      const playlist = data.playlist;
      const totalPages = Math.ceil(playlist.length / songsPerPage);
      let page = args[0] ? parseInt(args[0]) : 1;
      if (isNaN(page) || page < 1) page = 1;
      if (page > totalPages) page = totalPages;

      const startIndex = (page - 1) * songsPerPage;
      const endIndex = Math.min(startIndex + songsPerPage, playlist.length);
      const currentPageSongs = playlist.slice(startIndex, endIndex);

      const songsList = currentPageSongs.map((song, index) => {
        const songNumber = startIndex + index + 1;
        return `**${songNumber}. ${song.title}**\nArtist: ${song.author} | Duration: ${formatDuration(song.duration)}`;
      }).join('\n\n');

      let components = [];
      if (totalPages > 1) {
        const pageSelect = new StringSelectMenuBuilder()
          .setCustomId('page_select')
          .setPlaceholder(`Page ${page} of ${totalPages}`)
          .setMinValues(1)
          .setMaxValues(1);
        
        const maxPageOptions = Math.min(totalPages, 25);
        for (let i = 1; i <= maxPageOptions; i++) {
          pageSelect.addOptions(
            new StringSelectMenuOptionBuilder()
              .setLabel(`Page ${i}`)
              .setDescription(`${songsPerPage * (i-1) + 1}-${Math.min(songsPerPage * i, playlist.length)} of ${playlist.length} songs`)
              .setValue(`${i}`)
              .setDefault(i === page)
          );
        }
        
        components.push(new ActionRowBuilder().addComponents(pageSelect));
      }

      const response = await message.reply(v2Message({
        color: '#ff0000',
        title: `${message.author.username}'s Favorite Songs`,
        description: `Showing page ${page} of ${totalPages} (${playlist.length} total songs)\n\n${songsList}`,
        actionRows: components,
      }));

      if (totalPages <= 1) return;

      const filter = i => i.user.id === message.author.id && i.customId === 'page_select';
      const collector = response.createMessageComponentCollector({ filter, time: 120000 });

      collector.on('collect', async (interaction) => {
        page = parseInt(interaction.values[0]);
        const newStartIndex = (page - 1) * songsPerPage;
        const newEndIndex = Math.min(newStartIndex + songsPerPage, playlist.length);
        const newPageSongs = playlist.slice(newStartIndex, newEndIndex);

        const newSongsList = newPageSongs.map((song, index) => {
          const songNumber = newStartIndex + index + 1;
          return `**${songNumber}. ${song.title}**\nArtist: ${song.author} | Duration: ${formatDuration(song.duration)}`;
        }).join('\n\n');

        const newPageSelect = new StringSelectMenuBuilder()
          .setCustomId('page_select')
          .setPlaceholder(`Page ${page} of ${totalPages}`)
          .setMinValues(1)
          .setMaxValues(1);
        
        const maxPageOptions = Math.min(totalPages, 25);
        for (let i = 1; i <= maxPageOptions; i++) {
          newPageSelect.addOptions(
            new StringSelectMenuOptionBuilder()
              .setLabel(`Page ${i}`)
              .setDescription(`${songsPerPage * (i-1) + 1}-${Math.min(songsPerPage * i, playlist.length)} of ${playlist.length} songs`)
              .setValue(`${i}`)
              .setDefault(i === page)
          );
        }

        await interaction.update(v2Message({
          color: '#ff0000',
          title: `${message.author.username}'s Favorite Songs`,
          description: `Showing page ${page} of ${totalPages} (${playlist.length} total songs)\n\n${newSongsList}`,
          actionRows: [new ActionRowBuilder().addComponents(newPageSelect)],
        }));
      });

      collector.on('end', () => {
        response.edit({ components: [] }).catch(e => console.error('Failed to remove components:', e));
      });
    } catch (error) {
      console.error('Show liked command error:', error);
      return message.reply(v2Message({ color: '#ff0000', description: '❌ | An error occurred while processing your request.' }));
    }
  }
};

function formatDuration(ms) {
  const minutes = Math.floor(ms / 60000);
  const seconds = ((ms % 60000) / 1000).toFixed(0);
  return `${minutes}:${seconds.padStart(2, '0')}`;
}