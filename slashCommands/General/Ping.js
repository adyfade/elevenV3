import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';

export default {
    data: new SlashCommandBuilder()
        .setName('ping')
        .setDescription('Check bot\'s latency'),

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
            const start = Date.now();
            
            await interaction.deferReply();
            
            const end = Date.now();
            const apiLatency = end - start;
            const wsLatency = client.ws.ping;

            // Get Lavalink latency if available
            let lavalinkLatency = 'N/A';
            const nodes = client.shoukaku.nodes;
            if (nodes.size > 0) {
                const node = nodes.values().next().value;
                lavalinkLatency = node.ping ? `${node.ping}ms` : 'N/A';
            }

            const embed = new EmbedBuilder()
                .setColor(this.getLatencyColor(apiLatency))
                .setAuthor({
                    name: 'Pong! 🏓',
                    iconURL: client.user.displayAvatarURL()
                })
                .setTitle('Bot Latency Information')
                .addFields([
                    {
                        name: '🤖 Bot Latency',
                        value: `\`${apiLatency}ms\``,
                        inline: true
                    },
                    {
                        name: '🌐 WebSocket',
                        value: `\`${wsLatency}ms\``,
                        inline: true
                    },
                    {
                        name: '🎵 Lavalink',
                        value: `\`${lavalinkLatency}\``,
                        inline: true
                    },
                    {
                        name: '📊 Status',
                        value: this.getStatusText(apiLatency, wsLatency),
                        inline: false
                    }
                ])
                .setFooter({
                    text: `Requested by ${interaction.user.tag}`,
                    iconURL: interaction.user.displayAvatarURL()
                })
                .setTimestamp();

            await interaction.editReply({ embeds: [embed] });

        } catch (error) {
            console.error('Ping command error:', error);
            
            const errorEmbed = new EmbedBuilder()
                .setColor('#ff0000')
                .setDescription('❌ An error occurred while checking latency.');

            if (interaction.deferred) {
                await interaction.editReply({ embeds: [errorEmbed] });
            } else {
                await interaction.reply({ embeds: [errorEmbed], ephemeral: true });
            }
        }
    },

    getLatencyColor(latency) {
        if (latency < 100) return '#00ff00'; // Green - Excellent
        if (latency < 200) return '#ffff00'; // Yellow - Good
        if (latency < 300) return '#ff8800'; // Orange - Fair
        return '#ff0000'; // Red - Poor
    },

    getStatusText(apiLatency, wsLatency) {
        const avgLatency = (apiLatency + wsLatency) / 2;
        
        if (avgLatency < 100) return '🟢 Excellent - Bot is running smoothly';
        if (avgLatency < 200) return '🟡 Good - Bot is performing well';
        if (avgLatency < 300) return '🟠 Fair - Bot may experience minor delays';
        return '🔴 Poor - Bot may experience significant delays';
    }
};