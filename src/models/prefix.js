const mongoose = require('mongoose');

const prefixSchema = new mongoose.Schema({
    id: {
        type: String,
        required: true,
        unique: true
    },
    prefix: {
        type: String,
        required: true
    },
    oldPrefix: {
        type: String,
        default: '!!'
    }
});

module.exports = mongoose.models.Prefix || mongoose.model('Prefix', prefixSchema);
