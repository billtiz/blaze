const axios = require('axios');
const { v2Message } = require('../../utils/v2');

module.exports = {
  name: "banner",
  category: "Settings",
  aliases: ["userbanner"],
  description: "Display user's banner",
  args: false,
  usage: "[user mention/ID]",
  userPerms: [],
  execute: async (message, args, client, prefix) => {
    try {
      let user = message.mentions.users.first() 
        || (args[0] && await client.users.fetch(args[0]).catch(() => null)) 
        || message.author;

      const response = await axios.get(`https://discord.com/api/users/${user.id}`, {
        headers: { Authorization: `Bot ${client.token}` }
      });

      const { banner, banner_color } = response.data;

      if (banner) {
        const extension = banner.startsWith("a_") ? '.gif' : '.png';
        const bannerURL = `https://cdn.discordapp.com/banners/${user.id}/${banner}${extension}?size=4096`;

        message.reply(v2Message({
          color: banner_color || client.ankushcolor,
          title: `${user.tag}'s Banner`,
          imageUrl: bannerURL,
          footer: `Requested by ${message.author.tag}`,
        }));
      } else {
        message.reply(v2Message({
          color: client.ankushcolor,
          description: `**${user.username}** doesn't have a banner`,
          footer: `Requested by ${message.author.tag}`,
        }));
      }
    } catch (error) {
      console.error('Banner fetch error:', error);
      message.reply({ content: "Failed to fetch banner. Please try again later." });
    }
  }
};