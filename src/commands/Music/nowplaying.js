const { v2Message } = require('../../utils/v2');

// Helper function to format duration with error handling
const formatDuration = (duration) => {
  if (!duration || isNaN(duration)) return 'Unknown';
  
  try {
    const durationMs = duration > 1000 ? duration : duration * 1000;
    const minutes = Math.floor(durationMs / 60000);
    const seconds = Math.floor((durationMs % 60000) / 1000);
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  } catch (error) {
    console.error('Duration formatting error:', error);
    return 'Unknown';
  }
};

module.exports = {
  name: 'nowplaying',
  category: 'Music',
  description: 'Shows the currently playing song in the queue.',
  args: false,
  usage: '',
  userPrams: [],
  cooldown: 5,
  botPrams: ['EmbedLinks'],
  owner: false,
  player: true,
  inVoiceChannel: true,
  sameVoiceChannel: true,
  execute: async (message, args, client, prefix) => {
    const player = client.manager.players.get(message.guild.id);
    if (!player || !player.queue.current) {
      return message.reply(v2Message({
        color: '#ff0000',
        title: '🎶 Now Playing',
        description: 'There is no song currently playing!',
        footer: `Requested by ${message.author.username}`,
      }));
    }

    const track = player.queue.current;
    const thumbnail =
      track.thumbnail ||
      `https://img.youtube.com/vi/${track.identifier}/hqdefault.jpg`;

    const trackDuration = track.duration || track.length || player.queue.current.duration;
    const duration = formatDuration(trackDuration);
    
    console.log('Track duration:', trackDuration);
    console.log('Formatted duration:', duration);
    
    return message.reply(v2Message({
      color: '#ff0000',
      title: '<a:Playing:1295493488548253786> Now Playing',
      description: `**[${track.title}](${track.uri})**`,
      fields: [
        { name: 'Artist', value: track.author || 'Unknown' },
        { name: 'Requested By', value: track.requester ? track.requester.username : 'Unknown' },
        { name: 'Duration', value: duration },
      ],
      thumbnailUrl: thumbnail,
      footer: `Enjoy your music!`,
    }));
  },
};