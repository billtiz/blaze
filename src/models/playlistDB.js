const mongoose = require('mongoose');

const userPlaylistSchema = new mongoose.Schema({
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
    createdOn: {
        type: Number,
        required: true
    }
});

// Compound unique index — same user can't have two playlists with the same name
userPlaylistSchema.index({ userId: 1, playlistName: 1 }, { unique: true });

const playlistSongSchema = new mongoose.Schema({
    playlistId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'UserPlaylist',
        required: true
    },
    trackURL: {
        type: String,
        required: true
    },
    trackTitle: {
        type: String,
        default: null
    },
    trackDuration: {
        type: Number,
        default: null
    },
    addedBy: {
        type: String,
        required: true
    }
});

const UserPlaylist = mongoose.models.UserPlaylist || mongoose.model('UserPlaylist', userPlaylistSchema);
const PlaylistSong = mongoose.models.PlaylistSong || mongoose.model('PlaylistSong', playlistSongSchema);

module.exports = { UserPlaylist, PlaylistSong };
