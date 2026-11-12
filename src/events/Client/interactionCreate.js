const { InteractionType, ButtonBuilder, ButtonStyle, ActionRowBuilder } = require("discord.js");
const Prefix = require('../../models/prefix');
const FavPlay = require("../../models/playlist");
const { v2Message, COLORS } = require('../../utils/v2');

module.exports = {
  name: 'interactionCreate',
  run: async (client, interaction, player) => {
    let prefix = client.prefix;
    const ress = await Prefix.findOne({ id: interaction.guildId });
    if (ress && ress.prefix) prefix = ress.prefix;

    if (interaction.type === InteractionType.ApplicationCommand) {
      const command = client.slashCommands.get(interaction.commandName);
      if (!command) return;

      try {
        await command.run(client, interaction, prefix);
      } catch (error) {
        console.error(error);
        await interaction.reply(
          v2Message({ color: client.ankushcolor, description: 'An unexpected error occurred.', ephemeral: true }),
        ).catch(() => { });
      }
    }

    // Button definitions
    const prev = new ButtonBuilder()
      .setCustomId("prev")
      .setEmoji(`<:nutzprev:1344297112665456681>`)
      .setStyle(ButtonStyle.Secondary);
    const pause = new ButtonBuilder()
      .setCustomId("pause")
      .setEmoji(`<:nutzpause:1344299079848693792>`)
      .setStyle(ButtonStyle.Secondary);
    const resume = new ButtonBuilder()
      .setCustomId("resume")
      .setEmoji(`<:nutzresume:1344297299274371094>`)
      .setStyle(ButtonStyle.Success);
    const skip = new ButtonBuilder()
      .setCustomId("skip")
      .setEmoji(`<:nutzskip:1344297399526625291>`)
      .setStyle(ButtonStyle.Secondary);
    const stop = new ButtonBuilder()
      .setCustomId("stop")
      .setEmoji(`<:nutzstop:1344297778565742664>`)
      .setStyle(ButtonStyle.Danger);
    const like = new ButtonBuilder()
      .setCustomId("like")
      .setLabel("Like")
      .setEmoji("<:nutzlike:1344297920324702251>")
      .setStyle(ButtonStyle.Success);
    const vup = new ButtonBuilder()
      .setCustomId("volup")
      .setEmoji(`<:nutzvolup:1344297998741672007>`)
      .setStyle(ButtonStyle.Secondary);
    const vdwn = new ButtonBuilder()
      .setCustomId("voldown")
      .setEmoji(`<:nutzvoldown:1344297598391156758>`)
      .setStyle(ButtonStyle.Secondary);
    const shuffle = new ButtonBuilder()
      .setCustomId("shuffle")
      .setEmoji(`<:nutzshuffle:1344297687373316119>`)
      .setStyle(ButtonStyle.Secondary);

    let row = new ActionRowBuilder().addComponents(prev, resume, skip, stop, vup);
    let row1 = new ActionRowBuilder().addComponents(prev, pause, skip, stop, vup);
    let row2 = new ActionRowBuilder().addComponents(vdwn, shuffle, like);

    if (interaction.isButton()) {
      const player = client.manager.players.get(interaction.guild.id);
      
      if (!player) return interaction.message.delete();

      if (!interaction.member.voice.channelId && interaction.user.id !== client.user.id && interaction.user.id !== client.config.ownerID) {
        return interaction.reply(v2Message({ color: client.ankushcolor, description: 'You need to be in a voice channel to use this button!', ephemeral: true }));
      }

      if (interaction.member.voice.channelId !== player.voiceId && interaction.user.id !== client.user.id && interaction.user.id !== client.config.ownerID) {
        return interaction.reply(v2Message({ color: client.ankushcolor, description: 'You need to be in the same voice channel as me to use this button!', ephemeral: true }));
      }

      switch (interaction.customId) {
        case "skip":
          if (player.paused) {
            interaction.reply(v2Message({ color: client.ankushcolor, description: 'Resume the player to skip the track!', ephemeral: true }));
          } else {
            player.skip();
            interaction.reply(v2Message({ color: client.ankushcolor, description: 'Skipped the current track!', ephemeral: true }));
          }
          break;

        case "stop":
          player.destroy().catch(() => null);
          interaction.reply(v2Message({ color: client.ankushcolor, description: 'Stopped the player and cleared the queue!', ephemeral: true }));
          break;

        case "prev":
          let seektime = player.position - 10000;
          if (seektime >= player.queue.current.duration - player.position || seektime < 0) {
            seektime = 0;
          }
          player.seek(Number(seektime));
          interaction.reply(v2Message({ color: client.ankushcolor, description: 'Rewound the track by 10 seconds!', ephemeral: true }));
          break;

        case "pause":
          player.pause(true);
          try {
            const pauseTrack = player.queue.current;
            const pauseThumb = pauseTrack.thumbnail || `https://img.youtube.com/vi/${pauseTrack.identifier}/maxresdefault.jpg`;
            const pauseDuration = pauseTrack.isStream ? '🔴 LIVE' : formatDuration(pauseTrack.length);
            const pausePayload = v2Message({
              color: client.ankushcolor,
              title: pauseTrack.uri ? `[${pauseTrack.title || 'Unknown Title'}](${pauseTrack.uri})` : (pauseTrack.title || 'Unknown Title'),
              description: `⏸️ Paused`,
              fields: [
                { name: 'Artist', value: pauseTrack.author || 'Unknown Artist' },
                { name: 'Duration', value: pauseDuration },
                { name: 'Requested by', value: pauseTrack.requester?.id ? `<@${pauseTrack.requester.id}>` : (pauseTrack.requester?.tag || pauseTrack.requester?.username || 'Unknown') },
              ],
              thumbnailUrl: pauseThumb,
              actionRows: [row, row2],
            });
            interaction.update({ ...pausePayload, allowedMentions: { parse: [] } });
          } catch (e) {
            console.log(e);
          }
          break;

        case "resume":
          player.pause(false);
          try {
            const resumeTrack = player.queue.current;
            const resumeThumb = resumeTrack.thumbnail || `https://img.youtube.com/vi/${resumeTrack.identifier}/maxresdefault.jpg`;
            const resumeDuration = resumeTrack.isStream ? '🔴 LIVE' : formatDuration(resumeTrack.length);
            const resumePayload = v2Message({
              color: client.ankushcolor,
              title: resumeTrack.uri ? `[${resumeTrack.title || 'Unknown Title'}](${resumeTrack.uri})` : (resumeTrack.title || 'Unknown Title'),
              description: `<a:Playing:1295493488548253786> Now Playing`,
              fields: [
                { name: 'Artist', value: resumeTrack.author || 'Unknown Artist' },
                { name: 'Duration', value: resumeDuration },
                { name: 'Requested by', value: resumeTrack.requester?.id ? `<@${resumeTrack.requester.id}>` : (resumeTrack.requester?.tag || resumeTrack.requester?.username || 'Unknown') },
              ],
              thumbnailUrl: resumeThumb,
              actionRows: [row1, row2],
            });
            interaction.update({ ...resumePayload, allowedMentions: { parse: [] } });
          } catch (e) {
            console.log(e);
          }
          break;

        case "volup":
          if (player.volume === 150) {
            interaction.reply(v2Message({ color: client.ankushcolor, description: 'Maximum volume reached!', ephemeral: true }));
            return;
          }
          let amount = Number(player.volume) + 5;
          if (amount >= 100) amount = 100;
          player.setVolume(amount);
          interaction.reply(v2Message({ color: client.ankushcolor, description: `Volume increased to ${amount}%`, ephemeral: true }));
          break;

        case "voldown":
          if (player.volume === 0) {
            interaction.reply(v2Message({ color: client.ankushcolor, description: 'Minimum volume reached!', ephemeral: true }));
            return;
          }
          let amount2 = Number(player.volume) - 5;
          if (amount2 <= 0) amount2 = 1;
          player.setVolume(amount2);
          interaction.reply(v2Message({ color: client.ankushcolor, description: `Volume decreased to ${amount2}%`, ephemeral: true }));
          break;

        case "shuffle":
          if (player.queue.length < 3) {
            interaction.reply(v2Message({ color: client.ankushcolor, description: 'Not enough songs in the queue to shuffle!', ephemeral: true }));
            return;
          }
          player.queue.shuffle();
          interaction.reply(v2Message({ color: client.ankushcolor, description: 'Shuffled the queue!', ephemeral: true }));
          break;

        case "like":
          const Name = "Fav";
          let data = await FavPlay.find({ userId: interaction.member.user.id, playlistName: Name });

          if (data.length <= 0) {
            await FavPlay.create({
              userName: interaction.user.tag,
              userId: interaction.user.id,
              playlistName: Name,
              playlist: [],
            });

            try {
              data = await FavPlay.find({ userId: interaction.member.user.id, playlistName: Name });
            } catch (error) {
              return interaction.reply(v2Message({ color: client.ankushcolor, description: 'An error occurred while creating your playlist.', ephemeral: true }));
            }
          }

          let userData = await FavPlay.find({
            userId: interaction.user.id
          });

          if (userData.length >= 10) {
            return interaction.reply(v2Message({ color: client.ankushcolor, description: 'You have reached the maximum number of favorite playlists!', ephemeral: true }));
          }

          const song = player.queue.current;
          let oldSong = [];

          if (data[0] && Array.isArray(data[0].playlist)) {
            oldSong = data[0].playlist;
          }

          oldSong.push({
            title: song.title,
            uri: song.uri,
            author: song.author,
            duration: song.length,
          });

          try {
            await FavPlay.updateOne(
              {
                userId: interaction.user.id,
                playlistName: Name,
              },
              { playlist: oldSong }
            );

            interaction.reply(v2Message({ color: client.ankushcolor, description: 'Added the current song to your favorites!', ephemeral: true }));
          } catch (error) {
            return interaction.reply(v2Message({ color: client.ankushcolor, description: 'An error occurred while updating your playlist.', ephemeral: true }));
          }
          break;
      }
    }
  }
};

function formatDuration(duration) {
  const minutes = Math.floor(duration / 60000);
  const seconds = ((duration % 60000) / 1000).toFixed(0);
  return `${minutes}:${seconds.padStart(2, '0')}`;
}