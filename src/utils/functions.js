const { ActionRowBuilder, ButtonBuilder, ButtonStyle } = require("discord.js");
const { convertTime } = require("./convert");
const { KazagumoPlayer, KazagumoTrack } = require("kazagumo");
const axios = require('axios');
const config = require('../config');
const { v2Error, v2Message, COLORS } = require('./v2');

/**
 * 
 * @param {TextChannel} channel 
 * @param {String} args 
 */
async function oops(channel, args, client) {
    try {
        const m = await channel.send(v2Error(`${args}`));
        setTimeout(async () => await m.delete().catch(() => { }), 12000);
    } catch (e) {
        return console.error(e)
    }
};

/**
 * Function to handle button replies
 * @param {Message} message - The message object
 * @param {String} content - The content to reply with
 * @param {Array} buttons - Array of button objects
 */
async function buttonReply(message, content, buttons = []) {
    try {
        const actionRows = [];
        
        if (buttons.length > 0) {
            const row = new ActionRowBuilder();
            buttons.forEach(button => {
                const btn = new ButtonBuilder()
                    .setCustomId(button.customId || 'default')
                    .setLabel(button.label || 'Button')
                    .setStyle(button.style || ButtonStyle.Primary);
                
                if (button.emoji) btn.setEmoji(button.emoji);
                if (button.disabled) btn.setDisabled(button.disabled);
                
                row.addComponents(btn);
            });
            actionRows.push(row);
        }

        return await message.reply(v2Message({
            color: COLORS.GREEN,
            description: content,
            actionRows,
        }));
    } catch (error) {
        console.error('Error in buttonReply:', error);
        return null;
    }
}

/**
 * Autoplay function - uses YouTube Radio Mix approach
 * @param {KazagumoPlayer} player 
 * @param {Client} client
 * @returns {Promise<boolean>}
 */
async function autoplay(player, client) {
    try {
        const trackData = player.data.get("autoplaySystem");
        let requester = player.data.get("requester");

        if (!trackData) {
            console.log("[AUTOPLAY] No autoplay system data found");
            return false;
        }

        if (!requester) {
            requester = { id: client.user.id };
        }

        const identifier = trackData.identifier || null;
        const title = trackData.title || "unknown";
        const author = trackData.author || "";

        // Try YouTube Radio Mix URL first (most reliable)
        let res = null;
        if (identifier) {
            try {
                const autoplayUrl = `https://www.youtube.com/watch?v=${identifier}&list=RD${identifier}`;
                console.log(`[AUTOPLAY] Trying YouTube Radio Mix: ${autoplayUrl}`);
                res = await player.search(autoplayUrl, { requester: requester });
            } catch (err) {
                console.error(`[AUTOPLAY] YouTube Radio Mix search failed:`, err.message);
            }
        }

        // If YouTube Radio Mix fails, try searching by title and author
        if (!res || !res.tracks || res.tracks.length === 0) {
            try {
                const fallbackQuery = `${title} ${author}`;
                console.log(`[AUTOPLAY] Trying fallback search: ${fallbackQuery}`);
                res = await player.search(fallbackQuery, { requester: requester });
            } catch (err) {
                console.error(`[AUTOPLAY] Fallback search failed:`, err.message);
            }
        }

        // If fallback also fails, try just the author
        if (!res || !res.tracks || res.tracks.length === 0) {
            try {
                console.log(`[AUTOPLAY] Trying author search: ${author}`);
                res = await player.search(`${author} songs`, { requester: requester });
            } catch (err) {
                console.error(`[AUTOPLAY] Author search failed:`, err.message);
            }
        }

        if (res && res.tracks && res.tracks.length > 0) {
            // Filter out the current track
            const filteredTracks = res.tracks.filter(t => {
                const tId = t.identifier || t.info?.identifier;
                const tTitle = (t.title || t.info?.title || "").toLowerCase();
                return tId !== identifier && tTitle !== title.toLowerCase();
            });

            if (filteredTracks.length > 0) {
                // Pick a random track from top results
                const nextTrack = filteredTracks[Math.floor(Math.random() * Math.min(filteredTracks.length, 5))];
                
                player.queue.add(nextTrack);

                // Update autoplay data for next iteration
                const nextIdentifier = nextTrack.identifier || nextTrack.info?.identifier;
                const nextTitle = nextTrack.title || nextTrack.info?.title || 'Unknown Title';
                const nextAuthor = nextTrack.author || nextTrack.info?.author || 'Unknown Artist';

                player.data.set("autoplaySystem", {
                    title: nextTitle,
                    author: nextAuthor,
                    identifier: nextIdentifier,
                    requester: requester
                });

                if (!player.playing && !player.paused) {
                    player.play();
                }

                console.log(`✅ [AUTOPLAY] Added: ${nextTitle} by ${nextAuthor}`);
                return true;
            }
        }

        console.log("⚠️ [AUTOPLAY] No suitable tracks found after all searches");
        return false;

    } catch (error) {
        console.error("❌ [AUTOPLAY] Error:", error);
        return false;
    }
}

module.exports = {
    buttonReply,
    oops,
    autoplay
};
