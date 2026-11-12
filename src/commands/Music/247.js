const db = require("../../models/autoreconnect");
const { v2Message, COLORS } = require('../../utils/v2');

module.exports = {
   name: '247',
   category: 'Music',
   aliases: ["alwayson"],
   description: 'Joins the voice channel for 24/7.',
   args: false,
   usage: '',
   userPrams: [],
   cooldown: 5,
   botPrams: ['EmbedLinks'],
   owner: false,
   player: false,
   inVoiceChannel: true,
   sameVoiceChannel: true,
   execute: async (message, args, client, prefix) => {
       const voiceChannel = message.member.voice.channel;
       if (!voiceChannel) {
           return message.reply(v2Message({ color: '#ff0000', description: '❌ | You need to be in a voice channel!' }));
       }

       let player = client.manager.players.get(message.guild.id);

       try {
           let data = await db.findOne({ Guild: message.guild.id });
           
           if (data) {
               await db.deleteOne({ Guild: message.guild.id });
               
               return message.reply(v2Message({
                   color: client.ankushcolor,
                   description: '🔌 | 24/7 mode has been **disabled**',
                   fields: [
                       { name: 'Channel', value: `<#${voiceChannel.id}>` },
                       { name: 'Status', value: '⚪ Disabled' }
                   ],
                   footer: 'Bot will now disconnect when queue ends',
                   thumbnailUrl: message.author.displayAvatarURL({ dynamic: true }),
               }));
           } else {
               // Create player if one doesn't exist
               if (!player) {
                   player = await client.manager.createPlayer({
                       guildId: message.guild.id,
                       voiceId: voiceChannel.id,
                       textId: message.channel.id,
                       deaf: true,
                   });
               }

               data = await db.create({
                   Guild: message.guild.id,
                   TextId: message.channel.id,
                   VoiceId: voiceChannel.id
               });

               return message.reply(v2Message({
                   color: client.ankushcolor,
                   description: '🔌 | 24/7 mode has been **enabled**',
                   fields: [
                       { name: 'Channel', value: `<#${voiceChannel.id}>` },
                       { name: 'Status', value: '🔵 Enabled' }
                   ],
                   footer: 'Bot will now stay connected 24/7',
                   thumbnailUrl: message.author.displayAvatarURL({ dynamic: true }),
               }));
           }
       } catch (error) {
           console.error('24/7 mode error:', error);
           
           return message.reply(v2Message({
               color: '#ff0000',
               description: '❌ | An error occurred while toggling 24/7 mode.',
           }));
       }
   }
};