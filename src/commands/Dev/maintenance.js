const Maintenance = require('../../models/maintenance');
const { v2Message } = require('../../utils/v2');

module.exports = {
    name: 'maintenance',
    category: 'Dev',
    aliases: ["mt"],
    description: 'Toggle maintenance mode for the bot.',
    usage: '[on/off] [reason]',
    args: true,
    async execute(message, args, client) {
        const allowedUsers = client.config.ownerID;

        if (!allowedUsers.includes(message.author.id)) {
            return message.reply(v2Message({ color: '#ff0000', title: 'Unauthorized', description: 'You do not have permission to use this command.' }));
        }

        const action = args[0].toLowerCase();
        const reason = args.slice(1).join(' ') || 'No reason provided';

        if (action !== 'on' && action !== 'off') {
            return message.reply(v2Message({ color: '#ff0000', title: 'Invalid Action', description: 'Please specify `on` or `off` to toggle maintenance mode.' }));
        }

        let maintenance = await Maintenance.findOne();
        if (!maintenance) {
            maintenance = await Maintenance.create({ isActive: false, reason: null, updatedBy: null });
        }

        if (action === 'on') {
            if (maintenance.isActive) {
                return message.reply(v2Message({ color: '#ff0000', title: 'Maintenance Already Active', description: 'The bot is already in maintenance mode.' }));
            }
            maintenance.isActive = true;
            maintenance.reason = reason;
            maintenance.updatedBy = message.author.id;
            await maintenance.save();
            return message.reply(v2Message({ color: '#ffaa00', title: 'Maintenance Mode Enabled', description: `Maintenance mode has been enabled.\n**Reason:** ${reason}` }));
        } else {
            if (!maintenance.isActive) {
                return message.reply(v2Message({ color: '#ff0000', title: 'Maintenance Not Active', description: 'The bot is not in maintenance mode.' }));
            }
            maintenance.isActive = false;
            maintenance.reason = null;
            maintenance.updatedBy = message.author.id;
            await maintenance.save();
            return message.reply(v2Message({ color: '#00ff00', title: 'Maintenance Mode Disabled', description: 'Maintenance mode has been disabled.' }));
        }
    }
};