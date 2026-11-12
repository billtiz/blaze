const blacklistedServerService = require('../../services/blacklistedServerService');
const { v2Message } = require('../../utils/v2');

module.exports = {
    name: "blacklistedservers",
    aliases: ["bls"],
    category: "Owner",
    description: "Shows all blacklisted servers.",
    args: false,
    usage: "",
    owner: false,
    execute: async (message, args, client, prefix) => {
        const authorizedUsers = client.config.ownerID;
        if (!authorizedUsers.includes(message.author.id)) return message.reply("You don't have permission to use this command.");
        
        try {
            const blacklistedServers = await blacklistedServerService.getAllBlacklistedServers();
            if (blacklistedServers.length === 0) return message.reply("There are no blacklisted servers.");
            
            let desc = `Total blacklisted servers: ${blacklistedServers.length}\n\n`;
            for (const server of blacklistedServers) {
                const blacklistedAt = new Date(server.blacklisted_at).toLocaleString();
                desc += `**Server ID:** ${server.server_id}\nBlacklisted by: <@${server.blacklisted_by}> | At: ${blacklistedAt}\n\n`;
            }
            
            message.reply(v2Message({ color: client.embedColor || client.ankushcolor, title: 'Blacklisted Servers', description: desc }));
        } catch (error) {
            console.error("Error in blacklistedservers command:", error);
            message.reply("An error occurred while fetching the blacklisted servers.");
        }
    }
};