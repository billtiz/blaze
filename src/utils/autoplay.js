// This file is deprecated - autoplay logic is now in utils/functions.js
// Kept for backward compatibility, re-exports from functions.js
const { autoplay } = require('./functions');

module.exports = {
    VibesAutoplay: async function(client, player) {
        return autoplay(player, client);
    }
}