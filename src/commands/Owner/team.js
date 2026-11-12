const { ActionRowBuilder, StringSelectMenuBuilder, StringSelectMenuOptionBuilder } = require("discord.js");
const TeamManagement = require('../../models/team');
const { v2Message } = require('../../utils/v2');

const LogConfig = { enabled: true, channelId: "1375948964393648259" };

async function sendLogMessage(client, action, executorId, targetId, targetUsername) {
  if (!LogConfig.enabled || !LogConfig.channelId) return;
  try {
    const logChannel = await client.channels.fetch(LogConfig.channelId);
    if (!logChannel) return;
    const color = action === 'add' ? '#00ff00' : '#ff0000';
    await logChannel.send(v2Message({
      color, title: `Team Management ${action.charAt(0).toUpperCase() + action.slice(1)} Log`,
      description: `**Action:** ${action === 'add' ? 'Added to' : 'Removed from'} Team Management\n**Target:** ${targetUsername} (<@${targetId}>)\n**Executed by:** <@${executorId}>`,
      footer: `User ID: ${targetId}`,
    }));
  } catch (error) { console.error(`Failed to send team log message: ${error.message}`); }
}

function getUser(message, args) {
  let user, ID;
  if (message.mentions.members.first()) { user = message.mentions.members.first(); ID = user.id; }
  else if (args[1] && /^\d{17,19}$/.test(args[1])) { user = message.guild.members.cache.get(args[1]) || null; ID = args[1]; }
  else { user = message.member; ID = user.id; }
  return { user, ID };
}

async function addUserToTeam(client, ID, addedById) {
  const existingUser = await TeamManagement.findOne({ userId: ID });
  if (existingUser) return 'already_added';
  await TeamManagement.create({ userId: ID, addedBy: addedById, addedAt: new Date() });
  return 'added';
}

async function removeUserFromTeam(client, ID) {
  const existingUser = await TeamManagement.findOne({ userId: ID });
  if (!existingUser) return 'not_found';
  await TeamManagement.deleteOne({ userId: ID });
  return 'removed';
}

async function getTeamList(client) { return await TeamManagement.find(); }

