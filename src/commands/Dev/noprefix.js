const { ActionRowBuilder, ButtonBuilder, ButtonStyle, StringSelectMenuBuilder, StringSelectMenuOptionBuilder } = require("discord.js");
const NoPrefix = require('../../models/noprefix');
const TeamManagement = require('../../models/team');
const { v2Message } = require('../../utils/v2');

const LogConfig = { enabled: true, channelId: "1369340576591253639" };

async function isTeamMember(userId) { const teamMember = await TeamManagement.findOne({ userId: userId }); return !!teamMember; }

async function hasNoPrefixPermission(userId, client) {
  if (client.config.ownerID.includes(userId)) return { hasPermission: true, type: 'owner' };
  if (await isTeamMember(userId)) return { hasPermission: true, type: 'team' };
  return { hasPermission: false, type: 'none' };
}

async function sendLogMessage(client, action, executorId, targetId, targetUsername, executorType) {
  if (!LogConfig.enabled || !LogConfig.channelId) return;
  try {
    const logChannel = await client.channels.fetch(LogConfig.channelId);
    if (!logChannel) return;
    const color = action === 'add' ? '#00ff00' : '#ff0000';
    await logChannel.send(v2Message({ color, title: `NoPrefix ${action.charAt(0).toUpperCase() + action.slice(1)} Log`, description: `**Action:** ${action === 'add' ? 'Added to' : 'Removed from'} NoPrefix list\n**Target:** ${targetUsername} (<@${targetId}>)\n**Executed by:** <@${executorId}> (${executorType})`, footer: `User ID: ${targetId}` }));
  } catch (error) { console.error(`Failed to send log message: ${error.message}`); }
}

function getUser(message, args) {
  let user, ID;
  if (message.mentions.members.first()) { user = message.mentions.members.first(); ID = user.id; }
  else if (args[1] && /^\d{17,19}$/.test(args[1])) { user = message.guild.members.cache.get(args[1]) || null; ID = args[1]; }
  else { user = message.member; ID = user.id; }
  return { user, ID };
}

async function addUserToNoPrefixList(client, ID) {
  const existingUser = await NoPrefix.findOne({ userId: ID });
  if (existingUser) return 'already_added';
  await NoPrefix.create({ userId: ID });
  return 'added';
}

async function removeUserFromNoPrefixList(client, ID) {
  const existingUser = await NoPrefix.findOne({ userId: ID });
  if (!existingUser) return 'not_found';
  await NoPrefix.deleteOne({ userId: ID });
  return 'removed';
}

async function getNoPrefixList(client) { const data = await NoPrefix.find(); return data.map(entry => entry.userId); }

