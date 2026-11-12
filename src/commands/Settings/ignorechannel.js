const { PermissionsBitField } = require('discord.js');
const { IgnoreChannel } = require('../../database');
const { hasVotePermission } = require('../../utils/voteCheck');
const { v2Message } = require('../../utils/v2');

module.exports = {
  name: 'ignorechannel',
  category: "Settings",
  aliases: ['ignore'],
  description: 'Manage channels where bot commands are ignored',
  usage: '<add/remove/list/reset>',
  args: true,
  userPrams: ['ManageGuild'],
  botPrams: ['EmbedLinks'],
  
  async execute(message, args, client, prefix) {
    const hasVoted = await hasVotePermission(message.author.id, client);
    if (!hasVoted) {
      return message.reply("This command requires you to vote for the bot! Use the `vote` command to learn more.");
    }
    
    const subCommand = args[0]?.toLowerCase();
    
    if (!['add', 'remove', 'list', 'reset', 'clear', 'resetall'].includes(subCommand)) {
      return message.reply(v2Message({
        color: client.ankushcolor,
        title: 'Ignore Channel Command',
        description: 'Configure channels where the bot will ignore commands',
        fields: [
          { name: 'Usage', value: `\`${prefix}ignorechannel <add/remove/list/reset> [channel]\`` },
          { name: 'Examples', value: 
            `\`${prefix}ignorechannel add #general\` - Ignore commands in #general\n` +
            `\`${prefix}ignorechannel remove #general\` - Stop ignoring commands in #general\n` +
            `\`${prefix}ignorechannel list\` - List all ignored channels\n` +
            `\`${prefix}ignorechannel reset\` - Reset all ignored channels for this server`
          }
        ],
      }));
    }

    if (subCommand === 'list') {
      const ignoredChannels = await IgnoreChannel.find({ guildId: message.guild.id });
      if (ignoredChannels.length === 0) {
        return message.reply(v2Message({ color: client.ankushcolor, title: 'Ignored Channels', description: 'There are no ignored channels in this server.' }));
      }
      const channelList = ignoredChannels.map(ch => `<#${ch.channelId}>`).join('\n');
      return message.reply(v2Message({ color: client.ankushcolor, title: 'Ignored Channels', description: `Commands are ignored in the following channels:\n${channelList}` }));
    }
    
    if (['reset', 'clear', 'resetall'].includes(subCommand)) {
      const result = await IgnoreChannel.deleteMany({ guildId: message.guild.id });
      if (result.deletedCount === 0) {
        return message.reply(v2Message({ color: client.ankushcolor, title: 'Nothing to Reset', description: 'There are no ignored channels to reset in this server.' }));
      }
      return message.reply(v2Message({ color: client.ankushcolor, title: 'Ignored Channels Reset', description: `Successfully reset and removed **${result.deletedCount}** ignored channel(s) for this server.` }));
    }
    
    const channel = message.mentions.channels.first() || message.guild.channels.cache.get(args[1]);
    if (!channel) {
      return message.reply(v2Message({ color: '#ff0000', title: 'Channel Not Found', description: 'Please mention a valid channel or provide a valid channel ID.' }));
    }
    
    if (subCommand === 'add') {
      const existing = await IgnoreChannel.findOne({ guildId: message.guild.id, channelId: channel.id });
      if (existing) {
        return message.reply(v2Message({ color: '#ff0000', title: 'Channel Already Ignored', description: `<#${channel.id}> is already in the ignored channels list.` }));
      }
      await IgnoreChannel.create({ guildId: message.guild.id, channelId: channel.id });
      return message.reply(v2Message({ color: client.ankushcolor, title: 'Channel Added', description: `<#${channel.id}> has been added to the ignored channels list.` }));
    }
    
    if (subCommand === 'remove') {
      const existing = await IgnoreChannel.findOne({ guildId: message.guild.id, channelId: channel.id });
      if (!existing) {
        return message.reply(v2Message({ color: '#ff0000', title: 'Channel Not Ignored', description: `<#${channel.id}> is not in the ignored channels list.` }));
      }
      await IgnoreChannel.deleteOne({ guildId: message.guild.id, channelId: channel.id });
      return message.reply(v2Message({ color: client.ankushcolor, title: 'Channel Removed', description: `<#${channel.id}> has been removed from the ignored channels list.` }));
    }
  }
};