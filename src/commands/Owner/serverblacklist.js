const blacklistedServerService = require('../../services/blacklistedServerService');
const { v2Message } = require('../../utils/v2');

module.exports = {
    name: "serverblacklist",
    aliases: ["sbl"],
    category: "Owner",
    description: "Blacklists a server from using the bot.",
    args: true,
    usage: "<serverID>",
    owner: false,
    execute: async (message, args, client, prefix) => {
        const authorizedUsers = client.config.ownerID;
        if (!authorizedUsers.includes(message.author.id)) return message.reply("You don't have permission to use this command.");
        
        const serverId = args[0];
        if (!serverId) return message.reply("Please provide a valid server ID to blacklist.");
        
        try {
            const guild = await client.guilds.fetch(serverId).catch(() => null);
            if (!guild) return message.reply("I couldn't find a server with that ID or I'm not in that server.");
            
            const isBlacklisted = await blacklistedServerService.isBlacklisted(serverId);
            if (isBlacklisted) return message.reply(`Server "${guild.name}" is already blacklisted from using the bot.`);
            
            const success = await blacklistedServerService.addToBlacklist(serverId, message.author.id);
            if (!success) return message.reply("An error occurred while adding the server to the blacklist.");
            
            message.reply(v2Message({
                color: '#00ff00',
                title: 'Server Blacklisted',
                description: `Server "${guild.name}" (${serverId}) has been blacklisted from using the bot.`,
                fields: [
                    { name: 'Server Name', value: guild.name },
                    { name: 'Server ID', value: serverId }
                ],
                footer: `Blacklisted by ${message.author.username}`,
            }));
            
            if (guild) await guild.leave();
        } catch (error) {
            console.error("Error in serverblacklist command:", error);
            message.reply("An error occurred while processing the command.");
        }
    }
};