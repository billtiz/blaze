const { PermissionFlagsBits } = require("discord.js");
const { v2Message } = require('../../utils/v2');

module.exports = {
    name: 'connect',
    aliases: ["join", "j"],
    category: 'Music',
    description: 'Join a voice channel',
    args: false,
    usage: '',
    cooldown: 3,
    userPerms: [],
    botPerms: ['Connect', 'Speak', 'EmbedLinks'],
    owner: false,
    player: false,
    inVoiceChannel: true,
    sameVoiceChannel: false,
    execute: async (message, args, client, prefix) => {
        try {
            const { channel } = message.member.voice;
            
            if (!channel) {
                return sendErrorEmbed(message, client, "You need to be in a voice channel to use this command!");
            }

            if (message.guild.members.me.voice.channel) {
                if (message.guild.members.me.voice.channelId === channel.id) {
                    return sendEmbed(message, client, "I'm already in your voice channel!");
                } else {
                    return sendErrorEmbed(message, client, `I'm already connected to <#${message.guild.members.me.voice.channelId}>!`);
                }
            }

            const permissions = channel.permissionsFor(message.guild.members.me);
            if (!permissions.has(PermissionFlagsBits.Connect) || !permissions.has(PermissionFlagsBits.Speak)) {
                return sendErrorEmbed(message, client, "I don't have permission to join or speak in your voice channel!");
            }

            if (channel.full && !permissions.has(PermissionFlagsBits.MoveMembers)) {
                return sendErrorEmbed(message, client, "Your voice channel is full! I can't join unless I have permission to move members.");
            }
            
            if (!client.manager) {
                return sendErrorEmbed(message, client, "Music system is not initialized.");
            }
            
            try {
                const existingPlayer = client.manager.players.get(message.guild.id);
                
                if (existingPlayer) {
                    if (existingPlayer.voiceId !== channel.id) {
                        await existingPlayer.destroy().catch(() => null);
                        await new Promise(resolve => setTimeout(resolve, 500));
                    } else {
                        return sendEmbed(message, client, `Already connected to <#${channel.id}>!`);
                    }
                }
                
                const player = await client.manager.createPlayer({
                    guildId: message.guild.id,
                    voiceId: channel.id,
                    textId: message.channel.id,
                    shardId: message.guild.shardId || 0,
                    deaf: true
                });
                
                if (!player) {
                    return sendErrorEmbed(message, client, "Failed to create player.");
                }
                
                return sendEmbed(message, client, `Successfully joined <#${channel.id}>!`);
            } catch (error) {
                console.error('Kazagumo error:', error);
                
                if (error.message && error.message.includes("Player is already connected")) {
                    return sendEmbed(message, client, `Already connected to <#${channel.id}>!`);
                }
                
                return sendErrorEmbed(message, client, `Failed to join: ${error.message || "Unknown error"}`);
            }
        } catch (error) {
            console.error('Error in connect command:', error);
            return sendErrorEmbed(message, client, "An unexpected error occurred. Please try again later.");
        }
    }
};

function sendErrorEmbed(message, client, description) {
    const payload = v2Message({
        color: '#ff0000',
        description: `❌ ${description}`,
        thumbnailUrl: message.author.displayAvatarURL({ dynamic: true }),
    });
    
    return message.reply(payload).catch(() => {
        return message.channel.send(payload).catch(console.error);
    });
}

function sendEmbed(message, client, description) {
    const payload = v2Message({
        color: client.config?.embedColor || client.ankushcolor || '#00ff00',
        description: `🎵 ${description}`,
        thumbnailUrl: message.author.displayAvatarURL({ dynamic: true }),
    });
    
    return message.reply(payload).catch(() => {
        return message.channel.send(payload).catch(console.error);
    });
}