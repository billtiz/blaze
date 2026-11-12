const { ActionRowBuilder, StringSelectMenuBuilder } = require('discord.js');
const { convertTime } = require('../../utils/convert.js');
const { v2Message } = require('../../utils/v2');

module.exports = {
  name: 'search',
  aliases: [],
  category: 'Music',
  description: 'Search a song based on your interest!',
  args: false,
  usage: '<song name, song link, artist name>',
  userPrams: [],
  cooldown: 5,
  botPrams: ['EmbedLinks'],
  dj: false,
  owner: false,
  player: false,
  inVoiceChannel: true,
  sameVoiceChannel: true,
  execute: async (message, args, client, prefix) => {
    await message.channel.sendTyping();
    const query = args.join(' ');
    
    if (!query || query.trim() === '') {
      return message.reply(v2Message({
        color: client.ankushcolor,
        description: `<:x_cross:1250674944057278535> Please provide a search query`,
        thumbnailUrl: message.author.displayAvatarURL({ dynamic: true }),
      }));
    }
    
    const { channel } = message.member.voice;
    const player = await client.manager.createPlayer({
      guildId: message.guild.id,
      voiceId: message.member.voice.channel.id,
      textId: message.channel.id,
      deaf: true,
      loadBalancer: true,
    });
    
    const result = await player.search(query, { requester: message.author });

    const queueNumber = player.queue.length;

    if (!result.tracks.length) {
      return message.reply(v2Message({
        color: client.ankushcolor,
        description: `<:x_cross:1250674944057278535> No Results Found For \`${query}\``,
        thumbnailUrl: message.author.displayAvatarURL({ dynamic: true }),
      }));
    }

    try {
      let resultCompoment = await player.search(
        query,
        { engine: "spotify" },
        { requester: message.author }
      );
      
      const tracksToUse = resultCompoment.tracks.length > 0 ? resultCompoment.tracks : result.tracks;
      
      const results = tracksToUse.map((track, index) => {
        const truncatedTitle = track.title.length > 100 ? track.title.slice(0, 100) + "..." : track.title;
        return {
          label: `${index + 1}. ${truncatedTitle}`,
          value: track.uri || track.url,
        };
      });

      const limitedResults = results.slice(0, 25);
      
      const select = new StringSelectMenuBuilder()
        .setCustomId("select")
        .setPlaceholder("Select a Track to play")
        .addOptions(limitedResults || []);
        
      const replacingoptionifnotfound = new StringSelectMenuBuilder()
        .setCustomId("select2")
        .setPlaceholder("Select a Track to play")
        .addOptions([
          {
            label: `No Similar Songs Found`,
            value: "no",
          },
        ]);

      const selectRow = new ActionRowBuilder().addComponents(select);
      
      const msg = await message.channel.send(v2Message({
        color: client.ankushcolor,
        description: `| Select Tracks You Want To Add To The Queue.`,
        thumbnailUrl: client.user.displayAvatarURL({ dynamic: true }),
        actionRows: [selectRow],
      }));
      
      const filter = (i) => i.user.id === message.author.id;
      const collector = message.channel.createMessageComponentCollector({
        filter,
        time: 15000,
      });
      
      collector.on("collect", async (i) => {
        if (i.customId === "select") {
          if (i.values[0] === "no") return;
          if (
            !i.member.voice.channelId &&
            i.user.id !== client.user.id &&
            i.user.id !== client.config.ownerID
          )
            return i.reply({
              content: "<:x_cross:1250674944057278535> You are not in a voice channel!",
              ephemeral: true,
            });
            
          if (
            i.member.voice.channelId !== player.voiceId &&
            i.user.id !== client.config.ownerID
          )
            return i.reply({
              content: `<:x_cross:1250674944057278535> You must be in the same voice channel as the me to use this command!`,
              ephemeral: true,
            });
            
          let track;
          try {
            track = await player.search(i.values[0], { requester: i.user })
              .then((x) => x.tracks[0]);
              
            if (!track) {
              track = await player.search(i.values[0], { engine: "spotify", requester: i.user })
                .then((x) => x.tracks[0]);
            }
          } catch (error) {
            console.error("Error searching track:", error);
            return i.reply({
              content: "<:x_cross:1250674944057278535> Failed to load the track. Please try again.",
              ephemeral: true,
            });
          }
          
          if (!track) return i.reply({
            content: "<:x_cross:1250674944057278535> Track not found. Please try another search.",
            ephemeral: true,
          });
          
          player.queue.add(track);
          if (!player.playing && !player.paused && !player.queue.size)
            player.play();
            
          i.update(v2Message({
            color: client.ankushcolor,
            description: `<:x_tick:1250674883080224768> [**${track.title}**](https://discord.com) requested by ${track.requester}\n\n| Song Added to Queue #${queueNumber + 1}`,
            thumbnailUrl: message.author.displayAvatarURL({ dynamic: true }),
          }));
        }
      });
      
      collector.on("end", async (i) => {
        if (i.size === 0) {
          msg.edit(v2Message({
            color: client.ankushcolor,
            description: `| Selection was timed out.`,
            thumbnailUrl: client.user.displayAvatarURL({ dynamic: true }),
            actionRows: [new ActionRowBuilder().addComponents(replacingoptionifnotfound)],
          }));
        }
      });
    } catch (error) {
      console.error("Error in search command:", error);
      return message.reply(v2Message({
        color: client.ankushcolor,
        description: `<:x_cross:1250674944057278535> An error occurred while searching: ${error.message}`,
      }));
    }
  }
}
