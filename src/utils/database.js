// Playlist database - now uses MongoDB via Mongoose models
// SQLite has been removed. This file exists for backward compatibility.
const { UserPlaylist, PlaylistSong } = require('../models/playlistDB');

module.exports = { UserPlaylist, PlaylistSong };