const { addVoteBypass, removeVoteBypass, listVoteBypasses, checkVoteBypass, resetVoteBypasses } = require('../../utils/voteCheck');
const { v2Message } = require('../../utils/v2');


module.exports = {
    name: 'votebypass',
    aliases: ['vb', 'bypass', 'vbp'],
    category: 'Owner',
    description: 'Manage global vote bypasses for users (Authorized users only)',
    usage: 'votebypass <add|remove|list|check|reset> [options]',
    permissions: [],
    
    async execute(message, args) {
        if (!client.config.ownerID.includes(message.author.id)) return await message.reply('❌ You are not authorized to use this command.');
        if (args.length === 0) return await sendHelpEmbed(message);

        const subcommand = args[0].toLowerCase();
        try {
            switch (subcommand) {
                case 'add': await handleAddBypass(message, args.slice(1)); break;
                case 'remove': await handleRemoveBypass(message, args.slice(1)); break;
                case 'list': await handleListBypasses(message, args.slice(1)); break;
                case 'check': await handleCheckBypass(message, args.slice(1)); break;
                case 'reset': case 'clear': case 'resetall': await handleResetBypasses(message, args.slice(1)); break;
                case 'help': await sendHelpEmbed(message); break;
                default: await message.reply('❌ Invalid subcommand. Use `votebypass help` for usage information.');
            }
        } catch (error) {
            console.error('Error in votebypass command:', error);
            await message.reply(v2Message({ color: '#FF0000', title: '❌ Error', description: 'An error occurred while processing your request.', fields: [{ name: 'Error Details', value: `\`\`\`${error.message}\`\`\`` }] }));
        }
    }
};

async function sendHelpEmbed(message) {
    await message.reply(v2Message({
        color: '#0099FF', title: '🔧 Global Vote Bypass Commands Help', description: 'Manage global vote bypasses for users',
        fields: [
            { name: '📝 Add Bypass', value: '```votebypass add <@user|userID> [duration] [reason]```\n**Duration Options:** 1h, 6h, 12h, 1d, 3d, 1w, 1m, permanent (default)\n**Example:** `votebypass add @user 1w VIP member`' },
            { name: '🗑️ Remove Bypass', value: '```votebypass remove <@user|userID>```\n**Example:** `votebypass remove @user`' },
            { name: '📋 List Bypasses', value: '```votebypass list```\n**Example:** `votebypass list`' },
            { name: '🔍 Check Bypass', value: '```votebypass check <@user|userID>```\n**Example:** `votebypass check @user`' },
            { name: '🔄 Reset Bypasses', value: '```votebypass reset [all|<@user|userID>]```\n**Example (All):** `votebypass reset all`\n**Example (User):** `votebypass reset @user`' }
        ],
        footer: 'Authorized users only • All bypasses are global',
    }));
}

function parseUser(message, userString) {
    if (!userString) return null;
    const mentionMatch = userString.match(/^<@!?(\d+)>$/);
    if (mentionMatch) return message.client.users.cache.get(mentionMatch[1]);
    if (/^\d+$/.test(userString)) return message.client.users.cache.get(userString);
    return null;
}

function parseDuration(duration) {
    if (!duration || duration.toLowerCase() === 'permanent' || duration.toLowerCase() === 'perm') return { permanent: true, expiresAt: null };
    const now = new Date();
    let expiresAt;
    switch (duration.toLowerCase()) {
        case '1h': case '1hour': expiresAt = new Date(now.getTime() + 1 * 60 * 60 * 1000); break;
        case '6h': case '6hours': expiresAt = new Date(now.getTime() + 6 * 60 * 60 * 1000); break;
        case '12h': case '12hours': expiresAt = new Date(now.getTime() + 12 * 60 * 60 * 1000); break;
        case '1d': case '1day': expiresAt = new Date(now.getTime() + 24 * 60 * 60 * 1000); break;
        case '3d': case '3days': expiresAt = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000); break;
        case '1w': case '1week': expiresAt = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000); break;
        case '1m': case '1month': expiresAt = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000); break;
        default: return { permanent: true, expiresAt: null };
    }
    return { permanent: false, expiresAt };
}

async function handleAddBypass(message, args) {
    if (args.length < 1) return await message.reply('❌ Usage: `votebypass add <@user|userID> [duration] [reason]`');
    const userString = args[0]; const duration = args[1] || 'permanent'; const reason = args.slice(2).join(' ') || 'No reason provided';
    let user = parseUser(message, userString);
    if (!user) { try { user = await message.client.users.fetch(userString.replace(/[<@!>]/g, '')); } catch (e) { return await message.reply('❌ Invalid user.'); } }
    const { permanent, expiresAt } = parseDuration(duration);
    const result = await addVoteBypass(user.id, message.author.id, { guildId: null, reason, permanent, expiresAt });
    if (!result.success) return await message.reply(v2Message({ color: '#FF0000', title: '❌ Failed to Add Bypass', description: result.error }));
    await message.reply(v2Message({
        color: '#00FF00', title: '✅ Global Vote Bypass Added', description: `Successfully added global vote bypass for ${user.tag}`,
        fields: [
            { name: 'User', value: `${user.tag} (${user.id})` }, { name: 'Type', value: 'Global' },
            { name: 'Duration', value: permanent ? 'Permanent' : `Until <t:${Math.floor(expiresAt.getTime() / 1000)}:f>` },
            { name: 'Reason', value: reason }, { name: 'Added By', value: `${message.author.tag}` }
        ],
    }));
}

