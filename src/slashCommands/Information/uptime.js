const { v2Message } = require('../../utils/v2');

module.exports = {
    name: 'uptime',
    description: 'Shows how long the bot has been running',
    userPrams: [],
    botPrams: ['EMBED_LINKS'],

    run: async (client, interaction) => {
        await interaction.deferReply({ ephemeral: false });

        const days = Math.floor(client.uptime / 86400000);
        const hours = Math.floor(client.uptime / 3600000) % 24;
        const minutes = Math.floor(client.uptime / 60000) % 60;
        const seconds = Math.floor(client.uptime / 1000) % 60;

        const uptimeString = [
            days && `${days} days`,
            hours && `${hours} hours`,
            minutes && `${minutes} minutes`,
            seconds && `${seconds} seconds`
        ].filter(Boolean).join(', ');

        await interaction.editReply(
            v2Message({
                color: client.ankushcolor,
                title: 'Bot Uptime',
                description: `\`\`\`ini\n[ Uptime ] :: ${uptimeString}\`\`\``,
            })
        );
    },
};