const { StringSelectMenuBuilder, ActionRowBuilder } = require("discord.js");
const load = require('lodash');
const { v2Message } = require('../../utils/v2');

module.exports = {
    name: "serverlist",
    category: "Owner",
    aliases: ["slist"],
    description: "",
    args: false,
    usage: "<string>",
    permission: [],
    owner: true,
    execute: async (message, args, client, prefix) => {
        const serverlist = client.guilds.cache.map((guild, i) => `**\`\`\`Server Name: "${guild.name}"\nGuild ID: "${guild.id}"\nMember Count: "${guild.memberCount}"\`\`\`**`);
        const mapping = load.chunk(serverlist, 10);
        const pages = mapping.map((s) => s.join("\n"));
        let page = 0;

        if (client.guilds.cache.size <= 10) {
            return await message.channel.send(v2Message({
                color: client.ankushcolor,
                title: `${message.client.user.username} Server List [${client.guilds.cache.size}]`,
                description: pages[page],
                footer: `Page ${page + 1}/${pages.length}`,
            }));
        } else {
            const totalPages = pages.length;
            const pageOptions = [];
            for (let i = 0; i < Math.min(totalPages, 25); i++) {
                pageOptions.push({ label: `Page ${i + 1}`, description: `Jump to page ${i + 1}`, value: i.toString() });
            }
            
            const pageDropdown = new StringSelectMenuBuilder()
                .setCustomId('server_list_page_select')
                .setPlaceholder(`Jump to page (1-${Math.min(totalPages, 25)})`)
                .addOptions(pageOptions);
            
            let groupDropdown = null;
            if (totalPages > 25) {
                const jumpGroups = Math.ceil(totalPages / 25);
                const groupOptions = [];
                for (let i = 0; i < jumpGroups; i++) {
                    const groupStart = i * 25 + 1;
                    const groupEnd = Math.min((i + 1) * 25, totalPages);
                    groupOptions.push({ label: `Group ${i + 1}`, description: `Pages ${groupStart}-${groupEnd}`, value: i.toString() });
                }
                groupDropdown = new StringSelectMenuBuilder()
                    .setCustomId('server_list_group_select')
                    .setPlaceholder(`Select page group (total: ${jumpGroups} groups)`)
                    .addOptions(groupOptions);
            }

            const controlDropdown = new StringSelectMenuBuilder()
                .setCustomId('server_list_control')
                .setPlaceholder('Control Menu')
                .addOptions([{ label: "Close Menu", description: "Close the server list navigation", value: "close" }]);

            const components = [new ActionRowBuilder().addComponents([pageDropdown])];
            if (groupDropdown) components.push(new ActionRowBuilder().addComponents([groupDropdown]));
            components.push(new ActionRowBuilder().addComponents([controlDropdown]));

            const msg = await message.channel.send(v2Message({
                color: client.ankushcolor,
                title: `${message.client.user.username} Server List [${client.guilds.cache.size}]`,
                description: pages[page],
                footer: `Page ${page + 1}/${pages.length}`,
                actionRows: components,
            }));

            const collector = message.channel.createMessageComponentCollector({
                filter: (i) => {
                    if (i.user.id === message.author.id) return true;
                    else { i.reply({ ephemeral: true, content: `Only **${message.author.tag}** can use this menu.` }); return false; }
                },
                time: 60000 * 5, idle: 60000 * 2
            });

            collector.on("collect", async (interaction) => {
                await interaction.deferUpdate().catch(() => {});
                let currentGroup = Math.floor(page / 25);

                if (interaction.customId === "server_list_page_select") {
                    page = parseInt(interaction.values[0]);
                } else if (interaction.customId === "server_list_group_select") {
                    page = parseInt(interaction.values[0]) * 25;
                } else if (interaction.customId === "server_list_control") {
                    if (interaction.values[0] === "close") { collector.stop(); return; }
                }

                const newGroup = Math.floor(page / 25);
                if (newGroup !== currentGroup) {
                    const newStartPage = newGroup * 25;
                    const newEndPage = Math.min(newStartPage + 25, totalPages);
                    const newPageOptions = [];
                    for (let i = newStartPage; i < newEndPage; i++) {
                        newPageOptions.push({ label: `Page ${i + 1}`, description: `Jump to page ${i + 1}`, value: i.toString() });
                    }
                    pageDropdown.setOptions(newPageOptions);
                    pageDropdown.setPlaceholder(`Jump to page (${newStartPage + 1}-${newEndPage})`);
                }

                const newComponents = [new ActionRowBuilder().addComponents([pageDropdown])];
                if (groupDropdown) newComponents.push(new ActionRowBuilder().addComponents([groupDropdown]));
                newComponents.push(new ActionRowBuilder().addComponents([controlDropdown]));

                await msg.edit(v2Message({
                    color: client.ankushcolor,
                    title: `${message.client.user.username} Server List [${client.guilds.cache.size}]`,
                    description: pages[page],
                    footer: `Page ${page + 1}/${pages.length}`,
                    actionRows: newComponents,
                }));
            });

            collector.on("end", async () => { await msg.edit({ components: [] }); });
        }
    }
}