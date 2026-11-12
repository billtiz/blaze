const { v2Message } = require('../../utils/v2');

module.exports = {
    name: "dm",
    category: "Dev",
    description: "Sends a direct message to a specified user and deletes the command message",
    args: true,
    usage: "<user_mention/user_id> <message>",
    userPerms: [],
    owner: false,
    execute: async (message, args, client) => {
        const ownerIds = client.config.ownerID;
        if (!ownerIds.includes(message.author.id)) return;

        let userId = args[0];
        if (message.mentions.users.size > 0) {
            userId = message.mentions.users.first().id;
        } else {
            userId = userId.replace(/[<@!>]/g, '');
        }

        const dmMessage = args.slice(1).join(" ");

        if (!userId || !dmMessage) {
            return message.reply(v2Message({ color: '#ff0000', description: 'Please provide a valid user mention or ID and message.' }));
        }

        const targetUser = await client.users.fetch(userId).catch(() => null);
        if (!targetUser) {
            return message.reply(v2Message({ color: '#ff0000', description: 'Could not find a user with that mention/ID.' }));
        }

        try {
            await targetUser.send(dmMessage);
            await message.reply(v2Message({ color: '#00ff00', description: `Successfully sent a DM to ${targetUser.tag}` }));
            
            if (message.channel.type !== 'DM') {
                try {
                    await message.delete();
                } catch (deleteError) {
                    console.error("Failed to delete message:", deleteError);
                    message.channel.send(v2Message({ color: '#ff9900', description: "Note: I couldn't delete your message. Make sure the bot has the 'Manage Messages' permission." })).then(msg => {
                        setTimeout(() => msg.delete().catch(() => {}), 5000);
                    });
                }
            }
        } catch (error) {
            message.reply(v2Message({ color: '#ff0000', description: "Failed to send the DM. The user might have DMs disabled or has blocked the bot." }));
        }
    },
};