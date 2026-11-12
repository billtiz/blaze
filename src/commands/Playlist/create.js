const { UserPlaylist } = require('../../models/playlistDB');
const { v2Message } = require('../../utils/v2');

module.exports = {
  name: 'pl-create',
  aliases: ['plcreate', 'create'],
  category: 'Playlist',
  description: "Creates the user's playlist.",
  args: true,
  cooldown: 5,
  usage: '<playlist name>',
  userPrams: [],
  botPrams: ['EmbedLinks'],
  owner: false,
  player: false,
  inVoiceChannel: false,
  sameVoiceChannel: false,
  vote: false,
  execute: async (message, args, client, prefix) => {
    const Name = args[0];
    if (!args[0]) {
      return message.reply(v2Message({ color: client.ankushcolor, description: `<:x_cross:1250674944057278535> Please specify a playlist name.`, thumbnailUrl: message.author.displayAvatarURL({ dynamic: true }) }));
    }
    
    if (Name.length > 20) {
      return message.reply(v2Message({ color: client.ankushcolor, description: `<:x_cross:1250674944057278535> Playlist name can't be greater than 20 characters`, thumbnailUrl: message.author.displayAvatarURL({ dynamic: true }) }));
    }
    
    try {
      const existingPlaylist = await UserPlaylist.findOne({ userId: message.author.id, playlistName: Name });
      if (existingPlaylist) {
        return message.reply(v2Message({ color: client.ankushcolor, description: `<:x_cross:1250674944057278535> You already have a playlist with the name **${Name}**`, thumbnailUrl: message.author.displayAvatarURL({ dynamic: true }) }));
      }
      
      const userPlaylistCount = await UserPlaylist.countDocuments({ userId: message.author.id });
      if (userPlaylistCount >= 10) {
        return message.reply(v2Message({ color: client.ankushcolor, description: `<:x_cross:1250674944057278535> You can only create **10** playlists`, thumbnailUrl: message.author.displayAvatarURL({ dynamic: true }) }));
      }
      
      await UserPlaylist.create({
        userName: message.author.tag,
        userId: message.author.id,
        playlistName: Name,
        createdOn: Math.round(Date.now() / 1000)
      });
      
      return message.channel.send(v2Message({ color: client.ankushcolor, description: `<:x_tick:1250674883080224768> Successfully created a playlist for you named **${Name}**`, thumbnailUrl: message.author.displayAvatarURL({ dynamic: true }) }));
    } catch (error) {
      console.error('Error creating playlist:', error);
      return message.reply(v2Message({ color: client.ankushcolor, description: `<:x_cross:1250674944057278535> An error occurred while creating your playlist.`, thumbnailUrl: message.author.displayAvatarURL({ dynamic: true }) }));
    }
  },
};