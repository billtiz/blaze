const { ActivityType } = require("discord.js");
const NoPrefixes = require('../../models/noprefix');

// Add this global variable (needs to be accessible from both files)
global.isReady = false;

module.exports = {
    name: "ready",
    run: async (client) => {
        const Logger = client.logger;

        Logger.section("BOT ONLINE");
        Logger.stats({
            "Bot": client.user.username,
            "Servers": client.guilds.cache.size,
            "Users": client.guilds.cache.reduce((a, g) => a + g.memberCount, 0),
            "Commands": client.commands.size,
            "Slash Cmds": client.slashCommands.size,
            "Prefix": client.prefix,
        });
        Logger.success(`${client.user.username} is now online`);
        Logger.sectionEnd();
        
        let statuses = [`${client.prefix}help`, `${client.prefix}play`];
        setInterval(() => {
            let status = statuses[Math.floor(Math.random() * statuses.length)];
            client.user.setPresence({
                activities: [{ name: status, type: ActivityType.Listening }],
                status: "dnd"
            });
        }, 5000);
        
        // Booster checking logic
        const supportGuild = client.guilds.cache.get("1221909487472869619");
        if (!supportGuild) return Logger.log("Support guild not found", "warn");
        const role = supportGuild.roles.premiumSubscriberRole;
        if (!role) return Logger.log("Premium subscriber role not found", "warn");
        
        try {
            await supportGuild.members.fetch();
            const boosters = supportGuild.members.cache.filter(member => member.roles.cache.has(role.id));
            Logger.log(`Found ${boosters.size} boosters`, "log");
            
            for (const booster of boosters.values()) {
                const existing = await NoPrefixes.findOne({ where: { userId: booster.id } });
                if (!existing) {
                    await NoPrefixes.create({ userId: booster.id });
                    Logger.log(`NoPrefix → ${booster.user.tag}`, "event");
                    await client.channels.cache.get("1364788828514287646")?.send(
                        `✅ Auto NoPrefix Added to \`${booster.user.tag}\` for \`Already Boosting The Server\``
                    );
                }
            }
        } catch (error) {
            Logger.log(`Booster check failed: ${error.message}`, "error");
        }
        
        // Add delay before enabling guild leave tracking
        setTimeout(() => {
            global.isReady = true;
            Logger.log("Tracking guild events", "ready");
        }, 10000);
    }
};