const Prefix = require('../../models/prefix');
const { v2Message } = require('../../utils/v2');

module.exports = {
  name: 'prefix',
  category: 'Settings',
  aliases: ['pre'],
  cooldown: 5,
  description: 'Change the prefix for the server.',
  args: false,
  usage: 'prefix <prefix>',
  userPrams: ['ManageGuild'],
  botPrams: ['ManageGuild'],
  owner: false,
  execute: async (message, args, client, prefix) => {
    let data = await Prefix.findOne({ id: message.guildId });
    const pre = args.join(' ').trim();
    
    let currentPrefix;
    if (!data || !data.prefix) {
      currentPrefix = client.config.prefix;
    } else {
      currentPrefix = data.prefix;
    }

    if (!pre) {
      return message.channel.send(v2Message({
        color: '#2f3136',
        title: 'Current Prefix',
        description: `The current prefix for this server is \`${currentPrefix}\``,
      }));
    }
    
    if (pre.length >= 4) {
      return message.reply(v2Message({
        color: '#ff0000',
        title: 'Error',
        description: 'The prefix cannot be longer than 3 characters!',
      }));
    }
    
    const emojiRegex = /(\u00a9|\u00ae|[\u2000-\u3300]|\ud83c[\ud000-\udfff]|\ud83d[\ud000-\udfff]|\ud83e[\ud000-\udfff])/;
    if (emojiRegex.test(pre)) {
      return message.reply(v2Message({
        color: '#ff0000',
        title: 'Error',
        description: 'Emojis are not allowed in the prefix!',
      }));
    }
    
    if (data) {
      data.oldPrefix = prefix;
      data.prefix = pre;
      await data.save();
    } else {
      data = await Prefix.create({
        id: message.guildId,
        prefix: pre,
        oldPrefix: currentPrefix,
      });
    }

    client.prefixes.set(message.guildId, pre);

    return message.reply(v2Message({
      color: '#00ff00',
      title: 'Prefix Updated',
      description: `Successfully updated the prefix to \`${pre}\``,
      fields: [
        { name: 'Old Prefix', value: `\`${currentPrefix}\`` },
        { name: 'New Prefix', value: `\`${pre}\`` }
      ],
      footer: `Requested by ${message.author.tag}`,
    }));
  }
};