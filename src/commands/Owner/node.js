const { StringSelectMenuBuilder, ActionRowBuilder, ComponentType } = require("discord.js");
const os = require('os');
const { v2Message } = require('../../utils/v2');

module.exports = {
    name: "node",
    category: "Owner",
    description: "View node and system statistics",
    args: false,
    usage: "",
    userPerms: [],
    owner: true,
    execute: async (message, args, client, prefix) => {
        const viewSelect = new StringSelectMenuBuilder()
            .setCustomId('node_view')
            .setPlaceholder('Select information to view')
            .addOptions([
                { label: 'Lavalink Info', description: 'View Lavalink nodes status', value: 'lavalink' },
                { label: 'System Info', description: 'View system and bot statistics', value: 'system' },
                { label: 'Memory Usage', description: 'Detailed memory usage information', value: 'memory' },
                { label: 'Bot Info', description: 'Basic bot information', value: 'bot' },
                { label: 'Refresh Data', description: 'Refresh the current view', value: 'refresh' }
            ]);
        
        const row = new ActionRowBuilder().addComponents(viewSelect);
        let currentView = args[0]?.toLowerCase() || 'lavalink';
        if (currentView === 'menu') currentView = 'menu';
        
        const initialContent = getInfoContent(currentView, client);
        
        const response = await message.reply(v2Message({
            color: '#FF0000',
            title: initialContent.title,
            description: initialContent.description,
            footer: initialContent.footer,
            actionRows: [row],
        }));
        
        const collector = response.createMessageComponentCollector({ 
            componentType: ComponentType.StringSelect, time: 120000, filter: i => i.user.id === message.author.id
        });
        
        collector.on('collect', async interaction => {
            const selectedView = interaction.values[0];
            await interaction.deferUpdate();
            
            const view = selectedView === 'refresh' ? currentView : selectedView;
            if (selectedView !== 'refresh') currentView = selectedView;
            
            const content = getInfoContent(view, client);
            await response.edit(v2Message({
                color: '#FF0000',
                title: content.title,
                description: content.description,
                footer: content.footer,
                actionRows: [row],
            }));
        });
        
        collector.on('end', () => { response.edit({ components: [] }).catch(() => {}); });
    }
};

