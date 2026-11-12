const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    _id: {
        type: String,
        required: true
    },
    songsPlayed: {
        type: Number,
        default: 0
    },
    commandsUsed: {
        type: Number,
        default: 0
    },
    blacklisted: {
        type: Boolean,
        default: false
    },
    developer: {
        type: Boolean,
        default: false
    },
    songHistory: {
        type: Array,
        default: []
    }
}, { timestamps: true });

module.exports = mongoose.models.User || mongoose.model('User', userSchema);