const { Client, ButtonInteraction } = require("discord.js");
const { convertTime } = require("../../utils/convert");
const { v2Message, v2Error, COLORS, COMPONENTS_V2_FLAG, container, text, section, mediaGallery } = require("../../utils/v2");

module.exports = {
    name: "playerButtons",

    /**
     * 
     * @param {Client} client 
     * @param {ButtonInteraction} interaction 
     * @param {*} data 
     */

    run: async (client, interaction, data) => {

        if (!interaction.replied) await interaction.deferReply().catch(() => { });
        const color = client.ankushcolor;
        const emojipause = client.emoji.pause;
        const emojiresume = client.emoji.resume;
        const emojiskip = client.emoji.skip;
        const volumeEmoji = client.emoji.volumehigh;
        const previousEmoji = client.emoji.previous;
        if (!interaction.member.voice.channel) return await interaction.editReply(v2Message({ color, description: `You are not connected to a voice channel to use this button.` }));
        if (interaction.guild.members.me.voice.channel && interaction.guild.members.me.voice.channelId !== interaction.member.voice.channelId) return await interaction.editReply(v2Message({ color, description: `You are not connected to ${interaction.guild.members.me.voice.channel} to use this buttons.` }));
        const player = client.manager.players.get(interaction.guildId);

        if (!player) return await interaction.editReply(v2Message({ color, description: `BlaZe has no track playing right now.` }));
        if (!player.queue) return await interaction.editReply(v2Message({ color, description: `BlaZe has no track playing right now.` }));
        if (!player.queue.current) return await interaction.editReply(v2Message({ color, description: `BlaZe has no track playing right now.` }));


        let message;
        try {

            message = await interaction.channel.messages.fetch(data.Message, { cache: true });

        } catch (e) { };

        let icon = `${player.queue.current.thumbnail ? player.queue.current.thumbnail : `https://img.youtube.com/vi/${player.queue.current.identifier}/hqdefault.jpg`}`;

        const nowplayingPayload = v2Message({
            color,
            description: `[${player.queue.current.title}](${player.queue.current.uri}) • \`[ ${player.queue.current.isStream ? '[**◉ LIVE**]' : convertTime(player.queue.current.length)} ]\``,
            imageUrl: icon,
            footer: `Requested by ${player.queue.current.requester.tag}`,
        });

        if (interaction.customId === `${interaction.guildId}pause`) {
            if (player.shoukaku.paused) {
                await player.pause(false);
                await interaction.editReply(v2Message({ color, description: `${emojiresume} [${player.queue.current.title}](${player.queue.current.uri}) is now unpaused/resumed.` }));
                if (message) await message.edit(nowplayingPayload).catch(() => { });
            } else {
                await player.pause(true);
                await interaction.editReply(v2Message({ color, description: `${emojipause} [${player.queue.current.title}](${player.queue.current.uri}) is now paused.` }));
                if (message) await message.edit(nowplayingPayload).catch(() => { });
            };
        } else if (interaction.customId === `${interaction.guildId}skip`) {
            if (player.queue.length === 0) return await interaction.editReply(v2Message({ color, description: `No more songs left in the queue to skip.` }));
            await player.skip();
            if (message) await message.edit(nowplayingPayload).catch(() => { });
            return await interaction.editReply(v2Message({ color, description: `${emojiskip} Skipped - [${player.queue.current.title}](${player.queue.current.uri})` }));

        } else if (interaction.customId === `${interaction.guildId}previous`) {
            if (!player.queue.previous) {
                return await interaction.editReply(v2Message({ color, description: `No Previous song found` }));
            }

            if (player.queue.previous) {
                player.queue.unshift(player.queue.previous);
                await player.skip();
            }
            await interaction.editReply(v2Message({ color, description: `${previousEmoji} Previous [${player.queue.previous.title}](${player.queue.previous.uri})` }));
            if (message) await message.edit(nowplayingPayload).catch(() => { });


        } else if (interaction.customId === `${interaction.guildId}voldown`) {
            let amount = Number(player.volume * 100 - 10);
            if (amount <= 9) return await interaction.editReply(v2Message({ color, description: `Volume Cannot Decread \`[ 10% ]\`.` }));
            if (message) await message.edit(nowplayingPayload).catch(() => { });
            await player.setVolume(amount / 1);
            await interaction.editReply(v2Message({ color, description: `${volumeEmoji} Volume set to: \`[ ${player.volume * 100}% ]\`` }));
            if (message) await message.edit(nowplayingPayload).catch(() => { });

        } else if (interaction.customId === `${interaction.guildId}volup`) {
            let amount = Number(player.volume * 100 + 10);
            if (amount >= 100) return await interaction.editReply(v2Message({ color, description: `Volume Cannot Exceed \`[ 100% ]\`` }));
            await player.setVolume(amount / 1);
            await interaction.editReply(v2Message({ color, description: `${volumeEmoji} Volume set to: \`[ ${player.volume * 100}% ]\`` }));
            if (message) await message.edit(nowplayingPayload).catch(() => { });
        } else {
            if (message) await message.edit(nowplayingPayload).catch(() => { });

            return await interaction.editReply(v2Message({ color, description: `You've choosen an invalid button!` }));
        };
    }
}
