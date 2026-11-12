const { convertTime } = require('../../utils/convert.js');
const moment = require('moment');
require('moment-duration-format');
const { v2Message, webhookMessage } = require('../../utils/v2');

module.exports = {
  name: 'grab',
  category: 'Music',
  description: '',
  aliases: [],
  args: false,
  usage: '',
  userPrams: [],
  cooldown: 5,
  botPrams: ['EmbedLinks'],
  dj: false,
  owner: false,
  player: true,
  inVoiceChannel: true,
  sameVoiceChannel: true,
  execute: async (message, args, client, prefix) => {
    const player = client.manager.players.get(message.guild.id);

    if (!player.queue.current) {
      return message.reply(v2Message({
        color: client.ankushcolor,
        description: '<:x_cross:1250674944057278535> There is no player for this guild, Please connect by using join command.',
        thumbnailUrl: message.author.displayAvatarURL({ dynamic: true }),
      }));
    }

    const msg = await message.channel.send(v2Message({
      color: client.ankushcolor,
      description: 'Trying to send...',
    }));

    try {
        const song = player.queue.current;
        const total = song.duration;
        const current = player.position;
    
        // Use webhookMessage (embed) for DMs since V2 components don't work in DMs
        const { EmbedBuilder } = require('discord.js');
        const dmEmbed = new EmbedBuilder()
            .setColor(client.ankushcolor || '#ff0000')
            .setTitle('Grabbed the current playing song!')
            .addFields(
                { name: 'Title', value: `[${song.title}](https://discord.com)` },
                { name: 'Author', value: `${song.author}` },
                { name: 'Progress', value: `${convertTime(current)}/${moment.duration(player.queue.current.length).format("hh:mm:ss")}` },
            )
            .setThumbnail(client.user.displayAvatarURL({dynamic:true}));

      await message.author.send({ embeds: [dmEmbed] });
      msg.edit(v2Message({ color: '#00ff00', description: '<:x_tick:1250674883080224768> Message sent successfully.' })).catch(() => null);
    } catch (error) {
      console.error(error);
      msg.edit(v2Message({ color: '#ff0000', description: '<:x_cross:1250674944057278535> Couldn\'t send you a DM. Make sure your DMs are open and try again.' })).catch(() => null);
    }
  }
};
