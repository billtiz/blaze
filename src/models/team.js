const mongoose = require('mongoose');

const teamSchema = new mongoose.Schema({
    userId: {
        type: String,
        required: true,
        unique: true
    },
    addedBy: {
        type: String,
        required: true
    },
    addedAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.models.TeamManagement || mongoose.model('TeamManagement', teamSchema);