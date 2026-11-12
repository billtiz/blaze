const { Client, VoiceState } = require("discord.js");
const { KazagumoPlayer } = require("kazagumo");
const reconnect = require("../../models/autoreconnect");
const delay = require("delay");
const { REST } = require("@discordjs/rest");
const { v2Message, COLORS } = require('../../utils/v2');

/** 
 * @param {Client} client
 * @param {VoiceState} oldState
 * @param {VoiceState} newState
 * @param {KazagumoPlayer} player
 * @returns {Promise<void>}
 */
module.exports = {
    name: "voiceStateUpdate",
    run: async (client, oldState, newState) => {
        let guildId = newState.guild.id;
        const player = client.manager.players.get(guildId);
        const reconnectAuto = await reconnect.findOne({ Guild: newState.guild.id });

        // Return if no player or auto reconnect is enabled
        if (!player) return;
        if (reconnectAuto) return;

        // Check if bot is not in voice channel
        if (!newState.guild.members.cache.get(client.user.id).voice.channelId) {
            if (reconnectAuto) return;
            const text = player?.textId;

            // Destroy the player
            await player.destroy(player.guildId).catch(() => null);

            // Create and send disconnect message
            const payload = v2Message({
                color: COLORS.RED,
                title: 'Voice Channel Disconnected',
                description: '❌ I have been disconnected from the voice channel.',
                footer: 'The music queue has been cleared.',
            });

            // Send message and delete after 5 seconds
            const channel = client.channels.cache.get(text);
            if (channel) {
                channel.send(payload)
                    .then(msg => {
                        setTimeout(() => {
                            msg.delete().catch(() => {});
                        }, 5000);
                    })
                    .catch(() => null);
            }
        }
    }
};