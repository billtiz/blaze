const Playlist = require('../../models/playlist');
const { v2Message } = require('../../utils/v2');

module.exports = {
  name: 'playliked',
  category: 'Favourite',
  description: 'Play songs from your favorites playlist',
  args: false,
  cooldown: 5,
  usage: '',
  userParams: [],
  botParams: ['EmbedLinks'],
  owner: false,
  player: false,
  inVoiceChannel: true,
  sameVoiceChannel: true,
  execute: async (message, args, client) => {
    try {
      const Name = "Fav";
      const data = await Playlist.findOne({ userId: message.author.id, playlistName: Name });

      if (!data || !data.playlist || data.playlist.length === 0) {
        return message.reply(v2Message({ color: '#ff0000', description: "❌ | You don't have any liked songs in your favorites!" }));
      }

      const player = await client.manager.createPlayer({
        guildId: message.guild.id,
        voiceId: message.member.voice.channel.id,
        textId: message.channel.id,
        deaf: true,
      });

      if (!player) {
        return message.reply(v2Message({ color: '#ff0000', description: "❌ | Failed to create music player!" }));
      }

      const loadingMessage = await message.reply(v2Message({ color: '#ff0000', description: "🎵 | Loading your favorite tracks..." }));

      let successCount = 0;
      let failedCount = 0;

      for (const track of data.playlist) {
        try {
          const searchResult = await player.search(track.uri ? track.uri : track.title, { requester: message.author });

          switch (searchResult.type) {
            case "TRACK":
            case "SEARCH":
            case "PLAYLIST":
              if (searchResult.tracks && searchResult.tracks[0]) {
                player.queue.add(searchResult.tracks[0]);
                if (!player.playing && !player.paused) await player.play();
                successCount++;
              } else { failedCount++; }
              break;
            default:
              failedCount++;
              break;
          }
        } catch (error) {
          console.error(`Error loading track: ${track.title}`, error);
          failedCount++;
        }

        if ((successCount + failedCount) % 5 === 0) {
          await loadingMessage.edit(v2Message({ color: '#ff0000', description: `🎵 | Loading tracks... ${successCount + failedCount}/${data.playlist.length}` })).catch(() => {});
        }
      }

      if (successCount === 0) {
        if (player && !player.queue.current) player.destroy().catch(() => null);
        return await loadingMessage.edit(v2Message({ color: '#ff0000', description: "❌ | Failed to load any tracks from your favorites." }));
      }

      return await loadingMessage.edit(v2Message({
        color: '#ff0000',
        title: '🎵 Playing Favorites',
        description: `Successfully loaded ${successCount} tracks from your favorites!`,
        fields: [
          { name: 'Loaded Tracks', value: `${successCount}/${data.playlist.length}` },
          { name: 'Failed Tracks', value: `${failedCount}` },
          { name: 'Queue Length', value: `${player.queue.length}` }
        ],
      }));
    } catch (error) {
      console.error('Playliked command error:', error);
      return message.reply(v2Message({ color: '#ff0000', description: "❌ | An error occurred while playing your favorites." }));
    }
  },
};
