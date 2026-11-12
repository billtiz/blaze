const { v2Message } = require('../../utils/v2');

module.exports = {
    name: "say",
    category: "Dev",
    aliases: "",
    description: "",
    args: false,
    usage: "",
    userPerms: [],
    owner: false,
    execute: async (message, args, client, prefix) => {
    if (!client.config.ownerID.includes(message.author.id)) return;
  
   const sayMessage = message.content.split(' ').slice(1).join(' ');
    if (!sayMessage) {
      return message.reply(v2Message({
        color: '#ff0000',
        description: `BlaZe announcement requested by ${message.author.tag}`,
        thumbnailUrl: client.user.displayAvatarURL({ dynamic: true }),
      }));
    }

    if (sayMessage) {
      message.delete();
   message.channel.send({content: `${sayMessage}`}), {
      allowedMentions: { parse: ["users"] },
    };
     }
  },
};