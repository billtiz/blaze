const { ButtonBuilder, ActionRowBuilder, ButtonStyle } = require("discord.js");
const { v2Message } = require('../../utils/v2');

module.exports = {
  name: 'vote',
  category: 'General',
  aliases: ['upvote', 'rate', 'support'],
  cooldown: 5,
  description: 'Get voting links to support the bot',
  args: false,
  usage: '',
  userPerms: [],
  botPerms: ['EmbedLinks'],
  owner: false,
  execute: async (message, args, client, prefix) => {
    try {
      const voteLinks = {
        discordbotlist: client.config?.links?.dbl || `https://discordbotlist.com/bots/${client.user.id}/upvote`
      };

      const voteButtons = new ActionRowBuilder().addComponents(
        new ButtonBuilder().setLabel('Vote on DBL').setStyle(ButtonStyle.Link).setURL(voteLinks.discordbotlist),
      );

      return await message.reply(v2Message({
        color: client.config?.embedColor || '#ff0000',
        title: `Vote for ${client.user.username}`,
        description: `🗳️ **Support Us By Voting!**\n\nYour vote helps us grow and reach more users.\nVote now to:\n• Support our development team\n• Help others discover ${client.user.username}\n• Get exclusive vote rewards (if enabled)\n• Show your appreciation for our service\n\nClick the button below to vote! 💖\nYou can vote every 12 hours.`,
        thumbnailUrl: client.user.displayAvatarURL({ size: 256 }),
        footer: `Requested by ${message.author.tag} • Thanks for your support!`,
        actionRows: [voteButtons],
      }));
    } catch (error) {
      console.error('Error in vote command:', error);
      return message.reply({ content: 'An error occurred while processing your request. Please try again later.' });
    }
  }
};