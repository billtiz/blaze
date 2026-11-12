const mongoose = require('mongoose');

const noPrefixSchema = new mongoose.Schema({
    userId: {
        type: String,
        required: true,
        unique: true
    }
});

module.exports = mongoose.models.NoPrefixes || mongoose.model('NoPrefixes', noPrefixSchema);
