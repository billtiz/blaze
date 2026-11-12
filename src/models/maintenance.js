const mongoose = require('mongoose');

const maintenanceSchema = new mongoose.Schema({
    isActive: {
        type: Boolean,
        default: false
    },
    reason: {
        type: String,
        default: null
    },
    updatedBy: {
        type: String,
        default: null
    }
});

module.exports = mongoose.models.Maintenance || mongoose.model('Maintenance', maintenanceSchema);