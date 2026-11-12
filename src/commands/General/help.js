const { ActionRowBuilder, StringSelectMenuBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const { v2Message, COMPONENTS_V2_FLAG, container, text, section, separator } = require('../../utils/v2');

module.exports = {
  name: 'help',
  category: 'General',
  aliases: ['helpp', 'h'],
  cooldown: 5,
  description: 'Help with all commands, or one specific command.',
  args: false,
  botPrams: [],
  owner: false,
  execute: async (message, args, client, prefix) => {
    if (!args[0]) {

      // Category command lists
      const generalCmds = `**\`help\`**, **\`invite\`**, **\`ping\`**, **\`uptime\`**, **\`profile\`**, **\`stats\`**, **\`botinfo\`**, **\`serverinfo\`**, **\`vote\`**, **\`checkvote\`**, **\`support\`**`;
      const musicCmds = `**\`247\`**, **\`autoplay\`**, **\`clearqueue\`**, **\`join\`**, **\`leave\`**, **\`forceskip\`**, **\`seek\`**, **\`grab\`**, **\`loop\`**, **\`move\`**, **\`nowplaying\`**, **\`pause\`**, **\`play\`**, **\`queue\`**, **\`remove\`**, **\`removedupes\`**, **\`replay\`**, **\`resume\`**, **\`rewind\`**, **\`search\`**, **\`shuffle\`**, **\`skip\`**, **\`skipto\`**, **\`stop\`**, **\`volume\`**`;
      const playlistCmds = `**\`pl-add\`**, **\`pl-addnowplaying\`**, **\`pl-addqueue\`**, **\`pl-create\`**, **\`pl-delete\`**, **\`pl-dupes\`**, **\`pl-info\`**, **\`pl-list\`**, **\`pl-load\`**, **\`pl-remove\`**`;
      const filtersCmds = `**\`8d\`**, **\`bass\`**, **\`clearfilters\`**, **\`dance\`**, **\`earrape\`**, **\`electronic\`**, **\`lofi\`**, **\`nightcore\`**, **\`party\`**, **\`pop\`**, **\`radio\`**, **\`rock\`**, **\`slowreverb\`**, **\`treblebass\`**, **\`vaporwave\`**, **\`darthvader\`**`;
      const settingsCmds = `**\`prefix\`**, **\`ignorechannel\`**, **\`avatar\`**, **\`banner\`**, **\`partner\`**`;
      const favouriteCmds = `**\`like\`**, **\`playliked\`**, **\`clearlikes\`**, **\`showliked\`**`;

      // Build V2 payloads for each category
      const homePayload = v2Message({
        color: client.ankushcolor,
        description: `**Hey!!** [${message.author.displayName}](https://discord.com/users/${message.author.id}), I am [${client.user.username}](https://discord.com/users/${client.user.id})\n**Help Menu:**\n~ My default prefix is: ${prefix}\n~ Total Commands: \`${client.commands.size}\` |\n~ Usable By You \`96\``,
        fields: [
          { name: `BlaZe Commands:`, value: `>>> <:Home:1293196346060181546> **: General**\n<:Music:1293196450284437504> **: Music**\n<:Filter:1293196502369570857> **: Filters**\n<:Playlist:1293199715328069695> **: Playlist**\n<:Setting:1293196668245905438> **: Settings**\n<:Favourite:1351113884940898354> **: Favourite**` },
          { name: `~ Select A Category From Below`, value: `~ [Invite BlaZe](https://discord.com/oauth2/authorize?client_id=${client.user.id}&permissions=8&scope=bot%20applications.commands)${client.config.supportServer ? ` | [Support Server](${client.config.supportServer})` : ''}` }
        ],
        thumbnailUrl: client.user.displayAvatarURL({ dynamic: true }),
      });

      const row1 = new ActionRowBuilder()
        .addComponents(
          new StringSelectMenuBuilder()
            .setCustomId('helpop')
            .setPlaceholder('❯ SELECT A CATEGORY')
            .addOptions([
              { label: `Home`, description: 'Get Home Page', emoji: `<:Home:1293196346060181546>`, value: `h1` },
              { label: 'General', description: 'View general commands', value: 'h2', emoji: `<:Home:1293196346060181546>` },
              { label: 'Music', description: 'View music commands', value: 'h3', emoji: `<:Music:1293196450284437504>` },
              { label: 'Filters', description: 'View filters commands', value: 'h4', emoji: `<:Filter:1293196502369570857>` },
              { label: 'Playlist', description: 'View playlist commands', value: 'h5', emoji: `<:Playlist:1293199715328069695>` },
              { label: 'Settings', description: 'View settings commands', value: 'h6', emoji: `<:Setting:1293196668245905438>` },
              { label: 'Favourite', description: 'View favourite commands', value: 'h9', emoji: `<:Favourite:1351113884940898354>` },
              { label: 'All Commands', description: 'View all commands', value: 'h10', emoji: `<:Commands:1351134190048903209>` }
            ])
        );

      const helpButtons = [new ButtonBuilder().setLabel('Invite Me').setURL(`https://discord.com/oauth2/authorize?client_id=${client.user.id}&permissions=8&scope=bot%20applications.commands`).setStyle(ButtonStyle.Link)];
      if (client.config.supportServer) helpButtons.push(new ButtonBuilder().setLabel('Support Server').setURL(client.config.supportServer).setStyle(ButtonStyle.Link));
      const row2 = new ActionRowBuilder().addComponents(helpButtons);

      // Add action rows to home payload
      homePayload.components[0].components.push(row1.toJSON(), row2.toJSON());
      
      const msg = await message.channel.send({ ...homePayload, allowedMentions: { parse: [] } });

      // Category payloads
      const categoryPayloads = {
        h1: homePayload,
        h2: v2Message({ color: client.ankushcolor, title: '- General Commands', description: generalCmds, thumbnailUrl: client.user.displayAvatarURL({ dynamic: true }) }),
        h3: v2Message({ color: client.ankushcolor, title: '- Music Commands', description: musicCmds, thumbnailUrl: client.user.displayAvatarURL({ dynamic: true }) }),
        h4: v2Message({ color: client.ankushcolor, title: '- Filters Commands', description: filtersCmds, thumbnailUrl: client.user.displayAvatarURL({ dynamic: true }) }),
        h5: v2Message({ color: client.ankushcolor, title: '- Playlist Commands', description: playlistCmds, thumbnailUrl: client.user.displayAvatarURL({ dynamic: true }) }),
        h6: v2Message({ color: client.ankushcolor, title: '- Settings Commands', description: settingsCmds, thumbnailUrl: client.user.displayAvatarURL({ dynamic: true }) }),
        h9: v2Message({ color: client.ankushcolor, title: '- Favourite Commands', description: favouriteCmds, thumbnailUrl: client.user.displayAvatarURL({ dynamic: true }) }),
        h10: v2Message({ color: client.ankushcolor, title: `${client.user.username} - All Commands`, description: `**__General Commands__:**\n${generalCmds}\n\n**__Music Commands__:**\n${musicCmds}\n\n**__Playlist Commands__:**\n${playlistCmds}\n\n**__Filters Commands__:**\n${filtersCmds}\n\n**__Settings Commands__:**\n${settingsCmds}\n\n**__Favourite Commands__:**\n${favouriteCmds}`, thumbnailUrl: client.user.displayAvatarURL({ dynamic: true }) }),
      };

      // Add action rows to all category payloads
      for (const key of Object.keys(categoryPayloads)) {
        if (key !== 'h1') {
          categoryPayloads[key].components[0].components.push(row1.toJSON(), row2.toJSON());
        }
      }

      const collector = await msg.createMessageComponentCollector({
        filter: (interaction) => {
          if (message.author.id === interaction.user.id) return true;
          else {
            interaction.reply(v2Message({ color: '#ff0000', description: `<:x_cross:1250674944057278535> Only **${message.author.tag}** can use this button!`, ephemeral: true }));
          }
        },
        time: 1000000,
        idle: 1000000 / 2
      });

      collector.on('collect', async (interaction) => {
        if (interaction.isStringSelectMenu()) {
          for (const value of interaction.values) {
            if (categoryPayloads[value]) {
              return interaction.update({ ...categoryPayloads[value], allowedMentions: { parse: [] } });
            }
          }
        }
      });

      collector.on('end', async () => {
        msg.edit({ ...homePayload, components: [], allowedMentions: { parse: [] } });
      });
    }
  }
};
