const { v2Message } = require('../../utils/v2');

module.exports = {
    name: 'loop',
    category: 'Music',
    aliases: ['repeat'],
    description: 'Toggle music loop',
    args: false,
    usage: 'loop <track|queue|off>',
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

        if (!args[0]) {
            return message.reply(v2Message({
                color: client.ankushcolor,
                description: `Please specify a loop mode!\nAvailable modes: \`track\`, \`queue\`, \`off\``,
                thumbnailUrl: message.author.displayAvatarURL({ dynamic: true }),
            }));
        }

        let desc;
        if (['q', 'queue', 'all'].includes(args[0])) {
            await player.setLoop('queue');
            desc = `🔄 Loop mode set to: **Queue**`;
        } else if (['track', 't', 'song', 'current'].includes(args[0])) {
            await player.setLoop('track');
            desc = `🔂 Loop mode set to: **Track**`;
        } else if (['off', 'c', 'clear', 'reset'].includes(args[0])) {
            await player.setLoop('none');
            desc = `⭕ Loop mode: **Disabled**`;
        } else {
            desc = `Invalid loop mode! Available modes: \`track\`, \`queue\`, \`off\``;
        }

        return message.reply(v2Message({
            color: client.ankushcolor,
            description: desc,
            thumbnailUrl: message.author.displayAvatarURL({ dynamic: true }),
        }));
    }
};