const { v2Message, COLORS } = require("../../utils/v2");

module.exports = {
    name: 'clearqueue',
    aliases: ['clearq', 'cq'],
    category: 'Music',
    description: 'Clear Music Queue',
    args: false,
    usage: '',
    userPrams: [],
    cooldown: 5,
    botPrams: ['EmbedLinks'],
    owner: false,
    player: true,
    inVoiceChannel: true,
    sameVoiceChannel: true,
    execute: async (message, args, client, prefix) => {
        const player = client.manager.players.get(message.guild.id);
        
        if (!player.queue) {
            return message.reply(v2Message({
                color: client.ankushcolor,
                description: `No song/s currently playing within this guild.`,
                thumbnailUrl: message.author.displayAvatarURL({ dynamic: true }),
            }));
        }
        
        if (!player.queue[0]) {
            return message.reply(v2Message({
                color: client.ankushcolor,
                description: `Queue is already empty!`,
                thumbnailUrl: message.author.displayAvatarURL({ dynamic: true }),
            }));
        }
        
        await player.queue.clear();
        
        return message.reply(v2Message({
            color: client.ankushcolor,
            description: `Queue has been cleared!`,
            thumbnailUrl: message.author.displayAvatarURL({ dynamic: true }),
        }));
    }
};