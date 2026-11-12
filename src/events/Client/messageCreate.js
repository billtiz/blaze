const { ActionRowBuilder, ButtonStyle, ButtonBuilder, PermissionsBitField, ChannelType, WebhookClient } = require('discord.js');
const Maintenance = require('../../models/maintenance');
const { IgnoreChannel } = require('../../database');
const db = require('../../models/prefix');
const { cooldown } = require("../../handlers/functions.js");
const NoPrefix = require('../../models/noprefix');
const Blacklist = require('../../models/blacklist');
const { RateLimitManager } = require("@sapphire/ratelimits");
const moment = require('moment');
const User = require('../../schema/User');
const { v2Message, v2Error, webhookMessage, COLORS } = require('../../utils/v2');

const spamRateLimitManager = new RateLimitManager(10000, 7);

// Command usage rate limiter
const commandRateLimitManager = new RateLimitManager(10000, 8);

module.exports = {
  name: 'messageCreate',
  run: async (client, message) => {
    if (message.author.bot || message.webhookId || !message.guild || !message.channel) return;
    if (!message.guild) return;
    if (message.channel.type == ChannelType.DM || message.channel.type == ChannelType.GuildForum) return;
    if (message.partial) await message.fetch();
    

// Owner mention reaction system (kept for backward compatibility)
if (client.config.ownerID.some(ownerId => message.content.includes(`<@${ownerId}>`)) && !message.reference) { // Only react if not a reply
  try {
    const ownerMentionReactions = ['<:red_crown:1297517994217439313>', '<:developer:1302188880761585744>'];
    for (const reaction of ownerMentionReactions) {
      await message.react(reaction);
      await new Promise(resolve => setTimeout(resolve, 500)); // 500ms delay between reactions
    }
  } catch (reactionError) {
    console.error('Error adding reactions:', reactionError);
  }
}
    
    if (message.content.toLowerCase().includes(`jsk`)) {
      client.dokdo.run(message);
    }

    let [owner] = await Promise.all([
      await client.config.ownerID.find((x) => x === message.author.id)
    ]);
    
    let blacklistUser = await Blacklist.findOne({ userId: message.author.id });
    if (owner) blacklistUser = false;

    // Check maintenance mode
        const maintenance = await Maintenance.findOne();
        const isMaintenanceActive = maintenance ? maintenance.isActive : false;
        const maintenanceReason = maintenance ? maintenance.reason : 'No reason provided';
    
    var prefix = client.prefix;
    const dbPrefix = await db.findOne({ id: message.guildId });

    if (dbPrefix && dbPrefix.prefix) prefix = dbPrefix.prefix;

    const mentionRegex = RegExp(`^<@!?${client.user.id}>$`);
    if (message.content.match(mentionRegex)) {
      // Define the action row for buttons first
      const mentionButtons = [new ButtonBuilder().setStyle(ButtonStyle.Link).setURL(`https://discord.com/oauth2/authorize?client_id=${client.user.id}&permissions=8&scope=bot%20applications.commands`).setLabel('Invite')];
      if (client.config.supportServer) mentionButtons.push(new ButtonBuilder().setStyle(ButtonStyle.Link).setURL(client.config.supportServer).setLabel('Support Server'));
      const mentionRow = new ActionRowBuilder().addComponents(mentionButtons);
      
      const mentionPayload = v2Message({
        color: '#ff0000',
        description: `Hey, It's [**${client.user.username}**](https://discord.com), A all-in-one Discord music bot with powerful playback and community features.`,
        fields: [{
          name: `__Guild Settings__`, value: `My Prefix: **${prefix}**\nLanguage: **English**\nServer I'd: **${message.guild.id}**`
        }],
        thumbnailUrl: client.user.displayAvatarURL(),
        actionRows: [mentionRow],
      });

      const mentionRlBucket = spamRateLimitManager.acquire(`${message.author.id}`);
      if (mentionRlBucket.limited && !owner) {
        await Blacklist.create({ userId: message.author.id });
        return message.reply(v2Message({
          color: '#ff0000',
          title: '⚠️ Blacklisted',
          description: 'You have been blacklisted due to excessive mentions.',
        }));
      }
      try {
        mentionRlBucket.consume();
      } catch (e) {}

      return message.reply(mentionPayload);
    }

    async function getNoPrefixList(client) {
      const data = await NoPrefix.find();
      return data.map(entry => entry.userId);
    }
    
    const noprefix = await getNoPrefixList(client);
    if (noprefix.includes(message.author.id) && !message.content.startsWith(prefix)) {
      prefix = "";
    }

    const escapeRegex = (str) => str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const prefixRegex = new RegExp(`^(<@!?${client.user.id}>|${escapeRegex(prefix)})\\s*`);
    if (!prefixRegex.test(message.content)) return;
    
    const [matchedPrefix] = message.content.match(prefixRegex);
    const args = message.content.slice(matchedPrefix.length).trim().split(/ +/);
    const commandName = args.shift().toLowerCase();

    const command = client.commands.get(commandName) ||
      client.commands.find((cmd) => cmd.aliases && cmd.aliases.includes(commandName));

    if (!command) return;

     // Block commands during maintenance (except for the maintenance command for owners)
        if (isMaintenanceActive && command.name !== 'maintenance' && !owner) {
            return message.reply(v2Message({
              color: '#ffaa00',
              title: '🚧 Maintenance Mode Active',
              description: `The bot is currently under maintenance.\n**Reason:** ${maintenanceReason}\nWe apologize for the inconvenience and appreciate your patience.`,
            }));
        }
      
    // Check if the channel is in the ignore list
    const ignoredChannel = await IgnoreChannel.findOne({ 
      guildId: message.guild.id, 
      channelId: message.channel.id 
    });
    
    // If channel is ignored, return early unless it's a bot owner
    if (ignoredChannel) {
      const isOwner = client.config.ownerID.includes(message.author.id);
      if (!isOwner) {
        await message.reply(v2Message({
          color: '#FF0000',
          title: 'Channel Ignored',
          description: 'This channel is set to ignore bot commands. Please use a different channel.',
        }));
        return;
      }
    }
    
    if (blacklistUser) {
      return message.reply(v2Message({
        color: '#ff0000',
        title: 'Access Denied',
        description: 'You are blacklisted and can\'t use my commands.',
      }));
    }

     // Check for command spam/abuse
    if (!owner) {
      const commandRateBucket = commandRateLimitManager.acquire(`${message.author.id}`);
      
      if (commandRateBucket.limited) {
        await Blacklist.create({ 
          userId: message.author.id,
          reason: "Automatic blacklist due to excessive command usage",
          date: new Date()
        });
        
        const blacklistLogPayload = webhookMessage({
          color: '#ff0000',
          title: 'Auto-Blacklist System',
          description: `User <@${message.author.id}> (${message.author.tag}) has been auto-blacklisted for excessive command usage.`,
          fields: [
            { name: 'User ID', value: message.author.id },
            { name: 'Server', value: message.guild.name },
            { name: 'Channel', value: message.channel.name },
            { name: 'Trigger Command', value: commandName },
            { name: 'Time', value: new Date().toISOString() }
          ],
          thumbnailUrl: message.author.avatarURL({ dynamic: true }),
        });
        
        const autoBlacklistLogUrl = client.config?.webhooks?.autoBlacklistLog;
        if (autoBlacklistLogUrl) {
          const hook = new WebhookClient({ url: autoBlacklistLogUrl });
          hook.send(blacklistLogPayload).catch(console.error);
        }
        
        return message.reply(v2Message({
          color: '#ff0000',
          title: '⚠️ Auto-Blacklisted',
          description: 'You have been blacklisted for excessive command usage. If you believe this is an error, please contact the bot owner in the support server.',
        }));
      }
      
      try {
        commandRateBucket.consume();
      } catch (e) {}
    }
    
    // Permission checks
    if (!message.guild.members.me.permissions.has(PermissionsBitField.resolve('SendMessages'))) {
      return message.author.send(v2Message({
        color: '#ff0000',
        title: 'Missing Permissions',
        description: 'I need Send Messages permission to function properly.',
      })).catch(() => {});
    }

    if (!message.guild.members.me.permissions.has(PermissionsBitField.resolve('ViewChannel'))) return;
    
    if (!message.guild.members.me.permissions.has(PermissionsBitField.resolve('EmbedLinks'))) {
      return message.channel.send(v2Message({
        color: '#ff0000',
        title: 'Missing Permissions',
        description: 'I need Embed Links permission to function properly.',
      }));
    }

    if (!message.guild.members.me.permissions.has(PermissionsBitField.resolve('ReadMessageHistory'))) {
      return message.channel.send(v2Message({
        color: '#ff0000',
        title: 'Missing Permissions',
        description: 'I need Read Message History permission to function properly.',
      }));
    }

    if (!message.guild.members.me.permissions.has(PermissionsBitField.resolve('UseExternalEmojis'))) {
      return message.channel.send(v2Message({
        color: '#ff0000',
        title: 'Missing Permissions',
        description: 'I need Use External Emojis permission to function properly.',
      }));
    }

    // User permissions check
    if (command.userPrams) {
      if (!message.member.permissions.has(PermissionsBitField.resolve(command.userPrams || []))) {
        return message.channel.send(v2Message({
          color: '#ff0000',
          title: 'Insufficient Permissions',
          description: `You are missing the following permissions: ${command.userPrams.join(', ')}`,
        })).then(msg => 
          setTimeout(() => { msg.delete().catch(e => null) }, 5000)
        );
      }
    }

    // Bot permissions check
    if (command.botPrams) {
      if (!message.channel.permissionsFor(client.user.id).has(PermissionsBitField.resolve(command.botPrams || []))) {
        return message.channel.send(v2Message({
          color: '#ff0000',
          title: 'Bot Permissions Required',
          description: `I am missing the following permissions: ${command.botPrams.join(', ')}`,
        })).then(msg => 
          setTimeout(() => { msg.delete().catch(e => null) }, 5000)
        );
      }
    }

    // Command usage help
    if (command.args && !args.length) {
      let reply = '';
      if (command.name) reply += `**Command Name**\n\`-\`${command.name}\n`;
      if (command.description) reply += `**Command Description**\n\`-\`${command.description}`;
      if (command.aliases) reply += `\n**Command Aliases**\n\`-\`${command.aliases.join(", ")}`;
      if (command.usage) reply += `\n**Command Usage**\n\`-\`${command.name} ${command.usage}`;
      if (command.cooldown) reply += `\n**Command Cooldown**\n\`-\`${command.cooldown}s`;
      if (command.botPrams) reply += `\n**Command Permission**\n\`-\`${command.botPrams}`;
      if (command.userPrams) {
        reply += `\n\`\`\`diff\n- [] = optional argument\n- <> = required argument\n- Do NOT type these when using commands!\`\`\``;
      }

      return message.channel.send(v2Message({
        color: client.ankushcolor,
        description: reply,
        thumbnailUrl: message.author.displayAvatarURL({ dynamic: true }),
      }));
    }

    // Owner command check
    if (command.owner) {
      if (client.owner) {
        const ownerCheck = client.owner.find((x) => x === message.author.id);
        if (!ownerCheck) return message.channel.send(v2Message({
          color: client.ankushcolor,
          description: `| You are not eligible to use that command.`,
          thumbnailUrl: message.guild.iconURL({ dynamic: true }),
        }));
      }
    }

    // Command logging
    const logPayload = webhookMessage({
      color: client.ankushcolor,
      title: `${message.guild.name}`,
      description: `> • **Command Author:** ${message.author.tag}(<@${message.author.id}>)\n> • **Command Name:** [${command.name}](https://discord.com/channels/${message.guild.id}/${message.channel.id})\n> • **Channel Id:** ${message.channel.id}\n> • **Channel Name:** ${message.channel.name}\n> • **Guild Name:** ${message.guild.name}\n> • **Guild Id:** ${message.guild.id}` + (args.length > 0 ? `\n> • **Arguments:** ${args.join(" ")}` : ''),
      thumbnailUrl: message.author.avatarURL({ dynamic: true }),
    });

    const cmdLogUrl = client.config?.webhooks?.cmdLog;
    if (cmdLogUrl) {
      const hook = new WebhookClient({ url: cmdLogUrl });
      hook.send(logPayload).catch(console.error);
    }

    // Cooldown check
    if (cooldown(message, command) && !client.owner.includes(message.author.id)) {
      return message.reply(v2Message({
        color: '#ff0000',
        title: 'Cooldown Active',
        description: `You are on cooldown, wait **${cooldown(message, command).toFixed()}** Seconds to use this command again.`,
      }));
    }

    // Player checks
    const player = client.manager.players.get(message.guild.id);
    if (command.player && !player) {
      return message.reply(v2Message({
        color: '#ff0000',
        title: 'No Active Player',
        description: 'There is no music playing in this server.',
      }));
    }

    if (command.inVoiceChannel && !message.member.voice.channelId) {
      return message.reply(v2Message({
        color: '#ff0000',
        title: 'Voice Channel Required',
        description: 'You need to be in a voice channel to use this command.',
      }));
    }

    if (command.sameVoiceChannel && message.guild.members.me.voice.channel) {
      if (message.guild.members.me.voice.channelId !== message.member.voice.channelId) {
        return message.reply(v2Message({
          color: '#ff0000',
          title: 'Same Voice Channel Required',
          description: 'You need to be in the same voice channel as me to use this command.',
        }));
      }
    }

    // Execute command
    try {
      command.execute(message, args, client, prefix);
      // Increment commandsUsed for the user
      User.findById(message.author.id).then(user => {
        if (!user) {
          user = new User({ _id: message.author.id, commandsUsed: 1 });
        } else {
          user.commandsUsed = (user.commandsUsed || 0) + 1;
        }
        return user.save();
      }).catch(() => {});
    } catch (error) {
      console.log(error);
      return message.channel.send(v2Message({
        color: '#ff0000',
        title: 'Command Error',
        description: "There was an error executing that command.\nI have contacted the owner of the bot to fix it immediately.",
      }));
    }
  }
};
