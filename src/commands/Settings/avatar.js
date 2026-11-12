const { ButtonBuilder, ActionRowBuilder, ButtonStyle } = require("discord.js");
const { v2Message } = require('../../utils/v2');

module.exports = {
  name: "avatar",
  category: "Settings",
  aliases: ["av", "pfp"],
  description: "Display user avatar with download options",
  args: false,
  usage: "[user mention/ID]",
  userPerms: [],
  execute: async (message, args, client, prefix) => {
    let user = message.mentions.users.first() 
      || (args[0] && await client.users.fetch(args[0]).catch(() => null)) 
      || message.author;

    const isAnimated = user.avatar?.startsWith('a_');

    const avatarURLs = {
      png: user.displayAvatarURL({ format: "png", dynamic: false, size: 4096 }),
      jpg: user.displayAvatarURL({ format: "jpg", dynamic: false, size: 4096 }),
      webp: user.displayAvatarURL({ format: "webp", dynamic: false, size: 4096 }),
      gif: isAnimated ? user.displayAvatarURL({ format: "gif", dynamic: true, size: 4096 }) : null
    };

    const downloadButtons = [
      new ButtonBuilder().setLabel("PNG").setStyle(ButtonStyle.Link).setURL(avatarURLs.png),
      new ButtonBuilder().setLabel("JPG").setStyle(ButtonStyle.Link).setURL(avatarURLs.jpg),
      new ButtonBuilder().setLabel("WEBP").setStyle(ButtonStyle.Link).setURL(avatarURLs.webp)
    ];

    if (isAnimated) {
      downloadButtons.push(new ButtonBuilder().setLabel("GIF").setStyle(ButtonStyle.Link).setURL(avatarURLs.gif));
    }

    const downloadRow = new ActionRowBuilder().addComponents(downloadButtons);

    message.reply(v2Message({
      color: client.ankushcolor,
      title: `${user.tag}'s Avatar`,
      imageUrl: user.displayAvatarURL({ dynamic: true, size: 4096 }),
      footer: `Requested by ${message.author.tag}`,
      actionRows: [downloadRow],
    }));
  }
};