function getInfoContent(infoType, client) {
    if (infoType === 'menu') {
        return { title: 'Node Information', description: 'Please select what information you would like to view from the dropdown menu.', footer: 'Select an option from the dropdown' };
    }
    
    if (infoType === 'lavalink') {
        const nodes = [...client.manager.shoukaku.nodes.values()];
        if (nodes.length === 0) return { title: 'Lavalink Node', description: 'No Lavalink nodes are currently configured.', footer: '' };

        const all = nodes.map(node => {
            const identifier = node.options?.identifier || "Music";
            const players = node.stats?.players || 4;
            const playingPlayers = node.stats?.playingPlayers || 2;
            return `Nothing ${identifier} is Connected\nPlayer: ${players}\nPlaying Players: ${playingPlayers}\nUptime: ${new Date(node.stats.uptime).toISOString().slice(11, 19)}\nLavalink Provider\n\nMemory\nReservable Memory: ${Math.round(node.stats.memory.reservable / 1024 / 1024)}mb\nUsed Memory: ${Math.round(node.stats.memory.used / 1024 / 1024)}mb\nFree Memory: ${Math.round(node.stats.memory.free / 1024 / 1024)}mb\nAllocated Memory: ${Math.round(node.stats.memory.allocated / 1024 / 1024)}mb\n\nCPU\nCores: ${node.stats.cpu.cores}\nSystem Load: ${(Math.round(node.stats.cpu.systemLoad * 100) / 100).toFixed(2)}%\nLavalink Load: ${(Math.round(node.stats.cpu.lavalinkLoad * 100) / 100).toFixed(2)}%`;
        }).join('\n\n----------------------------\n');
        return { title: 'Lavalink Node', description: `\`\`\`${all}\`\`\``, footer: 'Select an option from the dropdown to view other stats' };
    }
    
    if (infoType === 'system') {
        const serverUsage = process.memoryUsage();
        const cpuCores = os.cpus();
        const cpuUsage = process.cpuUsage();
        const cpuUsagePercent = ((cpuUsage.user + cpuUsage.system) / (cpuCores.length * 1e6)) * 100;
        const systemInfo = `Bot Information\nNodeJS: ${process.version}\nDiscord.js: v${require('discord.js').version}\nUptime: ${formatTime(process.uptime() * 1000)}\n\nSystem Information\nPlatform: ${os.platform()}\nArchitecture: ${os.arch()}\nCPU: ${cpuCores[0].model}\nCores: ${cpuCores.length}\nCPU Usage: ${cpuUsagePercent.toFixed(2)}%\n\nMemory Usage\nHeap Used: ${formatBytes(serverUsage.heapUsed)}\nHeap Total: ${formatBytes(serverUsage.heapTotal)}\nRSS: ${formatBytes(serverUsage.rss)}\nSystem Total: ${formatBytes(os.totalmem())}\nSystem Free: ${formatBytes(os.freemem())}`;
        return { title: 'System Information', description: `\`\`\`${systemInfo}\`\`\``, footer: 'Select an option from the dropdown to view other stats' };
    }
    
    if (infoType === 'memory') {
        const memoryUsage = process.memoryUsage();
        const systemMemory = { total: os.totalmem(), free: os.freemem() };
        const memoryInfo = `Process Memory Details\nRSS: ${formatBytes(memoryUsage.rss)} (Resident Set Size)\nHeap Total: ${formatBytes(memoryUsage.heapTotal)} (Total JS Heap)\nHeap Used: ${formatBytes(memoryUsage.heapUsed)} (JS Heap Used)\nExternal: ${formatBytes(memoryUsage.external)} (C++ Objects)\nArray Buffers: ${formatBytes(memoryUsage.arrayBuffers || 0)}\n\nSystem Memory\nTotal: ${formatBytes(systemMemory.total)}\nFree: ${formatBytes(systemMemory.free)}\nUsed: ${formatBytes(systemMemory.total - systemMemory.free)}\nUsage: ${((systemMemory.total - systemMemory.free) / systemMemory.total * 100).toFixed(2)}%`;
        return { title: 'Memory Information', description: `\`\`\`${memoryInfo}\`\`\``, footer: 'Select an option from the dropdown to view other stats' };
    }
    
    if (infoType === 'bot') {
        const serverCount = client.guilds.cache.size;
        const totalMembers = client.guilds.cache.reduce((acc, guild) => acc + guild.memberCount, 0);
        const channels = client.channels.cache.size;
        const shardCount = client.shard?.count || 1;
        const botInfo = `Bot Statistics\nServers: ${serverCount}\nUsers: ${totalMembers}\nChannels: ${channels}\nShards: ${shardCount}\nUptime: ${formatTime(client.uptime)}\n\nVersion Information\nNodeJS: ${process.version}\nDiscord.js: v${require('discord.js').version}\nShoukaku: ${client.manager.shoukaku?.version || "Unknown"}`;
        return { title: 'Bot Information', description: `\`\`\`${botInfo}\`\`\``, footer: 'Select an option from the dropdown to view other stats' };
    }
    
    return getInfoContent('lavalink', client);
}

function formatBytes(bytes) {
    if (bytes === 0) return '0 Bytes';
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return `${parseFloat((bytes / Math.pow(1024, i)).toFixed(2))} ${sizes[i]}`;
}

function formatTime(ms) {
    const seconds = Math.floor((ms / 1000) % 60);
    const minutes = Math.floor((ms / (1000 * 60)) % 60);
    const hours = Math.floor((ms / (1000 * 60 * 60)) % 24);
    const days = Math.floor(ms / (1000 * 60 * 60 * 24));
    return `${days}d ${hours}h ${minutes}m ${seconds}s`;
}