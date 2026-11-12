const { v2Message, COLORS } = require("../../utils/v2");

module.exports = {
    name: "autoplay",
    aliases: ["ap"],
    category: "Music",
    description: "Toggle music autoplay",
    args: false,
    usage: "",
    userPrams: [],
    cooldown: 4,
    botPrams: ['EmbedLinks'],
    owner: false,
    player: true,
    inVoiceChannel: true,
    sameVoiceChannel: true,
    execute: async (message, args, client, prefix) => {
        const player = client.manager.players.get(message.guild.id);
        
        if (!player) {
            return message.channel.send(v2Message({
                color: client.ankushcolor,
                description: `No song/s currently playing within this guild.`,
                thumbnailUrl: message.author.displayAvatarURL({ dynamic: true }),
            }));
        }

        const autoplay = player.data.get("autoplay");
        player.data.set("autoplay", !autoplay);

        if (!autoplay) {
            // Enabling autoplay
            const currentTrack = player.queue.current;
            if (currentTrack) {
                // Store identifier (YouTube video ID) for Radio Mix URL
                const identifier = currentTrack.identifier || currentTrack.info?.identifier;
                
                player.data.set("autoplaySystem", {
                    title: currentTrack.title || currentTrack.info?.title || 'Unknown Title',
                    author: currentTrack.author || currentTrack.info?.author || 'Unknown Artist',
                    identifier: identifier,
                    requester: currentTrack.requester || message.author
                });
                player.data.set("requester", currentTrack.requester || message.author);
                console.log(`✅ Autoplay enabled for: ${currentTrack.title} by ${currentTrack.author} [ID: ${identifier}]`);
            }
        } else {
            // Disabling autoplay
            player.data.delete("autoplaySystem");
            player.data.delete("playHistory");
            player.data.delete("artistCooldown");
            console.log(`❌ Autoplay disabled`);
        }

        return message.channel.send(v2Message({
            color: client.ankushcolor,
            description: `Autoplay has been ${!autoplay ? 'enabled' : 'disabled'}`,
            thumbnailUrl: message.author.displayAvatarURL({ dynamic: true }),
        }));
    },
};