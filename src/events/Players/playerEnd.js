const { autoplay } = require('../../utils/functions');
const { v2Error } = require('../../utils/v2');

module.exports = {
	name: "playerEnd",
	run: async (client, player) => {
		
		if (player.data.get("message") && player.data.get("message").deletable) {
			player.data.get("message").delete().catch(() => null);
		}
		
		let guild = client.guilds.cache.get(player.guildId);
		if (!guild) return;

		// Check if autoplay is enabled and queue is empty
		const autoplayEnabled = player.data.get("autoplay");
		
		if (autoplayEnabled && player.queue.size === 0) {
			try {
				console.log("🎵 [AUTOPLAY] Queue empty, searching for related songs...");
				const result = await autoplay(player, client);
				
				if (!result) {
					console.log("⚠️ [AUTOPLAY] Could not find songs, will retry on next track end");
				}
			} catch (error) {
				console.error("❌ [AUTOPLAY] Failed:", error);
				
				const channel = guild.channels.cache.get(player.textId);
				if (channel) {
					channel.send(v2Error("❌ Autoplay encountered an error. Trying again...")).catch(() => null);
				}
			}
		}
	}
};
