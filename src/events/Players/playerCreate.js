const { WebhookClient } = require("discord.js");
const { KazagumoPlayer } = require("kazagumo")
const { webhookMessage } = require("../../utils/v2");

module.exports = {
    name: "playerCreate",

    /**
	 * 
	 * @param {Client} client 
	 * @param {KazagumoPlayer} player 
	 */

    run: async (client, player) => {
        
        let name = client.guilds.cache.get(player.guildId).name;

        const webhookUrl = client.config?.webhooks?.playerStartLog;
        if (webhookUrl) {
            const web1 = new WebhookClient({ url: webhookUrl });
            web1.send(webhookMessage({
                color: client.ankushcolor,
                title: 'Player Started',
                description: `**Server Name:** ${name}\n**Server Id:** ${player.guildId}`,
            })).catch(console.error);
        }

        client.logger.log(`Player Create in ${name} [ ${player.guildId} ]`, "log");
    }
};
