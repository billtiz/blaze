const { ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const { KazagumoPlayer, KazagumoTrack } = require("kazagumo");
const { v2Message, COLORS, COMPONENTS_V2_FLAG, container, text, section, mediaGallery, separator } = require('../../utils/v2');

module.exports = {
  name: "playerStart",
  /**
   * @param {Client} client 
   * @param {KazagumoPlayer} player 
   * @param {KazagumoTrack} track 
   */
  run: async (client, player, track) => {
    // Validate required parameters
    if (!client || !player || !track) {
      console.error('Missing required parameters:', { client: !!client, player: !!player, track: !!track });
      return;
    }

    let guild = client.guilds.cache.get(player.guildId);
    if (!guild) {
      console.error('Guild not found:', player.guildId);
      return;
    }

    let channel = guild.channels.cache.get(player.textId);
    if (!channel) {
      console.error('Channel not found:', player.textId);
      return;
    }

    // Delete the previous Now Playing message before sending a new one
    // This is a safety net in case playerEnd's deletion failed or hasn't completed yet
    try {
      const oldMessage = player.data.get("message");
      if (oldMessage && oldMessage.deletable) {
        await oldMessage.delete().catch(() => null);
      }
      player.data.set("message", null);
    } catch (err) {
      // Ignore deletion errors silently
    }

    // Safely check track URI
    if (track.uri && track.uri.includes("https://cdn.discordapp.com/attachments/")) {
      return;
    }

    // Safely set requester
    try {
      track.requester = player.previous
        ? player.queue.previous?.requester
        : player.queue.current?.requester;
    } catch (err) {
      console.error('Error setting track requester:', err);
    }

    const author1 = track.author || 'Unknown Artist';
    const voiceId = player.voiceId;
    const status = `${author1} - **${track.title || 'Unknown Title'}**`;

    try {
      const { REST } = require('@discordjs/rest');
      const rest = new REST({ version: '10' }).setToken(client.config.token);
      await rest.put(`/channels/${voiceId}/voice-status`, {
        body: {
          status: status
        }
      });
    } catch (err) {
      console.error('Error updating voice status:', err);
    }

    // Button builders
    const prev = new ButtonBuilder()
      .setCustomId("prev")
      .setEmoji(`<:nutzprev:1344297112665456681>`)
      .setStyle(ButtonStyle.Secondary);

    const pause = new ButtonBuilder()
      .setCustomId("pause")
      .setEmoji(`<:nutzpause:1344299079848693792>`)
      .setStyle(ButtonStyle.Secondary);

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

    const loop = new ButtonBuilder()
      .setCustomId("loop2")
      .setEmoji(`<:nutzloop:1350817463553753180>`)
      .setStyle(ButtonStyle.Secondary);

    const shuffle = new ButtonBuilder()
      .setCustomId("shuffle")
      .setEmoji(`<:nutzshuffle:1344297687373316119>`)
      .setStyle(ButtonStyle.Secondary);

    let row = new ActionRowBuilder().addComponents(prev, pause, skip, stop, vup);
    let row1 = new ActionRowBuilder().addComponents(vdwn, shuffle, like);

    try {
      const thumb = track.thumbnail || `https://img.youtube.com/vi/${track.identifier}/maxresdefault.jpg`;
      const requesterMention = track.requester?.id ? `<@${track.requester.id}>` : (track.requester?.tag || track.requester?.username || 'Unknown');
      
      const trackTitle = track.title || 'Unknown Title';
      const trackUrl = track.uri || '';
      const payload = v2Message({
        color: COLORS.RED,
        title: trackUrl ? `[${trackTitle}](${trackUrl})` : trackTitle,
        description: `<a:Playing:1295493488548253786> Now Playing`,
        fields: [
          { name: 'Artist', value: author1 },
          { name: 'Duration', value: track.isStream ? '🔴 LIVE' : formatDuration(track.length) },
          { name: 'Requested by', value: requesterMention },
        ],
        thumbnailUrl: thumb,
        actionRows: [row, row1],
      });

      const message = await channel.send({ ...payload, allowedMentions: { parse: [] } });

      // Set the message and autoplay system data
      if (message) {
        await player.data.set("message", message);
        
        await player.data.set("autoplaySystem", {
          title: track.title || 'Unknown Title',
          author: track.author || 'Unknown Artist',
          identifier: track.identifier || track.info?.identifier,
          requester: track.requester
        });
        
        await player.data.set("requester", track.requester);
      }
    } catch (err) {
      console.error('Error sending message:', err);
      
      // Fallback to a simpler V2 message
      try {
        const fallbackPayload = v2Message({
          color: COLORS.RED,
          description: `<a:Playing:1295493488548253786> Now playing: **${track.title || 'Unknown Title'}** by ${track.author || 'Unknown Artist'}`,
          actionRows: [row, row1],
        });
        const fallbackMessage = await channel.send({ ...fallbackPayload, allowedMentions: { parse: [] } });
        
        if (fallbackMessage) {
          await player.data.set("message", fallbackMessage);
          await player.data.set("autoplaySystem", {
            title: track.title || 'Unknown Title',
            author: track.author || 'Unknown Artist',
            identifier: track.identifier || track.info?.identifier,
            requester: track.requester
          });
          await player.data.set("requester", track.requester);
        }
      } catch (fallbackErr) {
        console.error('Error sending fallback message:', fallbackErr);
      }
    }
  }
};

function formatDuration(duration) {
  const minutes = Math.floor(duration / 60000);
  const seconds = ((duration % 60000) / 1000).toFixed(0);
  return `${minutes}:${seconds.padStart(2, '0')}`;
}