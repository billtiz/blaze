const { PermissionsBitField } = require('discord.js');
const { v2Message } = require('../../utils/v2');

module.exports = {
  name: 'play',
  category: 'Music',
  aliases: ['p'],
  description: 'Plays songs from different platforms.',
  args: false,
  cooldown: 3,
  usage: '[song name or song link]',
  userPrams: [],
  botPrams: ['EmbedLinks'],
  owner: false,
  inVoiceChannel: true,
  sameVoiceChannel: true,
  execute: async (message, args, client, prefix) => {
    try {
      if (!message.guild.members.me.permissions.has(PermissionsBitField.resolve(["Speak", "Connect"]))) {
        return message.reply(v2Message({
          color: client.ankushcolor || '#FF0000',
          description: "I don't have the necessary permissions to connect or speak in the voice channel.",
        }));
      }
      
      const { channel } = message.member.voice;
      if (!channel) {
        return message.reply(v2Message({
          color: client.ankushcolor || '#FF0000',
          description: "You need to be in a voice channel to use this command.",
        }));
      }
      
      if (!message.guild.members.cache
        .get(client.user.id)
        .permissionsIn(channel)
        .has(PermissionsBitField.resolve(["Speak", "Connect"]))) {
        return message.reply(v2Message({
          color: client.ankushcolor || '#FF0000',
          description: "I don't have permission to join and speak in your voice channel.",
        }));
      }
      
      const query = args.join(' ');
      if (!query) {
        return message.reply(v2Message({
          color: client.ankushcolor || '#FF0000',
          description: "Please provide a song name or link to play.",
        }));
      }
      
      if (!client.manager) {
        return message.reply(v2Message({
          color: client.ankushcolor || '#FF0000',
          description: "Music manager is not properly initialized. Please contact the bot developer.",
        }));
      }
      
      let player;
      try {
        player = await client.manager.createPlayer({
          guildId: message.guild.id,
          voiceId: message.member.voice.channel.id,
          textId: message.channel.id,
          shardId: message.guild.shardId || 0,
          loadBalancer: true,
          deaf: true,
        });
      } catch (error) {
        console.error("Error creating player:", error);
        return message.reply(v2Message({
          color: client.ankushcolor || '#FF0000',
          description: `Failed to create music player: ${error.message}`,
        }));
      }
      
      let result;
      try {
        result = await player.search(query, { requester: message.author });
        
        if (!result || !result.tracks || !result.tracks.length) {
          return message.reply(v2Message({
            color: client.ankushcolor || '#FF0000',
            description: "No results found for your query.",
          }));
        }
      } catch (error) {
        console.error("Error searching for tracks:", error);
        return message.reply(v2Message({
          color: client.ankushcolor || '#FF0000',
          description: `Error searching for tracks: ${error.message}`,
        }));
      }
      
      const MIN_DURATION = 30000;
      let addedTrackCount = 0;
      
      if (result.type === 'PLAYLIST') {
        const validTracks = result.tracks.filter(track => track.isStream || track.length >= MIN_DURATION);
        
        if (!validTracks.length) {
          return message.reply(v2Message({
            color: client.ankushcolor || '#FF0000',
            description: "No songs in the playlist are streams or longer than 30 seconds.",
          }));
        }
        
        for (const track of validTracks) {
          player.queue.add(track);
          addedTrackCount++;
        }
        
        const playlistName = result.playlist && result.playlist.name ? result.playlist.name : "Unknown Playlist";
        
        if (!player.playing && !player.paused) {
          try {
            await player.play();
          } catch (error) {
            console.error("Error starting playback:", error);
          }
        }
        
        return message.reply(v2Message({
          color: client.ankushcolor || '#FF0000',
          title: 'Playlist Added to Queue',
          description: `**${playlistName}** with ${addedTrackCount} valid track(s) has been added to the queue.`,
          footer: `Requested by ${message.author.username}`,
        }));
      } else {
        const track = result.tracks[0];
        
        if (!track.isStream && track.length < MIN_DURATION) {
          return message.reply(v2Message({
            color: client.ankushcolor || '#FF0000',
            description: "This track is shorter than 30 seconds and cannot be added to the queue.",
          }));
        }
        
        player.queue.add(track);
        
        if (!player.playing && !player.paused) {
          try {
            await player.play();
          } catch (error) {
            console.error("Error starting playback:", error);
          }
        }
        
        return message.reply(v2Message({
          color: client.ankushcolor || '#FF0000',
          title: 'Track Added to Queue',
          description: `**[${track.title}](${track.uri})** by ${track.author} has been added to the queue.`,
          footer: `Requested by ${message.author.username}`,
        }));
      }
    } catch (mainError) {
      console.error("Main error in play command:", mainError);
      return message.reply(v2Message({
        color: client.ankushcolor || '#FF0000',
        description: `An error occurred: ${mainError.message}`,
      }));
    }
  },
};