const { inspect } = require("util");
const { v2Message } = require('../../utils/v2');

module.exports = {
  name: 'eval',
  category: 'Owner',
  aliases: ['ankush'],
  cooldown: 5,
  description: '',
  args: false,
  usage: '',
  userPrams: [],
  botPrams: ['EmbedLinks'],
  owner: true,
  execute: async (message, args, client, prefix) => {
    const code = args.join(" ");
    if (!code) {
      return message.channel.send(v2Message({ color: client.ankushcolor, description: `Please provide code to eval!` }));
    }
    try {
      let evaled;
      try { evaled = await eval(code); evaled = inspect(evaled, { depth: 0 }); }
      catch (e) { evaled = inspect(e, { depth: 0 }); }
      if (typeof evaled !== "string") evaled = inspect(evaled, { depth: 0 });
      if (evaled.includes(client.config.token)) evaled = evaled.replace(client.token, "Bakchodi Mat Kar Laude");
      if (evaled.includes(client.config.mongourl)) evaled = evaled.replace(client.config.mongourl, "Ye Buddha Mere Beech Mein Bahut Bolta Hai");
      return message.channel.send(v2Message({ color: client.ankushcolor, description: `\`\`\`js\n${evaled}\n\`\`\`` }));
    } catch (e) {
      return message.channel.send(v2Message({ color: client.ankushcolor, description: `\`\`\`js\n${e}\n\`\`\`` }));
    }
  },
};
