const { ChannelType, ActionRowBuilder, ButtonBuilder, ButtonStyle, WebhookClient } = require('discord.js');
const blacklistedServerService = require('../../services/blacklistedServerService');
const { v2Message, webhookMessage, COLORS } = require('../../utils/v2');

module.exports = {
  name: "guildCreate",
  run: async (client, guild) => {
    try {
      // Check if the server is blacklisted
      const isBlacklisted = await blacklistedServerService.isBlacklisted(guild.id);
      
      if (isBlacklisted) {
        console.log(`Left blacklisted server: ${guild.name} (${guild.id})`);
        return await guild.leave();
      }

      // Continue with welcome message and logging if server isn't blacklisted
      let text;
      guild.channels.cache.forEach(c => {
        if (c.type === ChannelType.GuildText && !text) text = c;
      });
      
      if (!text) {
        console.log(`Joined guild ${guild.name} but couldn't find a text channel`);
        return;
      }
      
      const invite = await text.createInvite({ reason: `For ${client.user.tag} Developer(s)`, maxAge: 0 })
        .catch(err => {
          console.error(`Couldn't create invite in ${guild.name}: ${err.message}`);
          return null;
        });
      
      let prefix = client.prefix;
      let links = guild.banner ? `https://cdn.discordapp.com/banners/${guild.id}/${guild.banner}.webp?size=1024` : null;

      // Build join log description
      let joinDesc = `Name: **${guild.name}**\nId: **${guild.id}**\nMemberCount: **${guild.memberCount}**\nGuild Joined: **<t:${Math.round(guild.joinedTimestamp / 1000)}:R>**`;
      
      const ownerMember = await guild.members.fetch(guild.ownerId).catch(() => null);
      const ownerTag = ownerMember ? ownerMember.user.tag : "Unknown User";
      
      let fields = [
        { name: 'Owner', value: `Info: **${ownerTag}**\nGuild Created: **<t:${Math.round(guild.createdTimestamp / 1000)}:R>**` },
        { name: `${client.user.username}'s Server Count`, value: `${client.guilds.cache.size} Servers` },
      ];
      
      if (invite) {
        fields.push({ name: 'Invite link', value: `[Here is ${guild.name} invite](https://discord.gg/${invite.code})` });
      }

      if (guild.vanityURLCode) {
        joinDesc += `\n[Vanity URL](https://discord.gg/${guild.vanityURLCode})`;
      }

      const joinPayload = webhookMessage({
        color: client.ankushcolor,
        title: 'Joined a new server!',
        description: joinDesc,
        fields,
        imageUrl: links,
        thumbnailUrl: client.user.displayAvatarURL({ dynamic: true }),
      });
      
      const webhookUrl = client.config?.webhooks?.guildJoinLog;
      if (webhookUrl) {
        const web = new WebhookClient({ url: webhookUrl });
        web.send(joinPayload).catch(console.error);
      }
      
      // Welcome message for the server
      const welcomeButtons = [new ButtonBuilder().setStyle(ButtonStyle.Link).setURL(`https://discord.com/oauth2/authorize?client_id=${client.user.id}&permissions=8&scope=bot%20applications.commands`).setLabel('Invite')];
      if (client.config.supportServer) welcomeButtons.push(new ButtonBuilder().setStyle(ButtonStyle.Link).setURL(client.config.supportServer).setLabel('Support Server'));
      const welcomeRow = new ActionRowBuilder().addComponents(welcomeButtons);

      const welcomePayload = v2Message({
        color: client.ankushcolor,
        title: `Thanks for adding ${client.user.username}!`,
        description: `To get started, join a voice channel and send \`${prefix}play <song name or url>\` to play song.\n・ I come up with different search engines, You may try out me with \`${prefix}play\`\n・ You can use the \`${prefix}help\` command to get list of commands\n・ ${client.config.supportServer ? `Feel free to join our [Support Server](${client.config.supportServer}) if you need help/support for anything related to the bot.` : 'Use the help command if you need assistance.'}`,
        thumbnailUrl: client.user.displayAvatarURL({ dynamic: true }),
        actionRows: [welcomeRow],
      });

      const serverChannel = guild.channels.cache.find(
        (channel) =>
          channel.name.includes("logs") ||
          channel.name.includes("log") ||
          channel.name.includes("setup") ||
          channel.name.includes("bot") ||
          channel.name.includes("bot-logs") ||
          channel.name.includes("music") ||
          channel.name.includes("music-logs") ||
          channel.name.includes("music-req") ||
          channel.name.includes("chat") ||
          channel.name.includes("general") ||
          channel.name.includes("welcome") ||
          channel.name.includes("gen") ||
          channel.name.includes("rank") ||
          channel.name.includes("media") ||
          channel.name.includes("pic") ||
          channel.name.includes("meme")
      );

      if (serverChannel) {
        serverChannel.send(welcomePayload).catch(console.error);
      }
    } catch (error) {
      console.error(`Error in guildCreate event: ${error}`);
    }
  }
};
