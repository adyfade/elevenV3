import { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } from 'discord.js';

export default {
    data: new SlashCommandBuilder()
        .setName('invite')
        .setDescription('Get a link to invite the bot'),

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
            const inviteUrl = `https://discord.com/api/oauth2/authorize?client_id=${client.user.id}&permissions=8&scope=bot%20applications.commands`;
            
            const embed = new EmbedBuilder()
                .setColor('#00ff00')
                .setAuthor({
                    name: `Invite ${client.user.username}`,
                    iconURL: client.user.displayAvatarURL()
                })
                .setTitle('🎵 Add me to your server!')
                .setDescription(`Thank you for choosing **${client.user.username}**! Click the button below to invite me to your server.`)
                .addFields([
                    {
                        name: '🎶 Features',
                        value: '• High-quality music streaming\n• Multiple audio sources\n• Advanced queue management\n• Audio filters and effects\n• 24/7 music support',
                        inline: true
                    },
                    {
                        name: '⚡ Quick Setup',
                        value: '• Slash commands ready\n• Easy to use interface\n• Minimal configuration\n• Works out of the box',
                        inline: true
                    },
                    {
                        name: '🔒 Permissions',
                        value: 'The bot requires administrator permissions for full functionality.',
                        inline: false
                    }
                ])
                .setThumbnail(client.user.displayAvatarURL({ size: 256 }))
                .setFooter({
                    text: `${client.user.username} • Premium Music Experience`,
                    iconURL: client.user.displayAvatarURL()
                })
                .setTimestamp();

            const row = new ActionRowBuilder()
                .addComponents(
                    new ButtonBuilder()
                        .setLabel('Invite Bot')
                        .setURL(inviteUrl)
                        .setStyle(ButtonStyle.Link)
                        .setEmoji('🎵'),
                    new ButtonBuilder()
                        .setLabel('Support Server')
                        .setURL('https://discord.gg/your-support-server')
                        .setStyle(ButtonStyle.Link)
                        .setEmoji('🛠️'),
                    new ButtonBuilder()
                        .setLabel('Documentation')
                        .setURL('https://your-docs-url.com')
                        .setStyle(ButtonStyle.Link)
                        .setEmoji('📚')
                );

            await interaction.reply({
                embeds: [embed],
                components: [row]
            });

        } catch (error) {
            console.error('Invite command error:', error);
            
            const errorEmbed = new EmbedBuilder()
                .setColor('#ff0000')
                .setDescription('❌ An error occurred while generating the invite link.');

            if (interaction.deferred) {
                await interaction.editReply({ embeds: [errorEmbed] });
            } else {
                await interaction.reply({ embeds: [errorEmbed], ephemeral: true });
            }
        }
    }
};