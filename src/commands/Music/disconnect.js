const { v2Message, COLORS } = require('../../utils/v2');

module.exports = {
    name: 'disconnect',
    category: 'Music',
    aliases: ["dc", "leave", "quit"],
    description: 'Disconnects the bot from voice channel',
    args: false,
    usage: '',
    userPerms: [],
    cooldown: 3,
    botPerms: ['EmbedLinks'],
    owner: false,
    player: false,
    inVoiceChannel: true,
    sameVoiceChannel: true,
    execute: async (message, args, client, prefix) => {
        try {
            const player = client.manager.players.get(message.guild.id);
            
            if (!player) {
                return message.reply(v2Message({
                    color: '#ff0000',
                    description: '❌ I\'m not connected to any voice channel!',
                    thumbnailUrl: message.author.displayAvatarURL({ dynamic: true }),
                }));
            }
            
            const channelName = message.member.voice.channel.name;
            
            player.queue.clear();
            await player.destroy().catch(() => null);
            
            return message.reply(v2Message({
                color: client.ankushcolor || '#ff0000',
                description: `👋 Successfully disconnected from ${channelName}!`,
                thumbnailUrl: message.author.displayAvatarURL({ dynamic: true }),
            })).catch(e => {
                message.channel.send(v2Message({
                    color: client.ankushcolor || '#ff0000',
                    description: `👋 Successfully disconnected from ${channelName}!`,
                })).catch(console.error);
            });
        } catch (error) {
            console.error('Error in disconnect command:', error);
            
            return message.reply(v2Message({
                color: '#ff0000',
                description: '❌ An error occurred while disconnecting. Please try again.',
                thumbnailUrl: message.author.displayAvatarURL({ dynamic: true }),
            })).catch(e => {
                message.channel.send(v2Message({
                    color: '#ff0000',
                    description: '❌ An error occurred while disconnecting. Please try again.',
                })).catch(console.error);
            });
        }
    }
};