const { v2Message } = require('../../utils/v2');

module.exports = {
    name: 'forceskip',
    aliases: ['fs'],
    category: 'Music',
    description: 'To force skip the current playing song.',
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
        
        if (!player.queue.current) {
            return message.reply(v2Message({
                color: client.ankushcolor,
                description: `No song/s currently playing within this guild.`,
                thumbnailUrl: message.author.displayAvatarURL({ dynamic: true }),
            }));
        }
        
        const song = player.queue.current;
        await player.skip();
        
        const title = song.title.length > 20
            ? song.title.slice(0, 20) + "..."
            : song.title;
            
        return message.reply(v2Message({
            color: client.ankushcolor,
            description: `⏭️ Force skipped: **${title}**`,
            thumbnailUrl: message.author.displayAvatarURL({ dynamic: true }),
        }));
    },
};