import { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } from 'discord.js';

export default {
    data: new SlashCommandBuilder()
        .setName('vote')
        .setDescription('Get a link to vote for the bot'),

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
                .setColor('#ff6b6b')
                .setAuthor({
                    name: `Vote for ${client.user.username}`,
                    iconURL: client.user.displayAvatarURL()
                })
                .setTitle('🗳️ Support Us by Voting!')
                .setDescription(`Help **${client.user.username}** grow by voting on bot listing websites!`)
                .addFields([
                    {
                        name: '💖 Why Vote?',
                        value: [
                            '• Helps the bot reach more users',
                            '• Supports continued development',
                            '• Shows appreciation for our work',
                            '• Helps us stay motivated',
                            '• Improves bot visibility'
                        ].join('\n'),
                        inline: true
                    },
                    {
                        name: '🎁 Vote Rewards',
                        value: [
                            '• Priority support',
                            '• Special voter role',
                            '• Early access to features',
                            '• Vote streak rewards',
                            '• Community recognition'
                        ].join('\n'),
                        inline: true
                    },
                    {
                        name: '⏰ Voting Info',
                        value: [
                            '• Vote every 12 hours',
                            '• Takes less than 30 seconds',
                            '• Completely free',
                            '• No registration required',
                            '• Instant rewards'
                        ].join('\n'),
                        inline: false
                    }
                ])
                .setThumbnail(client.user.displayAvatarURL({ size: 256 }))
                .setFooter({
                    text: `${client.user.username} • Thank you for your support!`,
                    iconURL: client.user.displayAvatarURL()
                })
                .setTimestamp();

            const row = new ActionRowBuilder()
                .addComponents(
                    new ButtonBuilder()
                        .setLabel('Vote on Top.gg')
                        .setURL(`https://top.gg/bot/${client.user.id}/vote`)
                        .setStyle(ButtonStyle.Link)
                        .setEmoji('🗳️'),
                    new ButtonBuilder()
                        .setLabel('Vote on Discord Bots')
                        .setURL(`https://discord.bots.gg/bots/${client.user.id}`)
                        .setStyle(ButtonStyle.Link)
                        .setEmoji('🤖'),
                    new ButtonBuilder()
                        .setLabel('Vote on Bots for Discord')
                        .setURL(`https://botsfordiscord.com/bot/${client.user.id}/vote`)
                        .setStyle(ButtonStyle.Link)
                        .setEmoji('💙')
                );

            const row2 = new ActionRowBuilder()
                .addComponents(
                    new ButtonBuilder()
                        .setLabel('Support Server')
                        .setURL('https://discord.gg/your-support-server')
                        .setStyle(ButtonStyle.Link)
                        .setEmoji('🛠️'),
                    new ButtonBuilder()
                        .setLabel('Invite Bot')
                        .setURL(`https://discord.com/api/oauth2/authorize?client_id=${client.user.id}&permissions=8&scope=bot%20applications.commands`)
                        .setStyle(ButtonStyle.Link)
                        .setEmoji('🎵')
                );

            await interaction.reply({
                embeds: [embed],
                components: [row, row2]
            });

        } catch (error) {
            console.error('Vote command error:', error);
            
            const errorEmbed = new EmbedBuilder()
                .setColor('#ff0000')
                .setDescription('❌ An error occurred while displaying vote information.');

            if (interaction.deferred) {
                await interaction.editReply({ embeds: [errorEmbed] });
            } else {
                await interaction.reply({ embeds: [errorEmbed], ephemeral: true });
            }
        }
    }
};