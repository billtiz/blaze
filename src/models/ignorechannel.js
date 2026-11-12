const mongoose = require('mongoose');

const ignoreChannelSchema = new mongoose.Schema({
    guildId: {
        type: String,
        required: true
    },
    channelId: {
        type: String,
        required: true
    }
}, { timestamps: true });

module.exports = mongoose.models.IgnoreChannel || mongoose.model('IgnoreChannel', ignoreChannelSchema);