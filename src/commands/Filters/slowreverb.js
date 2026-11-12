const { v2Message } = require('../../utils/v2');

module.exports = {
    name: 'slowreverb',
    category: 'Filters',
    aliases: ['sr', 'slowedreverb'],
    cooldown: 5,
    description: 'Toggle slow reverb filter for the current song',
    args: false,
    usage: '',
    userPrams: [],
    botPrams: ['EmbedLinks'],
    owner: false,
    player: true,
    inVoiceChannel: true,
    sameVoiceChannel: true,
    execute: async (message, args, client, prefix) => {
        try {
            if (!client.manager) {
                return message.channel.send(v2Message({ color: client.ankushcolor, description: 'Music system is not properly initialized.' }));
            }

            const player = client.manager.players.get(message.guild.id);
            
            if (!player) {
                return message.channel.send(v2Message({
                    color: client.ankushcolor,
                    description: `No song/s currently playing within this guild.`,
                    thumbnailUrl: message.author.displayAvatarURL({ dynamic: true }),
                }));
            }

            try {
                if (player.slowreverb) {
                    await player.setSlowreverb(false);
                    return message.reply(v2Message({ color: client.ankushcolor, description: '🎵 Slow Reverb Filter has been: `Disabled`', thumbnailUrl: message.author.displayAvatarURL({ dynamic: true }) }));
                } else {
                    await player.setSlowreverb(true);
                    return message.reply(v2Message({ color: client.ankushcolor, description: '🎵 Slow Reverb Filter has been: `Enabled`', thumbnailUrl: message.author.displayAvatarURL({ dynamic: true }) }));
                }
            } catch (filterError) {
                console.error('Filter Error:', filterError);
                return message.reply(v2Message({ color: client.ankushcolor, description: '❌ Failed to toggle slow reverb filter. Please try again.' }));
            }
        } catch (error) {
            console.error('Command Error:', error);
            return message.channel.send(v2Message({ color: client.ankushcolor, description: 'An error occurred while executing the command.' }));
        }
    }
};