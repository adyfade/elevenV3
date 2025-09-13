import { SlashCommandBuilder, EmbedBuilder, version as djsVersion } from 'discord.js';
import os from 'os';

export default {
    data: new SlashCommandBuilder()
        .setName('stats')
        .setDescription('Shows bot statistics and info'),

    category: 'General',
    cooldown: 10,
    
    permissions: {
        user: [],
        bot: [],
        dj: false
    },

    player: {
        voice: false,
        dj: false,
        active: false,
        djPerm: null
    },

    async execute(interaction, client) {
        try {
            await interaction.deferReply();

            // System stats
            const totalMemory = os.totalmem();
            const usedMemory = process.memoryUsage().heapUsed;
            const memoryUsage = ((usedMemory / totalMemory) * 100).toFixed(2);
            
            // Bot stats
            const totalGuilds = client.guilds.cache.size;
            const totalUsers = client.guilds.cache.reduce((acc, guild) => acc + guild.memberCount, 0);
            const totalChannels = client.channels.cache.size;
            const totalCommands = client.slashCommands.size;
            
            // Music stats
            const activePlayers = client.kazagumo.players.size;
            const totalNodes = client.shoukaku.nodes.size;
            
            // Uptime
            const uptime = this.formatUptime(client.uptime);

            const embed = new EmbedBuilder()
                .setColor('#3498db')
                .setAuthor({
                    name: `${client.user.username} Statistics`,
                    iconURL: client.user.displayAvatarURL()
                })
                .setTitle('📊 Bot Statistics')
                .addFields([
                    {
                        name: '🤖 Bot Information',
                        value: [
                            `**Name:** ${client.user.username}`,
                            `**ID:** ${client.user.id}`,
                            `**Created:** <t:${Math.floor(client.user.createdTimestamp / 1000)}:R>`,
                            `**Uptime:** ${uptime}`
                        ].join('\n'),
                        inline: true
                    },
                    {
                        name: '📈 Usage Statistics',
                        value: [
                            `**Servers:** ${totalGuilds.toLocaleString()}`,
                            `**Users:** ${totalUsers.toLocaleString()}`,
                            `**Channels:** ${totalChannels.toLocaleString()}`,
                            `**Commands:** ${totalCommands}`
                        ].join('\n'),
                        inline: true
                    },
                    {
                        name: '🎵 Music Statistics',
                        value: [
                            `**Active Players:** ${activePlayers}`,
                            `**Lavalink Nodes:** ${totalNodes}`,
                            `**Node Status:** ${this.getNodeStatus(client)}`,
                            `**Audio Quality:** High`
                        ].join('\n'),
                        inline: true
                    },
                    {
                        name: '💻 System Information',
                        value: [
                            `**Platform:** ${os.platform()} ${os.arch()}`,
                            `**Node.js:** ${process.version}`,
                            `**Discord.js:** v${djsVersion}`,
                            `**Memory Usage:** ${memoryUsage}%`
                        ].join('\n'),
                        inline: true
                    },
                    {
                        name: '⚡ Performance',
                        value: [
                            `**CPU Cores:** ${os.cpus().length}`,
                            `**Load Average:** ${os.loadavg()[0].toFixed(2)}`,
                            `**WebSocket Ping:** ${client.ws.ping}ms`,
                            `**Memory:** ${this.formatBytes(usedMemory)} / ${this.formatBytes(totalMemory)}`
                        ].join('\n'),
                        inline: true
                    },
                    {
                        name: '🔗 Links',
                        value: [
                            `[Invite Bot](https://discord.com/api/oauth2/authorize?client_id=${client.user.id}&permissions=8&scope=bot%20applications.commands)`,
                            `[Support Server](https://discord.gg/your-support)`,
                            `[Documentation](https://your-docs.com)`,
                            `[Vote](https://top.gg/bot/${client.user.id}/vote)`
                        ].join(' • '),
                        inline: false
                    }
                ])
                .setThumbnail(client.user.displayAvatarURL({ size: 256 }))
                .setFooter({
                    text: `Requested by ${interaction.user.tag}`,
                    iconURL: interaction.user.displayAvatarURL()
                })
                .setTimestamp();

            await interaction.editReply({ embeds: [embed] });

        } catch (error) {
            console.error('Stats command error:', error);
            
            const errorEmbed = new EmbedBuilder()
                .setColor('#ff0000')
                .setDescription('❌ An error occurred while fetching statistics.');

            if (interaction.deferred) {
                await interaction.editReply({ embeds: [errorEmbed] });
            } else {
                await interaction.reply({ embeds: [errorEmbed], ephemeral: true });
            }
        }
    },

    formatUptime(uptime) {
        const days = Math.floor(uptime / (24 * 60 * 60 * 1000));
        const hours = Math.floor((uptime % (24 * 60 * 60 * 1000)) / (60 * 60 * 1000));
        const minutes = Math.floor((uptime % (60 * 60 * 1000)) / (60 * 1000));
        const seconds = Math.floor((uptime % (60 * 1000)) / 1000);

        const parts = [];
        if (days > 0) parts.push(`${days}d`);
        if (hours > 0) parts.push(`${hours}h`);
        if (minutes > 0) parts.push(`${minutes}m`);
        if (seconds > 0) parts.push(`${seconds}s`);

        return parts.join(' ') || '0s';
    },

    formatBytes(bytes) {
        if (bytes === 0) return '0 B';
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    },

    getNodeStatus(client) {
        const nodes = Array.from(client.shoukaku.nodes.values());
        if (nodes.length === 0) return '❌ No nodes';
        
        const connectedNodes = nodes.filter(node => node.state === 'CONNECTED').length;
        return `✅ ${connectedNodes}/${nodes.length} online`;
    }
};