import { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } from 'discord.js';

export default {
    data: new SlashCommandBuilder()
        .setName('support')
        .setDescription('Provides the bot\'s support server link'),

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
            const embed = new EmbedBuilder()
                .setColor('#00ff00')
                .setAuthor({
                    name: `${client.user.username} Support`,
                    iconURL: client.user.displayAvatarURL()
                })
                .setTitle('🛠️ Need Help?')
                .setDescription(`Join our support server to get help with **${client.user.username}**!`)
                .addFields([
                    {
                        name: '💬 What you can get help with:',
                        value: [
                            '• Bot setup and configuration',
                            '• Command usage and features',
                            '• Troubleshooting issues',
                            '• Feature requests',
                            '• Bug reports',
                            '• Premium support'
                        ].join('\n'),
                        inline: false
                    },
                    {
                        name: '👥 Community Benefits:',
                        value: [
                            '• Active community of users',
                            '• Quick response from support team',
                            '• Latest updates and announcements',
                            '• Beta testing opportunities',
                            '• Music sharing and playlists'
                        ].join('\n'),
                        inline: false
                    },
                    {
                        name: '⚡ Quick Links:',
                        value: [
                            '• Use `/help` for command list',
                            '• Use `/ping` to check bot status',
                            '• Use `/stats` for bot information',
                            '• Check our documentation for guides'
                        ].join('\n'),
                        inline: false
                    }
                ])
                .setThumbnail(client.user.displayAvatarURL({ size: 256 }))
                .setFooter({
                    text: `${client.user.username} • We're here to help!`,
                    iconURL: client.user.displayAvatarURL()
                })
                .setTimestamp();

            const row = new ActionRowBuilder()
                .addComponents(
                    new ButtonBuilder()
                        .setLabel('Join Support Server')
                        .setURL('https://discord.gg/your-support-server')
                        .setStyle(ButtonStyle.Link)
                        .setEmoji('🛠️'),
                    new ButtonBuilder()
                        .setLabel('Documentation')
                        .setURL('https://your-docs-url.com')
                        .setStyle(ButtonStyle.Link)
                        .setEmoji('📚'),
                    new ButtonBuilder()
                        .setLabel('Report Bug')
                        .setURL('https://github.com/your-repo/issues')
                        .setStyle(ButtonStyle.Link)
                        .setEmoji('🐛')
                );

            await interaction.reply({
                embeds: [embed],
                components: [row]
            });

        } catch (error) {
            console.error('Support command error:', error);
            
            const errorEmbed = new EmbedBuilder()
                .setColor('#ff0000')
                .setDescription('❌ An error occurred while displaying support information.');

            if (interaction.deferred) {
                await interaction.editReply({ embeds: [errorEmbed] });
            } else {
                await interaction.reply({ embeds: [errorEmbed], ephemeral: true });
            }
        }
    }
};