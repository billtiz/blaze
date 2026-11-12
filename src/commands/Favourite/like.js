const FavPlay = require('../../models/playlist');
const { v2Message } = require('../../utils/v2');

module.exports = {
  name: 'like',
  category: 'Favourite',
  description: 'Save the current playing song to your favorites playlist',
  args: false,
  cooldown: 5,
  usage: '',
  userParams: [],
  botParams: ['EmbedLinks'],
  owner: false,
  player: true,
  inVoiceChannel: true,
  sameVoiceChannel: true,
  execute: async (message, args, client) => {
    try {
      const player = client.manager.players.get(message.guild.id);
      if (!player?.queue?.current) {
        return message.reply(v2Message({ color: '#ff0000', description: "❌ | There is no music playing right now!" }));
      }

      const Name = "Fav";
      let data = await FavPlay.find({ userId: message.author.id, playlistName: Name });

      if (data.length <= 0) {
        try {
          await FavPlay.create({ userName: message.author.username, userId: message.author.id, playlistName: Name, playlist: [] });
          data = await FavPlay.find({ userId: message.author.id, playlistName: Name });
        } catch (error) {
          console.error('Playlist creation error:', error);
          return message.reply(v2Message({ color: '#ff0000', description: '❌ | Failed to create your favorites playlist.' }));
        }
      }

      const userData = await FavPlay.find({ userId: message.author.id });
      if (userData.length >= 10) {
        return message.reply(v2Message({ color: '#ff0000', title: '❌ Playlist Limit Reached', description: 'You have reached the maximum limit of 10 playlists.' }));
      }

      const song = player.queue.current;
      const existingPlaylist = data[0]?.playlist || [];
      const songExists = existingPlaylist.some(track => track.uri === song.uri);
      
      if (songExists) {
        return message.reply(v2Message({ color: '#ff0000', description: '❌ | This song is already in your favorites!' }));
      }

      const newSong = { title: song.title, uri: song.uri, author: song.author, duration: song.length, addedAt: new Date().toISOString() };
      const updatedPlaylist = [...existingPlaylist, newSong];

      try {
        await FavPlay.updateOne({ userId: message.author.id, playlistName: Name }, { playlist: updatedPlaylist });

        return message.reply(v2Message({
          color: '#ff0000',
          title: '✅ Added to Favorites',
          description: `Successfully added **${song.title}** to your favorites!`,
          fields: [
            { name: 'Title', value: song.title },
            { name: 'Artist', value: song.author },
            { name: 'Duration', value: formatDuration(song.length) }
          ],
        }));
      } catch (error) {
        console.error('Playlist update error:', error);
        return message.reply(v2Message({ color: '#ff0000', description: '❌ | Failed to add song to your favorites.' }));
      }
    } catch (error) {
      console.error('Like command error:', error);
      return message.reply(v2Message({ color: '#ff0000', description: '❌ | An error occurred while processing your request.' }));
    }
  }
};

function formatDuration(ms) {
  const minutes = Math.floor(ms / 60000);
  const seconds = ((ms % 60000) / 1000).toFixed(0);
  return `${minutes}:${seconds.padStart(2, '0')}`;
}