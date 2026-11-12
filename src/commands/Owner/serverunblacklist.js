const blacklistedServerService = require('../../services/blacklistedServerService');
const { v2Message } = require('../../utils/v2');

module.exports = {
    name: "serverunblacklist",
    aliases: ["subl"],
    category: "Owner",
    description: "Removes a server from the blacklist.",
    args: true,
    usage: "<serverID>",
    owner: false,
    execute: async (message, args, client, prefix) => {
        const authorizedUsers = client.config.ownerID;
        if (!authorizedUsers.includes(message.author.id)) return message.reply("You don't have permission to use this command.");
        
        const serverId = args[0];
        if (!serverId) return message.reply("Please provide a valid server ID to unblacklist.");
        
        try {
            const isBlacklisted = await blacklistedServerService.isBlacklisted(serverId);
            if (!isBlacklisted) return message.reply(`Server ID ${serverId} is not blacklisted.`);
            
            const success = await blacklistedServerService.removeFromBlacklist(serverId);
            if (!success) return message.reply("An error occurred while removing the server from the blacklist.");
            
            message.reply(v2Message({
                color: '#00ff00',
                title: 'Server Unblacklisted',
                description: `Server ID ${serverId} has been removed from the blacklist.`,
                fields: [{ name: 'Server ID', value: serverId }],
                footer: `Unblacklisted by ${message.author.username}`,
            }));
        } catch (error) {
            console.error("Error in serverunblacklist command:", error);
            message.reply("An error occurred while processing the command.");
        }
    }
};