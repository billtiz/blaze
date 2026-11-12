const { initializeDatabase } = require('./connect');
const Prefix = require('../models/prefix');
const AutoReconnect = require('../models/autoreconnect');
const Blacklist = require('../models/blacklist');
const IgnoreChannel = require('../models/ignorechannel');
const Maintenance = require('../models/maintenance');
const NoPrefixes = require('../models/noprefix');
const Playlist = require('../models/playlist');
const TeamManagement = require('../models/team');
const VoteBypass = require('../models/votebypass');
const User = require('../schema/User');

module.exports = {
    initializeDatabase,
    Prefix,
    AutoReconnect,
    Blacklist,
    IgnoreChannel,
    Maintenance,
    NoPrefixes,
    Playlist,
    TeamManagement,
    VoteBypass,
    User
};