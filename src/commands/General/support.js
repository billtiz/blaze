const { ButtonBuilder, ActionRowBuilder, ButtonStyle } = require("discord.js");
const { v2Message } = require('../../utils/v2');

module.exports = {
  name: 'support',
  category: 'General',
  aliases: ['server', 'help-server', 'discord'],
  cooldown: 5,
  description: 'Get support server invitation and helpful resources',
  args: false,
  usage: '',
  userPerms: [],
  botPerms: ['EmbedLinks'],
  owner: false,
  execute: async (message, args, client, prefix) => {
    try {
      const supportButtons = [new ButtonBuilder().setLabel('Invite Bot').setStyle(ButtonStyle.Link).setURL(`https://discord.com/oauth2/authorize?client_id=${client.user.id}&permissions=8&scope=bot%20applications.commands`)];
      if (client.config?.supportServer) supportButtons.unshift(new ButtonBuilder().setLabel('Join Support Server').setStyle(ButtonStyle.Link).setURL(client.config.supportServer));
      const buttons = new ActionRowBuilder().addComponents(supportButtons);

      return await message.reply(v2Message({
        color: client.config?.embedColor || '#ff0000',
        title: `${client.user.username} Support`,
        description: `**Need help?**\n\nJoin our support server for:\n• 24/7 Support from our team\n• Bug reports and feature requests\n• Community events and giveaways\n• Latest updates and announcements\n• Connect with other users\n\nClick the buttons below to get started!`,
        thumbnailUrl: client.user.displayAvatarURL({ size: 256 }),
        footer: `Requested by ${message.author.tag}`,
        actionRows: [buttons],
      }));
    } catch (error) {
      console.error('Error in support command:', error);
      return message.reply({ content: 'An error occurred while processing your request. Please try again later.' });
    }
  }
};