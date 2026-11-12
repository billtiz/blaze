const mongoose = require('mongoose');
const config = require('../config');

async function initializeDatabase() {
    try {
        await mongoose.connect(config.mongourl);
        console.log('[ DATABASE ] Successfully connected to MongoDB!');
    } catch (error) {
        console.error('[ DATABASE ] Error connecting to MongoDB:', error);
        process.exit(1);
    }
}

module.exports = { initializeDatabase };