async function handleRemoveBypass(message, args) {
    if (args.length < 1) return await message.reply('❌ Usage: `votebypass remove <@user|userID>`');
    let user = parseUser(message, args[0]);
    if (!user) { try { user = await message.client.users.fetch(args[0].replace(/[<@!>]/g, '')); } catch (e) { return await message.reply('❌ Invalid user.'); } }
    const result = await removeVoteBypass(user.id, null);
    if (!result.success) return await message.reply(v2Message({ color: '#FF0000', title: '❌ Failed to Remove Bypass', description: result.error || 'No bypass found for this user' }));
    if (!result.removed) return await message.reply(v2Message({ color: '#FFA500', title: '⚠️ No Bypass Found', description: `No global vote bypass found for ${user.tag}` }));
    await message.reply(v2Message({ color: '#00FF00', title: '✅ Global Vote Bypass Removed', description: `Successfully removed global vote bypass for ${user.tag}`, fields: [{ name: 'User', value: `${user.tag} (${user.id})` }, { name: 'Type', value: 'Global' }, { name: 'Removed By', value: `${message.author.tag}` }] }));
}

async function handleListBypasses(message, args) {
    const bypasses = await listVoteBypasses(null);
    if (bypasses.length === 0) return await message.reply(v2Message({ color: '#FFA500', title: '📋 No Global Vote Bypasses', description: 'No global vote bypasses found.' }));

    const itemsPerPage = 10;
    const totalPages = Math.ceil(bypasses.length / itemsPerPage);
    const currentBypasses = bypasses.slice(0, itemsPerPage);

    let desc = 'Showing all global vote bypasses\n\n';
    for (const bypass of currentBypasses) {
        const user = await message.client.users.fetch(bypass.userId).catch(() => null);
        const userName = user ? `${user.tag} (${user.id})` : `Unknown User (${bypass.userId})`;
        const duration = bypass.permanent ? 'Permanent' : `Until <t:${Math.floor(new Date(bypass.expiresAt).getTime() / 1000)}:f>`;
        const addedBy = await message.client.users.fetch(bypass.addedBy).catch(() => null);
        desc += `**${userName}**\nType: Global | Duration: ${duration}\nReason: ${bypass.reason || 'No reason'} | Added by: ${addedBy?.tag || 'Unknown'}\nAdded: <t:${Math.floor(new Date(bypass.createdAt).getTime() / 1000)}:R>\n\n`;
    }

    await message.reply(v2Message({ color: '#0099FF', title: '📋 Global Vote Bypasses', description: desc, footer: `Page 1/${totalPages} • Total: ${bypasses.length} bypasses` }));
}

async function handleCheckBypass(message, args) {
    if (args.length < 1) return await message.reply('❌ Usage: `votebypass check <@user|userID>`');
    let user = parseUser(message, args[0]);
    if (!user) { try { user = await message.client.users.fetch(args[0].replace(/[<@!>]/g, '')); } catch (e) { return await message.reply('❌ Invalid user.'); } }
    const bypassStatus = await checkVoteBypass(user.id, message.guild.id);

    let fields = [{ name: 'User', value: `${user.tag} (${user.id})` }, { name: 'Has Global Bypass', value: bypassStatus.hasBypass ? '✅ Yes' : '❌ No' }];
    if (bypassStatus.hasBypass) {
        const bypass = bypassStatus.bypassData;
        fields.push({ name: 'Type', value: 'Global' }, { name: 'Duration', value: bypassStatus.isPermanent ? 'Permanent' : `Until <t:${Math.floor(new Date(bypass.expiresAt).getTime() / 1000)}:f>` }, { name: 'Reason', value: bypass.reason || 'No reason provided' });
        if (bypass.addedBy) { const addedBy = await message.client.users.fetch(bypass.addedBy).catch(() => null); if (addedBy) fields.push({ name: 'Added By', value: addedBy.tag }); }
        fields.push({ name: 'Added', value: `<t:${Math.floor(new Date(bypass.createdAt).getTime() / 1000)}:R>` });
    }
    if (bypassStatus.expired) fields.push({ name: 'Note', value: '⚠️ An expired bypass was found and removed' });
    await message.reply(v2Message({ color: bypassStatus.hasBypass ? '#00FF00' : '#FF0000', title: '🔍 Global Vote Bypass Check', description: `Checking global vote bypass status for ${user.tag}`, fields }));
}

async function handleResetBypasses(message, args) {
    let targetUserId = null, userTag = null;
    if (args.length > 0 && args[0].toLowerCase() !== 'all') {
        let user = parseUser(message, args[0]);
        if (!user) { try { user = await message.client.users.fetch(args[0].replace(/[<@!>]/g, '')); } catch (e) {} }
        if (user) { targetUserId = user.id; userTag = user.tag; }
        else if (/^\d+$/.test(args[0])) { targetUserId = args[0]; userTag = args[0]; }
        else return await message.reply('❌ Invalid user provided.');
    }
    const result = await resetVoteBypasses(targetUserId);
    if (!result.success) return await message.reply(v2Message({ color: '#FF0000', title: '❌ Failed to Reset Bypasses', description: result.error || 'An error occurred.' }));
    await message.reply(v2Message({
        color: '#00FF00', title: '✅ Vote Bypasses Reset',
        description: targetUserId ? `Successfully reset ${result.count} vote bypass(es) for **${userTag}**.` : `Successfully reset all **${result.count}** global vote bypasses.`,
        fields: [{ name: 'Target', value: targetUserId ? `${userTag} (${targetUserId})` : 'All Global Bypasses' }, { name: 'Records Removed', value: `${result.count}` }, { name: 'Reset By', value: `${message.author.tag}` }],
    }));
}