const { v2Message } = require('../../utils/v2');

module.exports = {
    name: 'dance',
    category: 'Filters',
    cooldown: 5,
    description: 'Toggle dance filter for the current song',
    args: false,
    usage: '',
    userPrams: [],
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

        if (player.dance) {
            player.setDance(false);
            return message.reply(v2Message({
                color: client.ankushcolor,
                description: '🎵 Dance Filter has been: `Disabled`',
                thumbnailUrl: message.author.displayAvatarURL({ dynamic: true }),
            }));
        } else {
            player.setDance(true);
            return message.reply(v2Message({
                color: client.ankushcolor,
                description: '🎵 Dance Filter has been: `Enabled`',
                thumbnailUrl: message.author.displayAvatarURL({ dynamic: true }),
            }));
        }
    }
};