module.exports = {
  name: 'team',
  category: 'Owner',
  aliases: ["tm", "teammanage"], 
  cooldown: 5,
  description: 'Manage team members who can add/remove NoPrefix users',
  args: false,
  usage: 'team <add/remove/list/reset> [user]',
  userPerms: [],
  botPerms: ['EmbedLinks'],
  owner: true,
  player: false,
  inVoiceChannel: false,
  sameVoiceChannel: false,
  
  execute: async (message, args, client, prefix) => {
    const subcommand = args[0];
    if (!client.config.ownerID.includes(message.author.id)) return message.channel.send("You don't have permission to use this command.");
    
    const guideMsg = v2Message({
      color: '#00ff00',
      title: 'Team Management Commands',
      description: `**team add <user>**\nAdd a user to team management.\n**team remove <user>**\nRemove a user from team management.\n**team list**\nShows all team management members.\n**team reset**\nRemoves all team members from the database.`,
      thumbnailUrl: message.author.displayAvatarURL({dynamic: true, size: 2048}),
    });

    if (!subcommand) return message.channel.send(guideMsg);
    
    switch (subcommand) {
      case 'add': {
        if (!args[1]) return message.channel.send("Provide a Member or a valid User ID.");
        const { ID } = getUser(message, args);
        if (ID === message.author.id) return message.channel.send("You cannot add yourself to team management.");
        if (client.config.ownerID.includes(ID)) return message.channel.send("Owners are already part of team management by default.");
        const result = await addUserToTeam(client, ID, message.author.id);
        let userObject;
        try { userObject = await client.users.fetch(ID); } catch (error) { return message.channel.send(`Error fetching user with ID ${ID}: ${error.message}`); }
        await sendLogMessage(client, 'add', message.author.id, ID, userObject.username);
        return message.channel.send(result === 'already_added' ? `\`${userObject.username}\` is already in team management.` : `Added \`${userObject.username}\` to team management.`);
      }
      
      case 'remove': {
        if (!args[1]) return message.channel.send("Provide a member mention or a valid User ID.");
        const { ID } = getUser(message, args);
        if (ID === message.author.id) return message.channel.send("You cannot remove yourself from team management.");
        if (client.config.ownerID.includes(ID)) return message.channel.send("You cannot remove owners from team management.");
        try {
          let userObject;
          try { userObject = await client.users.fetch(ID); } catch (error) { return message.channel.send(`Error fetching user with ID ${ID}: ${error.message}`); }
          const result = await removeUserFromTeam(client, ID);
          await sendLogMessage(client, 'remove', message.author.id, ID, userObject.username);
          return message.channel.send(result === 'not_found' ? `\`${userObject.username}\` was not in team management.` : `Removed \`${userObject.username}\` from team management.`);
        } catch (error) {
          console.error(`Error while removing user ${ID}:`, error.message);
          return message.channel.send(`Could not remove user with ID \`${ID}\`. Ensure the user exists and try again.`);
        }
      }
      
      case 'list': {
        let listData = await getTeamList(client);
        if (!listData || listData.length === 0) return message.channel.send("No team members found.");

        const totalPages = Math.ceil(listData.length / 10);
        let currentPage = 0;

        const generateContent = async (page) => {
          const startIndex = page * 10;
          const endIndex = Math.min(startIndex + 10, listData.length);
          const currentMembers = listData.slice(startIndex, endIndex);
          const fetchUserPromises = currentMembers.map(async (entry, index) => {
            try {
              const user = await client.users.fetch(entry.userId);
              const addedBy = await client.users.fetch(entry.addedBy);
              const addedDate = new Date(entry.addedAt).toLocaleDateString();
              return `\`[${startIndex + index + 1}]\` | [${user.username}](https://discord.com/users/${entry.userId})\n└ Added by: ${addedBy.username} on ${addedDate}`;
            } catch (error) { return `\`[${startIndex + index + 1}]\` | ID: ${entry.userId} | User not found`; }
          });
          return (await Promise.all(fetchUserPromises)).join("\n\n");
        };

        const createControlDropdown = (totalPages) => {
          const selectMenu = new StringSelectMenuBuilder().setCustomId("control_menu").setPlaceholder("Select an action");
          if (totalPages > 1) {
            for (let i = 0; i < totalPages; i++) {
              selectMenu.addOptions(new StringSelectMenuOptionBuilder().setLabel(`Go to Page ${i + 1}`).setValue(`page_${i}`).setDescription(`View members ${i * 10 + 1}-${Math.min((i + 1) * 10, listData.length)}`).setEmoji('📄'));
            }
          }
          selectMenu.addOptions(new StringSelectMenuOptionBuilder().setLabel("Refresh List").setValue("refresh").setDescription("Reload the team member list").setEmoji('🔄'));
          selectMenu.addOptions(new StringSelectMenuOptionBuilder().setLabel("Close Menu").setValue("close").setDescription("Close this team management menu").setEmoji('❌'));
          return new ActionRowBuilder().addComponents(selectMenu);
        };

        const memberList = await generateContent(currentPage);
        const controlDropdown = createControlDropdown(totalPages);
        
        try {
          const activeMessage = await message.channel.send(v2Message({
            color: '#00ff00',
            title: `Team Management Members - Page ${currentPage + 1}/${totalPages}`,
            description: memberList,
            actionRows: [controlDropdown],
          }));

          const collector = activeMessage.createMessageComponentCollector({ filter: (i) => i.user.id === message.author.id, time: 300000, idle: 120000 });

          collector.on("collect", async (interaction) => {
            try {
              const value = interaction.values[0];
              if (value === "close") { collector.stop("user"); return; }
              if (value === "refresh") {
                const refreshedData = await getTeamList(client);
                if (!refreshedData || refreshedData.length === 0) { await interaction.update({ content: "No team members found after refresh.", components: [] }); collector.stop("no_data"); return; }
                listData = refreshedData;
                currentPage = 0;
                const newContent = await generateContent(currentPage);
                const newTotalPages = Math.ceil(listData.length / 10);
                await interaction.update(v2Message({ color: '#00ff00', title: `Team Management Members - Page 1/${newTotalPages}`, description: newContent, actionRows: [createControlDropdown(newTotalPages)] }));
              }
              if (value.startsWith("page_")) {
                currentPage = parseInt(value.split("_")[1]);
                const newContent = await generateContent(currentPage);
                await interaction.update(v2Message({ color: '#00ff00', title: `Team Management Members - Page ${currentPage + 1}/${totalPages}`, description: newContent, actionRows: [createControlDropdown(totalPages)] }));
              }
            } catch (error) {
              console.error("Error handling team list interaction:", error);
              try { if (!interaction.replied && !interaction.deferred) await interaction.reply({ content: "An error occurred. Please try again.", ephemeral: true }); } catch (e) {}
            }
          });

          collector.on("end", async (collected, reason) => {
            try {
              if (reason === "user") await activeMessage.delete().catch(() => {});
              else await activeMessage.edit({ components: [] }).catch(() => {});
            } catch (error) {}
          });
        } catch (error) { return message.channel.send("Error displaying the team list."); }
        break;
      }
      
      case 'reset': {
        const listData = await getTeamList(client);
        if (!listData || listData.length === 0) return message.channel.send(`No team members in the database.`);
        try { await TeamManagement.deleteMany({}); return message.channel.send(`Reset team management database. Removed ${listData.length} members.`); }
        catch (error) { return message.channel.send(`Failed to reset team database: ${error.message}`); }
      }
      
      default: return message.channel.send(guideMsg);
    }
  }
};