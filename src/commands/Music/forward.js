const { convertTime } = require("../../utils/convert");
const ms = require('ms');
const { v2Message } = require('../../utils/v2');

module.exports = {
    name: 'forward',
    category: 'Music',
    aliases: ["seek"],
    description: 'Forward/seeks the player to the provided timestamp.',
    args: false,
    usage: '<time>',
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
                description: `Please provide a valid time to seek to!\nExample: \`${prefix}forward 2m\` or \`${prefix}forward 10s\``,
                thumbnailUrl: message.author.displayAvatarURL({ dynamic: true }),
            }));
        }

        try {
            const time = ms(args[0]);
            if (!time || isNaN(time)) {
                return message.reply(v2Message({
                    color: client.ankushcolor,
                    description: `Please provide a valid time format!\nExample: \`2m\`, \`10s\`, \`1h\``,
                    thumbnailUrl: message.author.displayAvatarURL({ dynamic: true }),
                }));
            }

            const duration = player.queue.current.length;
            const song = player.queue.current;
            const title = song.title.length > 20
                ? song.title.slice(0, 20) + "..."
                : song.title;

            if (time <= duration) {
                await player.shoukaku.seekTo(time);
                
                return message.reply(v2Message({
                    color: client.ankushcolor,
                    description: `⏭️ Forwarded to: \`${convertTime(time)}\`\nSong: **${title}**`,
                    thumbnailUrl: message.author.displayAvatarURL({ dynamic: true }),
                }));
            } else {
                return message.reply(v2Message({
                    color: client.ankushcolor,
                    description: `Cannot forward beyond song duration: \`${convertTime(duration)}\``,
                    thumbnailUrl: message.author.displayAvatarURL({ dynamic: true }),
                }));
            }
        } catch (error) {
            return message.reply(v2Message({
                color: client.ankushcolor,
                description: `An error occurred while trying to forward the track. Please try again with a valid time format.`,
                thumbnailUrl: message.author.displayAvatarURL({ dynamic: true }),
            }));
        }
    },
};