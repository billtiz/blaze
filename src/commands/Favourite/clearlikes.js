const { ActionRowBuilder, StringSelectMenuBuilder, ComponentType } = require('discord.js');
const FavPlay = require('../../models/playlist');
const { v2Message } = require('../../utils/v2');

module.exports = {
  name: 'clearlikes',
  category: 'Favourite',
  description: 'Clear all songs from your favorites playlist',
  args: false,
  cooldown: 10,
  usage: '',
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
        return message.reply(v2Message({ color: '#ff0000', description: "❌ | You don't have a favorites playlist yet!" }));
      }

      if (!data.playlist || data.playlist.length === 0) {
        return message.reply(v2Message({ color: '#ff0000', description: "❌ | Your favorites playlist is already empty!" }));
      }

      const selectMenu = new StringSelectMenuBuilder()
        .setCustomId('clear_favorites_confirmation')
        .setPlaceholder('Please select an option')
        .addOptions([
          { label: 'Yes, clear all favorites', description: `Clear all ${data.playlist.length} songs from favorites`, value: 'confirm', emoji: '✅' },
          { label: 'No, keep my favorites', description: 'Cancel this operation', value: 'cancel', emoji: '❌' }
        ]);

      const row = new ActionRowBuilder().addComponents(selectMenu);

      const confirmMsg = await message.reply(v2Message({
        color: '#ff0000',
        title: '⚠️ Clear Favorites Confirmation',
        description: `Are you sure you want to clear all ${data.playlist.length} songs from your favorites?`,
        footer: 'Select an option from the dropdown menu below (expires in 30 seconds)',
        actionRows: [row],
      }));

      const collector = confirmMsg.createMessageComponentCollector({ componentType: ComponentType.StringSelect, time: 30000, max: 1 });

      collector.on('collect', async (interaction) => {
        if (interaction.user.id !== message.author.id) {
          return interaction.reply(v2Message({ color: '#ff0000', description: '❌ | This confirmation is not for you!', ephemeral: true }));
        }

        if (interaction.values[0] === 'confirm') {
          try {
            await FavPlay.updateOne({ userId: message.author.id, playlistName: Name }, { playlist: [] });
            await interaction.update(v2Message({ color: '#00ff00', title: '✅ Favorites Cleared', description: `Successfully cleared all songs from your favorites playlist!`, actionRows: [] }));
          } catch (error) {
            console.error('Clear favorites error:', error);
            await interaction.update(v2Message({ color: '#ff0000', description: '❌ | Failed to clear your favorites playlist.', actionRows: [] }));
          }
        } else {
          await interaction.update(v2Message({ color: '#0099ff', title: '❌ Action Cancelled', description: 'Your favorites playlist remains unchanged.', actionRows: [] }));
        }
      });

      collector.on('end', (collected) => {
        if (collected.size === 0) {
          confirmMsg.edit(v2Message({ color: '#ff0000', title: '❌ Confirmation Timeout', description: 'You took too long to confirm. Your favorites playlist remains unchanged.', actionRows: [] })).catch(e => console.error('Failed to update timeout message:', e));
        }
      });
    } catch (error) {
      console.error('Clear likes command error:', error);
      return message.reply(v2Message({ color: '#ff0000', description: '❌ | An error occurred while processing your request.' }));
    }
  }
};