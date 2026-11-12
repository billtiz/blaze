const mongoose = require('mongoose');

const blacklistedServerSchema = new mongoose.Schema({
    serverId: { type: String, required: true, unique: true },
    blacklistedBy: { type: String, required: true },
    addedAt: { type: Date, default: Date.now }
});

const BlacklistedServer = mongoose.models.BlacklistedServer || mongoose.model('BlacklistedServer', blacklistedServerSchema);

class BlacklistedServerService {
  /**
   * Check if a server is blacklisted
   * @param {string} serverId - The Discord server ID
   * @returns {Promise<boolean>} - True if server is blacklisted
   */
  async isBlacklisted(serverId) {
    try {
      const server = await BlacklistedServer.findOne({ serverId });
      return !!server;
    } catch (error) {
      console.error('Error checking blacklist:', error);
      return false;
    }
  }

  /**
   * Add a server to the blacklist
   * @param {string} serverId - The Discord server ID
   * @param {string} blacklistedBy - The user ID who blacklisted the server
   * @returns {Promise<boolean>} - True if successful
   */
  async addToBlacklist(serverId, blacklistedBy) {
    try {
      await BlacklistedServer.updateOne(
        { serverId },
        { serverId, blacklistedBy, addedAt: new Date() },
        { upsert: true }
      );
      return true;
    } catch (error) {
      console.error('Error adding server to blacklist:', error);
      return false;
    }
  }

  /**
   * Remove a server from the blacklist
   * @param {string} serverId - The Discord server ID
   * @returns {Promise<boolean>} - True if successful
   */
  async removeFromBlacklist(serverId) {
    try {
      await BlacklistedServer.deleteOne({ serverId });
      return true;
    } catch (error) {
      console.error('Error removing server from blacklist:', error);
      return false;
    }
  }

  /**
   * Get all blacklisted servers
   * @returns {Promise<Array>} - Array of blacklisted servers
   */
  async getAllBlacklistedServers() {
    try {
      return await BlacklistedServer.find();
    } catch (error) {
      console.error('Error getting blacklisted servers:', error);
      return [];
    }
  }
}

module.exports = new BlacklistedServerService();