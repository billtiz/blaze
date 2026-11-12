const { WebhookClient } = require("discord.js");
const db2 = require("../../models/autoreconnect");
const { webhookMessage } = require('../../utils/v2');

module.exports = {
    name: "playerDestroy",
    run: async (client, player) => {
        try {
            let guild = client.guilds.cache.get(player.guildId);
            let name = guild ? guild.name : player.guildId;
            
            const webhookUrl = client.config?.webhooks?.playerDestroyLog;
            if (webhookUrl) {
                const web1 = new WebhookClient({ url: webhookUrl });
                const payload = webhookMessage({
                    color: client.ankushcolor,
                    title: 'Player Destroy',
                    description: `**Server Name:** ${name}\n**Server Id:** ${player.guildId}`,
                });
                web1.send(payload).catch(console.error);
            }
        
            client.logger.log(`Player Destroy in ${name} [ ${player.guildId} ]`, "log");

            if (player.data.get('message') && player.data.get('message').deletable) {
                player.data.get('message').delete().catch(() => null);
            }

            if (player.data.get("autoplay")) {
                try {
                    player.data.delete("autoplay");
                    player.data.delete("autoplaySystem");
                    player.data.delete("playHistory");
                    player.data.delete("artistCooldown");
                    player.data.delete("requester");
                } catch (err) { client.logger.log(err.stack ? err.stack : err, "log") };
            }
        } catch (error) {
            console.error('Error in playerDestroy event:', error);
        }
    }
};
