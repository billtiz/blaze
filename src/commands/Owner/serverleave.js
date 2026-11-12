const { v2Message } = require('../../utils/v2');

module.exports = {
    name: "serverleave",
    category: "Owner",
    aliases: ["sleft", "sleave"],
    description: "",
    args: false,
    usage: "<string>",
    permission: [],
    owner: true,
    execute: async (message, args, client, prefix) => {
        let id = args[0];
        if (!id) return message.reply(`You didn't provided the server Id.`);
        let guild = await client.guilds.fetch(id);
        if (!guild) return message.reply(`You didn't provided a valid server Id.`);
        await guild.leave();
        message.reply(v2Message({ color: client.ankushcolor, description: `**Successfully left Id:** \`${id}\`` }));
    }
}
