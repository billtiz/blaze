const { v2Message } = require('../../utils/v2');

module.exports = {
  name: 'serverinfo',
  category: 'General',
  aliases: ['guildinfo', 'si'],
  description: 'Displays information about this Discord server.',
  args: false,
  usage: '',
  cooldown: 5,
  userPrams: [],
  botPrams: ['EmbedLinks'],
  owner: false,
  execute: async (message, args, client) => {
    const guild = message.guild;
    await guild.members.fetch().catch(() => null);
    const owner = await guild.fetchOwner().catch(() => null);
    const channels = guild.channels.cache;
    const roles = guild.roles.cache;
    const textChannels = channels.filter((channel) => channel.isTextBased() && !channel.isVoiceBased()).size;
    const voiceChannels = channels.filter((channel) => channel.isVoiceBased()).size;
    return message.reply(v2Message({
      color: client.brandColor || client.ankushcolor || '#FF9F0A',
      title: guild.name,
      description: guild.description || 'Server information',
      thumbnailUrl: guild.iconURL({ size: 256 }),
      fields: [
        { name: 'Owner', value: owner ? `${owner.user.tag}` : 'Unavailable', inline: true },
        { name: 'Members', value: `${guild.memberCount}`, inline: true },
        { name: 'Boosts', value: `${guild.premiumSubscriptionCount || 0}`, inline: true },
        { name: 'Text Channels', value: `${textChannels}`, inline: true },
        { name: 'Voice Channels', value: `${voiceChannels}`, inline: true },
        { name: 'Roles', value: `${roles.size}`, inline: true },
        { name: 'Created', value: `<t:${Math.floor(guild.createdTimestamp / 1000)}:D>`, inline: true },
        { name: 'Verification', value: `${guild.verificationLevel}`, inline: true },
      ],
      footer: `Server ID: ${guild.id}`,
    }));
  },
};
