const { UserPlaylist, PlaylistSong } = require('../../models/playlistDB');
const { v2Message } = require('../../utils/v2');

module.exports = {
  name: 'pl-load',
  aliases: ['plload', 'load'],
  category: 'Playlist',
  description: 'Load a playlist',
  args: true,
  usage: '<playlist name>',
  userPrams: [],
  botPrams: ['EmbedLinks'],
  owner: false,
  player: false,
  inVoiceChannel: true,
  sameVoiceChannel: true,
  execute: async (message, args, client, prefix) => {
    const Name = args[0];

    if (!args[0]) {
      return message.reply(v2Message({ color: client.ankushcolor, description: `<:x_cross:1250674944057278535> Please specify a playlist name.` }));
    }

    try {
      const playlist = await UserPlaylist.findOne({ userId: message.author.id, playlistName: Name });
      if (!playlist) {
        return message.reply(v2Message({ color: client.ankushcolor, description: `<:x_cross:1250674944057278535> You don't have a playlist with the name **${Name}**` }));
      }

      const songs = await PlaylistSong.find({ playlistId: playlist._id });
      if (!songs || songs.length === 0) {
        return message.reply(v2Message({ color: client.ankushcolor, description: `<:x_cross:1250674944057278535> Your playlist **${Name}** doesn't have any songs.` }));
      }

      const player = await client.manager.createPlayer({
        guildId: message.guild.id,
        voiceId: message.member.voice.channel.id,
        textId: message.channel.id,
        deaf: true,
      });

      if (!player) return;

      let count = 0;
      const m = await message.reply(v2Message({ color: client.ankushcolor, description: `<:x_tick:1250674883080224768> Loading tracks from your playlist **${Name}**...` }));

      for (const song of songs) {
        const searchQuery = song.trackURL || song.trackTitle;
        if (!searchQuery) continue;
        
        let s = await player.search(searchQuery, { requester: message.author });
        
        if (s.type === "TRACK" || s.type === 'SEARCH' || s.type === 'PLAYLIST') {
          if (player) player.queue.add(s.tracks[0]);
          if (player && !player.playing && !player.paused) await player.play();
          ++count;
        }
      }

      if (player && !player.queue.current) player.destroy().catch(() => null);

      if (count <= 0 && m) {
        return await m.edit(v2Message({ color: client.ankushcolor, description: `<:x_cross:1250674944057278535> Couldn't add any tracks from your playlist **${Name}** to the queue.` }));
      }

      if (m) {
        return await m.edit(v2Message({ color: client.ankushcolor, description: `<:x_tick:1250674883080224768> Added [**${count}**](https://discord.com) track(s) from your playlist **${Name}** to the queue.` }));
      }
    } catch (error) {
      console.error('Error in playlist-load command:', error);
      return message.reply(v2Message({ color: client.ankushcolor, description: `<:x_cross:1250674944057278535> An error occurred while loading your playlist: ${error.message}` }));
    }
  },
};