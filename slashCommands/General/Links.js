import { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } from 'discord.js';

export default {
    data: new SlashCommandBuilder()
        .setName('links')
        .setDescription('Provides important bot-related links'),

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
                .setColor('#3498db')
                .setAuthor({
                    name: `${client.user.username} Links`,
                    iconURL: client.user.displayAvatarURL()
                })
                .setTitle('🔗 Important Links')
                .setDescription(`Here are all the important links related to **${client.user.username}**`)
                .addFields([
                    {
                        name: '🎵 Invite Bot',
                        value: 'Add the bot to your server',
                        inline: true
                    },
                    {
                        name: '🛠️ Support Server',
                        value: 'Get help and support',
                        inline: true
                    },
                    {
                        name: '📚 Documentation',
                        value: 'Learn how to use the bot',
                        inline: true
                    },
                    {
                        name: '🗳️ Vote',
                        value: 'Support us on bot lists',
                        inline: true
                    },
                    {
                        name: '💎 Premium',
                        value: 'Unlock premium features',
                        inline: true
                    },
                    {
                        name: '📊 Status',
                        value: 'Check bot status',
                        inline: true
                    }
                ])
                .setThumbnail(client.user.displayAvatarURL({ size: 256 }))
                .setFooter({
                    text: `${client.user.username} • Premium Music Experience`,
                    iconURL: client.user.displayAvatarURL()
                })
                .setTimestamp();

            const row1 = new ActionRowBuilder()
                .addComponents(
                    new ButtonBuilder()
                        .setLabel('Invite Bot')
                        .setURL(`https://discord.com/api/oauth2/authorize?client_id=${client.user.id}&permissions=8&scope=bot%20applications.commands`)
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

            const row2 = new ActionRowBuilder()
                .addComponents(
                    new ButtonBuilder()
                        .setLabel('Vote on Top.gg')
                        .setURL('https://top.gg/bot/your-bot-id/vote')
                        .setStyle(ButtonStyle.Link)
                        .setEmoji('🗳️'),
                    new ButtonBuilder()
                        .setLabel('Get Premium')
                        .setURL('https://your-premium-url.com')
                        .setStyle(ButtonStyle.Link)
                        .setEmoji('💎'),
                    new ButtonBuilder()
                        .setLabel('Status Page')
                        .setURL('https://your-status-url.com')
                        .setStyle(ButtonStyle.Link)
                        .setEmoji('📊')
                );

            await interaction.reply({
                embeds: [embed],
                components: [row1, row2]
            });

        } catch (error) {
            console.error('Links command error:', error);
            
            const errorEmbed = new EmbedBuilder()
                .setColor('#ff0000')
                .setDescription('❌ An error occurred while displaying links.');

            if (interaction.deferred) {
                await interaction.editReply({ embeds: [errorEmbed] });
            } else {
                await interaction.reply({ embeds: [errorEmbed], ephemeral: true });
            }
        }
    }
};