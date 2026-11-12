const { v2Message } = require('../../utils/v2');

module.exports = {
  name: 'ping',
  description: 'return websocket ping',
  userPrams: [],
  botPrams: ['EMBED_LINKS'],

  run: async (client, interaction) => {
    await interaction.deferReply({ ephemeral: false });
    
    const ping = Date.now() - interaction.createdAt;
    const api_ping = client.ws.ping;

    await interaction.editReply(
      v2Message({
        color: client.ankushcolor,
        description: `\`\`\`ini\n[ Bot Latency ] :: ${ping}ms \n[ API Latency ] :: ${api_ping}ms \`\`\``,
      })
    );
  },
};
