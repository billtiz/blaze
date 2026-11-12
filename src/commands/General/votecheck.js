const { ButtonBuilder, ActionRowBuilder, ButtonStyle } = require("discord.js");
const axios = require("axios");
const { v2Message } = require('../../utils/v2');

module.exports = {
  name: 'votecheck',
  category: 'General',
  aliases: ['checkvote'],
  cooldown: 10,
  description: 'Checks if you have voted for the bot on Discord Bot List',
  args: false,
  usage: '',
  userPrams: [],
  botPrams: ['EmbedLinks'],
  owner: false,
  execute: async (message, args, client, prefix) => {
    try {
      const userId = message.author.id;
      const config = require('../../config.js');
      const apiToken = config.dblToken;
      
      const sent = await message.reply(v2Message({ color: client.ankushcolor, description: 'Checking your vote status...' }));
      
      const response = await axios.get(`https://discordbotlist.com/api/v1/bots/${client.user.id}/upvotes`, {
        headers: { 'Authorization': `Bot ${apiToken}` }
      });
      
      const hasVoted = response.data.upvotes.some(vote => vote.user_id === userId);
      
      const voteButton = new ButtonBuilder()
        .setLabel('Vote for Bot')
        .setURL(`https://discordbotlist.com/bots/${client.user.id}/upvote`)
        .setStyle(ButtonStyle.Link);
      
      const row = new ActionRowBuilder().addComponents(voteButton);

      let fields = [];
      if (hasVoted) {
        const userVote = response.data.upvotes.find(vote => vote.user_id === userId);
        if (userVote && userVote.timestamp) {
          const voteTime = new Date(userVote.timestamp);
          const nextVoteTime = new Date(voteTime.getTime() + 12 * 60 * 60 * 1000);
          fields = [
            { name: 'Last Vote', value: `<t:${Math.floor(voteTime.getTime() / 1000)}:R>` },
            { name: 'Next Vote', value: `<t:${Math.floor(nextVoteTime.getTime() / 1000)}:R>` }
          ];
        }
      } else {
        fields = [{ name: 'Vote Benefits', value: 'Voting gives you access to exclusive commands and features!' }];
      }

      await sent.edit(v2Message({
        color: hasVoted ? '#00FF00' : '#FF0000',
        title: 'Vote Status',
        description: hasVoted
          ? `✅ Thank you for voting for ${client.user.username}!`
          : `❌ You haven't voted for ${client.user.username} yet!`,
        fields,
        footer: `Requested by ${message.author.tag}`,
        actionRows: [row],
      }));
      
    } catch (error) {
      console.error('Error checking vote status:', error);
      message.reply(v2Message({ color: '#ff0000', description: 'Failed to check your vote status. Please try again later.' }));
    }
  }
};
