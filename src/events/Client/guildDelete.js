const { WebhookClient } = require('discord.js');
const moment = require('moment');
const { webhookMessage } = require('../../utils/v2');

module.exports = {
  name: "guildDelete",
  run: async (client, guild) => {
    // Skip guild leave events during startup
    if (!global.isReady) {
      console.log(`Ignoring guild leave event for ${guild.id} during startup`);
      return;
    }
    
    let emoji;
    const hasFeatures = guild && guild.features;
    const isPartnered = hasFeatures && guild.features.includes('PARTNERED');
    const isVerified = hasFeatures && guild.features.includes('VERIFIED');
    
    let links = guild.banner ? `https://cdn.discordapp.com/banners/${guild.id}/${guild.banner}.webp?size=1024` : null;
    
    if(isPartnered && isVerified)
      emoji = `<:Partner:1315773559775428649><:verified:1286994555702345784>`;
    else if(isPartnered && !isVerified)
      emoji = "<:Partner:1315773559775428649>";
    else if(!isPartnered && isVerified)
      emoji = "<:verified:1286994555702345784>";
    else
      emoji = "<:cross:1277611886820593780>";
      
    const desc = `Name: **${guild.name}**\nId: **${guild.id}**\nDiscord Level: ${emoji}\nMemberCount: **${guild.memberCount}**\nGuild Joined: **<t:${Math.round(guild.joinedTimestamp / 1000)}:R>**`;
    
    const payload = webhookMessage({
      color: client.ankushcolor,
      title: 'Server left..!',
      description: desc,
      fields: [
        { name: `${client.user.username}'s Server Count`, value: `${client.guilds.cache.size} Servers` },
      ],
      imageUrl: links,
      thumbnailUrl: client.user.displayAvatarURL({ dynamic: true }),
    });
      
    const webhookUrl = client.config?.webhooks?.guildLeaveLog;
    if (webhookUrl) {
      const web = new WebhookClient({ url: webhookUrl });
      web.send(payload).catch(console.error);
    }
  }
};
