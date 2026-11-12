const { ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const db2 = require("../../models/autoreconnect");
const { autoplay } = require("../../utils/functions");
const { REST } = require("@discordjs/rest");
const { v2Message, COLORS } = require('../../utils/v2');

module.exports = {
  name: 'playerEmpty',
  run: async (client, player, message) => {
    try {
      // Clean up previous message if it exists
      if (player.data.get('message') && player.data.get('message').deletable) {
        await player.data.get('message').delete().catch(() => null);
      }

      // Update voice status
      const voiceId = player.voiceId;
      const textId = player.textId;
      const status = `;`;
      const rest = new REST({ version: '10' }).setToken(client.config.token);
      await rest.put(`/channels/${voiceId}/voice-status`, {
        body: {
          status: status
        }
      }).catch(() => null);

      // Handle autoplay if enabled
      if (player.data.get("autoplay")) {
        player.previous = player.data.get("autoplaySystem");
        return autoplay(player, client);
      }

      // Get guild information
      let guild = client.guilds.cache.get(player.guildId);
      if (!guild) return;

      // Create buttons
      const buttons = new ActionRowBuilder()
        .addComponents(
          new ButtonBuilder()
            .setStyle(ButtonStyle.Link)
            .setLabel("Admin Perms")
            .setURL(
              `https://discord.com/oauth2/authorize?client_id=${client.user.id}&permissions=37088600&scope=bot%20applications.commands`
            ),
          new ButtonBuilder()
            .setStyle(ButtonStyle.Link)
            .setLabel("Require Perms")
            .setURL(
              `https://discord.com/api/oauth2/authorize?client_id=${client.user.id}&permissions=37080065&scope=bot`
            )
        );

      // Check for 24/7 mode
      const TwoFourSeven = await db2.findOne({ Guild: guild.id });
      
      let title, description;
      if (TwoFourSeven) {
        title = 'Queue Empty - 24/7 Mode Active';
        description = 'The queue is currently empty, but I\'ll stay in the voice channel since 24/7 mode is enabled.';
      } else {
        title = 'Queue Empty - Disconnecting';
        description = 'The queue has ended. I\'ll be disconnecting from the voice channel.';
      }

      const payload = v2Message({
        color: client.ankushcolor,
        title,
        description,
        actionRows: [buttons],
      });

      // Send the message BEFORE destroying the player
      const channel = client.channels.cache.get(textId);
      if (channel) {
        channel.send(payload).then(msg => {
          setTimeout(() => {
            msg.delete().catch(() => null);
          }, 10000);
        }).catch(() => null);
      }

      // Destroy player AFTER sending the message (only if not 24/7)
      if (!TwoFourSeven) {
        await player.destroy().catch(() => null);
      }

    } catch (error) {
      console.error('Error in playerEmpty event:', error);
    }
  },
};