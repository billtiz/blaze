const mongoose = require('mongoose');

const playlistSchema = new mongoose.Schema({
    userName: {
        type: String,
        required: true
    },
    userId: {
        type: String,
        required: true
    },
    playlistName: {
        type: String,
        required: true
    },
    playlist: {
        type: Array,
        default: []
    }
});

module.exports = mongoose.models.Playlist || mongoose.model('Playlist', playlistSchema);
