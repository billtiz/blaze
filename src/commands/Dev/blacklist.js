const { ActionRowBuilder, StringSelectMenuBuilder } = require("discord.js");
const BlacklistModel = require('../../models/blacklist');
const { v2Message } = require('../../utils/v2');


async function resolveUser(message, arg, client) {
    if (!arg) return null;
    const mentionedUser = message.mentions.members?.first();
    if (mentionedUser) return mentionedUser;
    if (message.guild) {
        try {
            const userFromGuild = message.guild.members.cache.get(arg);
            if (userFromGuild) return userFromGuild;
            try { const fetchedMember = await message.guild.members.fetch(arg); if (fetchedMember) return fetchedMember; } catch (e) {}
        } catch (e) {}
    }
    try { const user = await client.users.fetch(arg); if (user) return { id: user.id, user: user }; } catch (e) {}
    return null;
}

function createPaginationDropdown(totalPages) {
    const options = [];
    for (let i = 0; i < totalPages; i++) {
        options.push({ label: `Page ${i + 1}`, description: `Go to page ${i + 1}`, value: `page_${i}` });
    }
    options.push({ label: 'Close', description: 'Close this menu', value: 'close' });
    return new ActionRowBuilder().addComponents(
        new StringSelectMenuBuilder().setCustomId('pagination').setPlaceholder('Select a page').addOptions(options)
    );
}

module.exports = {
    name: 'blacklist',
    category: 'Dev',
    aliases: ['bl'],
    description: 'Manage blacklisted users',
    usage: '<add/remove/show/reset> [@user|userID]',
    userPerms: [],
    botPerms: ['EmbedLinks'],
    owner: false,
    guildOnly: false,

    execute: async (message, args, client) => {
        if (!client.config.ownerID.includes(message.author.id)) {
            return message.reply("You don't have permission to use this command.");
        }

        const subcommand = args[0]?.toLowerCase();

        if (!subcommand) {
            return message.channel.send(v2Message({
                color: '#00ff00',
                title: 'Blacklist Command Help',
                description: [
                    '`blacklist add <@user|userID>` - Add a user to blacklist',
                    '`blacklist remove <@user|userID>` - Remove a user from blacklist',
                    '`blacklist show` - Display all blacklisted users',
                    '`blacklist reset` - Clear the entire blacklist (restricted permission)'
                ].join('\n'),
                thumbnailUrl: message.author.displayAvatarURL({ dynamic: true }),
            }));
        }

        try {
            switch (subcommand) {
                case 'add': {
                    const targetUser = await resolveUser(message, args[1], client);
                    if (!targetUser) return message.reply('Please mention a user or provide a valid user ID.');
                    let existing = await BlacklistModel.findOne({ userId: targetUser.id });
                    let created = false;
                    if (!existing) { await BlacklistModel.create({ userId: targetUser.id }); created = true; }
                    const username = targetUser.user?.username || targetUser.username || targetUser.id;
                    return message.reply(v2Message({ color: '#00ff00', description: `${username} has been ${created ? 'added to' : 'already in'} the blacklist.` }));
                }

                case 'remove': {
                    const targetUser = await resolveUser(message, args[1], client);
                    if (!targetUser) return message.reply('Please mention a user or provide a valid user ID.');
                    const deletedResult = await BlacklistModel.deleteOne({ userId: targetUser.id });
                    const username = targetUser.user?.username || targetUser.username || targetUser.id;
                    return message.reply(v2Message({ color: '#00ff00', description: `${username} has been ${deletedResult.deletedCount > 0 ? 'removed from' : 'not found in'} the blacklist.` }));
                }

                case 'show': {
                    const blacklistedUsers = await BlacklistModel.find();
                    if (!blacklistedUsers.length) return message.reply('No users are currently blacklisted.');

                    let currentPage = 0;
                    const itemsPerPage = 10;
                    const totalPages = Math.ceil(blacklistedUsers.length / itemsPerPage);

                    const generatePageContent = async (page) => {
                        const start = page * itemsPerPage;
                        const end = Math.min(start + itemsPerPage, blacklistedUsers.length);
                        const users = blacklistedUsers.slice(start, end);
                        const userList = await Promise.all(users.map(async (entry, index) => {
                            try { const user = await client.users.fetch(entry.userId); return `\`${start + index + 1}.\` ${user.tag || user.username} (ID: ${user.id})`; }
                            catch { return `\`${start + index + 1}.\` Unknown User (ID: ${entry.userId})`; }
                        }));
                        return v2Message({ color: '#ff0000', title: `Blacklisted Users (Page ${page + 1}/${totalPages})`, description: userList.join('\n'), actionRows: [createPaginationDropdown(totalPages)] });
                    };

                    const msgPayload = await generatePageContent(currentPage);
                    const msg = await message.channel.send(msgPayload);

                    const collector = msg.createMessageComponentCollector({ filter: (i) => i.user.id === message.author.id, time: 300000 });
                    collector.on('collect', async (interaction) => {
                        const selectedValue = interaction.values[0];
                        if (selectedValue === 'close') { await msg.delete().catch(() => {}); return; }
                        currentPage = parseInt(selectedValue.split('_')[1]);
                        const newPayload = await generatePageContent(currentPage);
                        await interaction.update(newPayload).catch(() => {});
                    });
                    collector.on('end', () => { msg.edit({ components: [] }).catch(() => {}); });
                    break;
                }

                case 'reset': {
                    if (!client.config.ownerID.includes(message.author.id)) return message.reply("You don't have permission to reset the blacklist.");
                    const count = await BlacklistModel.countDocuments();
                    if (count === 0) return message.reply('The blacklist is already empty.');
                    await BlacklistModel.deleteMany({});
                    return message.reply(`Successfully cleared the blacklist (removed ${count} users).`);
                }

                default:
                    return message.channel.send(v2Message({
                        color: '#00ff00', title: 'Blacklist Command Help',
                        description: '`blacklist add <@user|userID>` - Add a user to blacklist\n`blacklist remove <@user|userID>` - Remove a user from blacklist\n`blacklist show` - Display all blacklisted users\n`blacklist reset` - Clear the entire blacklist',
                        thumbnailUrl: message.author.displayAvatarURL({ dynamic: true }),
                    }));
            }
        } catch (error) {
            console.error('Blacklist command error:', error);
            return message.reply('An error occurred while processing the command.');
        }
    }
};