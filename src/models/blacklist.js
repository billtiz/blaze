const mongoose = require('mongoose');

const blacklistSchema = new mongoose.Schema({
    userId: {
        type: String,
        required: true,
        unique: true
    }
});

module.exports = mongoose.models.Blacklist || mongoose.model('Blacklist', blacklistSchema);