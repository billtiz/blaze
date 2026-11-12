const mongoose = require('mongoose');

const voteBypassSchema = new mongoose.Schema({
    userId: {
        type: String,
        required: true
    },
    guildId: {
        type: String,
        default: null
    },
    addedBy: {
        type: String,
        required: true
    },
    reason: {
        type: String,
        default: null
    },
    permanent: {
        type: Boolean,
        default: true
    },
    expiresAt: {
        type: Date,
        default: null
    }
}, { timestamps: true });

voteBypassSchema.index({ userId: 1, guildId: 1 }, { unique: true });

module.exports = mongoose.models.VoteBypass || mongoose.model('VoteBypass', voteBypassSchema);