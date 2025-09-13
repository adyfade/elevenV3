import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';

export default {
    data: new SlashCommandBuilder()
        .setName('uptime')
        .setDescription('Displays the bot\'s uptime'),

    category: 'General',
    cooldown: 5,
    
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
            const uptime = client.uptime;
            const startTime = Date.now() - uptime;
            
            const embed = new EmbedBuilder()
                .setColor('#00ff00')
                .setAuthor({
                    name: `${client.user.username} Uptime`,
                    iconURL: client.user.displayAvatarURL()
                })
                .setTitle('⏰ Bot Uptime Information')
                .addFields([
                    {
                        name: '🚀 Started',
                        value: `<t:${Math.floor(startTime / 1000)}:F>`,
                        inline: true
                    },
                    {
                        name: '⏱️ Uptime',
                        value: this.formatUptime(uptime),
                        inline: true
                    },
                    {
                        name: '📊 Status',
                        value: '🟢 Online and Running',
                        inline: true
                    },
                    {
                        name: '🎵 Music Service',
                        value: client.kazagumo.players.size > 0 
                            ? `🎶 ${client.kazagumo.players.size} active player${client.kazagumo.players.size !== 1 ? 's' : ''}`
                            : '💤 No active players',
                        inline: true
                    },
                    {
                        name: '🌐 Servers',
                        value: `📡 Connected to ${client.guilds.cache.size} server${client.guilds.cache.size !== 1 ? 's' : ''}`,
                        inline: true
                    },
                    {
                        name: '👥 Users',
                        value: `👤 Serving ${client.guilds.cache.reduce((acc, guild) => acc + guild.memberCount, 0).toLocaleString()} users`,
                        inline: true
                    }
                ])
                .addFields([
                    {
                        name: '📈 Performance',
                        value: [
                            `**Memory Usage:** ${this.formatBytes(process.memoryUsage().heapUsed)}`,
                            `**WebSocket Ping:** ${client.ws.ping}ms`,
                            `**Process ID:** ${process.pid}`,
                            `**Node.js Version:** ${process.version}`
                        ].join('\n'),
                        inline: false
                    }
                ])
                .setFooter({
                    text: `Requested by ${interaction.user.tag}`,
                    iconURL: interaction.user.displayAvatarURL()
                })
                .setTimestamp();

            await interaction.reply({ embeds: [embed] });

        } catch (error) {
            console.error('Uptime command error:', error);
            
            const errorEmbed = new EmbedBuilder()
                .setColor('#ff0000')
                .setDescription('❌ An error occurred while fetching uptime information.');

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
        if (days > 0) parts.push(`${days} day${days !== 1 ? 's' : ''}`);
        if (hours > 0) parts.push(`${hours} hour${hours !== 1 ? 's' : ''}`);
        if (minutes > 0) parts.push(`${minutes} minute${minutes !== 1 ? 's' : ''}`);
        if (seconds > 0) parts.push(`${seconds} second${seconds !== 1 ? 's' : ''}`);

        return parts.join(', ') || '0 seconds';
    },

    formatBytes(bytes) {
        if (bytes === 0) return '0 B';
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }
};