module.exports = {
  name: 'noprefix',
  category: 'Dev',
  aliases: ["np"], 
  cooldown: 5,
  description: 'Manage users who can use commands without prefix',
  args: false,
  usage: 'noprefix <add/remove/list/reset/setlog> [user/channelID]',
  userPerms: [],
  botPerms: ['EmbedLinks'],
  owner: false,
  player: false,
  inVoiceChannel: false,
  sameVoiceChannel: false,
  
  execute: async (message, args, client, prefix) => {
    const subcommand = args[0];
    const permissionCheck = await hasNoPrefixPermission(message.author.id, client);
    if (!permissionCheck.hasPermission) return message.channel.send("You don't have permission to use this command.");
    
    const guideMsg = v2Message({
      color: '#00ff00',
      description: `**noprefix add <user>**\nAdd a user to noprefix users for all servers.\n**noprefix remove <user>**\nRemove a user from noprefix users from all servers.\n**noprefix list**\nShows all the users in noprefix database.\n**noprefix reset**\nRemoves all the users from noprefix users from the database (Owner only).\n**noprefix setlog <channelID>**\nSet the channel for logging add/remove actions (Owner only).\n**noprefix check <user>**\nCheck if a user has noprefix access.`,
      thumbnailUrl: message.author.displayAvatarURL({dynamic: true, size: 2048}),
      footer: `Your access level: ${permissionCheck.type}`,
    });

    if (!subcommand) return message.channel.send(guideMsg);
    
    switch (subcommand) {
      case 'add': {
        if (!args[1]) return message.channel.send("Provide a Member or a valid User ID.");
        const { ID } = getUser(message, args);
        const result = await addUserToNoPrefixList(client, ID);
        let userObject;
        try { userObject = await client.users.fetch(ID); } catch (error) { return message.channel.send(`Error fetching user with ID ${ID}: ${error.message}`); }
        await sendLogMessage(client, 'add', message.author.id, ID, userObject.username, permissionCheck.type);
        return message.channel.send(result === 'already_added' ? `Already added no prefix to \`${userObject.username}\` for all guilds.` : `Added no prefix to \`${userObject.username}\` for all guilds.`);
      }
      
      case 'remove': {
        if (!args[1]) return message.channel.send("Provide a member mention or a valid User ID.");
        const { ID } = getUser(message, args);
        try {
          let userObject;
          try { userObject = await client.users.fetch(ID); } catch (error) { return message.channel.send(`Error fetching user with ID ${ID}: ${error.message}`); }
          const result = await removeUserFromNoPrefixList(client, ID);
          await sendLogMessage(client, 'remove', message.author.id, ID, userObject.username, permissionCheck.type);
          return message.channel.send(result === 'not_found' ? `\`${userObject.username}\` was not in the no-prefix list for all guilds.` : `Removed no-prefix from \`${userObject.username}\` for all guilds.`);
        } catch (error) {
          console.error(`Error while removing user ${ID}:`, error.message);
          return message.channel.send(`Could not remove user with ID \`${ID}\`. Ensure the user exists and try again.`);
        }
      }
      
      case 'check': {
        if (!args[1]) return message.channel.send("Provide a member mention or a valid User ID.");
        const { ID } = getUser(message, args);
        try {
          let userObject;
          try { userObject = await client.users.fetch(ID); } catch (error) { return message.channel.send(`Error fetching user with ID ${ID}: ${error.message}`); }
          const hasNoPrefix = await NoPrefix.findOne({ userId: ID });
          const status = hasNoPrefix ? "Has NoPrefix Access" : "No NoPrefix Access";
          const color = hasNoPrefix ? '#00ff00' : '#ff0000';
          return message.channel.send(v2Message({ color, title: 'NoPrefix Status Check', description: `**User:** ${userObject.username} (<@${ID}>)\n**Status:** ${status}`, thumbnailUrl: userObject.displayAvatarURL({ dynamic: true }) }));
        } catch (error) {
          console.error(`Error checking noprefix status for user ${ID}:`, error.message);
          return message.channel.send(`Could not check status for user with ID \`${ID}\`.`);
        }
      }
      
      case 'setlog': {
        if (!client.config.ownerID.includes(message.author.id)) return message.channel.send(`You don't have permission to set the log channel.`);
        if (!args[1]) return message.channel.send("Please provide a valid channel ID.");
        const channelId = args[1];
        if (!/^\d{17,19}$/.test(channelId)) return message.channel.send("Please provide a valid channel ID.");
        try {
          const channel = await client.channels.fetch(channelId);
          if (!channel) return message.channel.send("Channel not found.");
          if (!channel.isTextBased()) return message.channel.send("The provided channel is not a text channel.");
          LogConfig.channelId = channelId;
          await channel.send(v2Message({ color: '#00ff00', title: 'Log Channel Setup', description: 'This channel has been set up to receive NoPrefix command logs.' }));
          return message.channel.send(`Log channel has been set to <#${channelId}>.`);
        } catch (error) { return message.channel.send(`Could not set log channel: ${error.message}`); }
      }
      
      case 'list': {
        const listData = await getNoPrefixList(client);
        if (!listData || listData.length === 0) return message.channel.send("Nothing to Show");

        const totalPages = Math.ceil(listData.length / 10);
        let currentPage = 0;

        const generateContent = async (page) => {
          const startIndex = page * 10;
          const endIndex = Math.min(startIndex + 10, listData.length);
          const currentMembers = listData.slice(startIndex, endIndex);
          const fetchUserPromises = currentMembers.map(async (userId, index) => {
            try { const user = await client.users.fetch(userId); return `\`[${startIndex + index + 1}]\` | ID: [${userId}](https://discord.com/users/${userId}) | [${user.username}](https://discord.com/users/${userId})`; }
            catch (error) { return `\`[${startIndex + index + 1}]\` | ID: [${userId}](https://discord.com/users/${userId}) | User not found`; }
          });
          return (await Promise.all(fetchUserPromises)).join("\n");
        };

        const createPageDropdown = (totalPages) => {
          const selectMenu = new StringSelectMenuBuilder().setCustomId("page_select").setPlaceholder("Select a page to view");
          for (let i = 0; i < totalPages; i++) {
            selectMenu.addOptions(new StringSelectMenuOptionBuilder().setLabel(`Page ${i + 1}`).setValue(`${i}`).setDescription(`View users ${i * 10 + 1}-${Math.min((i + 1) * 10, listData.length)}`));
          }
          return new ActionRowBuilder().addComponents(selectMenu);
        };
        
        const closeButton = new ActionRowBuilder().addComponents(new ButtonBuilder().setStyle(ButtonStyle.Danger).setCustomId("close").setLabel("Close"));

        const memberList = await generateContent(currentPage);
        const components = [];
        if (totalPages > 1) components.push(createPageDropdown(totalPages));
        components.push(closeButton);

        try {
          const activeMessage = await message.channel.send(v2Message({
            color: '#00ff00', title: `Total No Prefix Users - Page ${currentPage + 1}/${totalPages}`, description: memberList, actionRows: components,
          }));

          const collector = activeMessage.createMessageComponentCollector({ filter: (i) => i.user.id === message.author.id, time: 120000, idle: 60000 });

          collector.on("collect", async (interaction) => {
            try {
              if (interaction.customId === "close") { collector.stop("user"); return; }
              if (interaction.customId === "page_select") {
                currentPage = parseInt(interaction.values[0]);
                const newContent = await generateContent(currentPage);
                const newComponents = [];
                if (totalPages > 1) newComponents.push(createPageDropdown(totalPages));
                newComponents.push(closeButton);
                await interaction.update(v2Message({ color: '#00ff00', title: `Total No Prefix Users - Page ${currentPage + 1}/${totalPages}`, description: newContent, actionRows: newComponents }));
              }
            } catch (error) {
              console.error("Error handling interaction:", error);
              try { if (!interaction.replied && !interaction.deferred) await interaction.reply({ content: "An error occurred.", ephemeral: true }); } catch (e) {}
            }
          });

          collector.on("end", async (collected, reason) => {
            try {
              if (reason === "user") await activeMessage.delete().catch(() => {});
              else await activeMessage.edit({ components: [] }).catch(() => {});
            } catch (e) {}
          });
        } catch (error) { return message.channel.send("Error displaying the list."); }
        break;
      }
      
      case 'reset': {
        if (!client.config.ownerID.includes(message.author.id)) return message.channel.send(`You don't have permission to use the reset command.`);
        const listData = await getNoPrefixList(client);
        if (!listData || listData.length === 0) return message.channel.send(`No one is in No Prefix Database.`);
        try { await NoPrefix.deleteMany({}); return message.channel.send(`Reset NoPrefix database. Removed ${listData.length} users.`); }
        catch (error) { return message.channel.send(`Failed to reset database: ${error.message}`); }
      }
      
      default: return message.channel.send(guideMsg);
    }
  }
};