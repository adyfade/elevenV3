import { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } from 'discord.js';
import Guild from '../../Models/Guild.js';

export default {
    data: new SlashCommandBuilder()
        .setName('no-prefix')
        .setDescription('Enable/disable no-prefix mode')
        .addBooleanOption(option =>
            option
                .setName('enabled')
                .setDescription('Enable or disable no-prefix mode')
                .setRequired(false)
        ),

    category: 'Configuration',
    cooldown: 5,
    
    permissions: {
        user: ['ManageGuild'],
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
            const enabled = interaction.options.getBoolean('enabled');
            
            let guildData = await Guild.findById(interaction.guild.id);
            if (!guildData) {
                guildData = new Guild({ _id: interaction.guild.id });
            }

            if (enabled === null) {
                // Show current status
                const embed = new EmbedBuilder()
                    .setColor('#3498db')
                    .setAuthor({
                        name: 'No-Prefix Mode Settings',
                        iconURL: client.user.displayAvatarURL()
                    })
                    .setDescription(`🔧 No-prefix mode is currently **${guildData.noPrefixMode ? 'enabled' : 'disabled'}**`)
                    .addFields([
                        {
                            name: '💡 What is no-prefix mode?',
                            value: guildData.noPrefixMode 
                                ? 'The bot responds to messages without requiring a prefix'
                                : 'The bot requires a prefix to respond to commands',
                            inline: false
                        },
                        {
                            name: '⚙️ Current Prefix',
                            value: `\`${guildData.prefix}\``,
                            inline: true
                        },
                        {
                            name: '🔄 Toggle',
                            value: 'Use `/no-prefix <true/false>` to change this setting',
                            inline: true
                        }
                    ])
                    .setTimestamp();

                return await interaction.reply({ embeds: [embed] });
            }

            guildData.noPrefixMode = enabled;
            await guildData.save();

            const embed = new EmbedBuilder()
                .setColor(enabled ? '#00ff00' : '#ff0000')
                .setAuthor({
                    name: 'No-Prefix Mode Updated',
                    iconURL: client.user.displayAvatarURL()
                })
                .setDescription(`🔧 No-prefix mode has been **${enabled ? 'enabled' : 'disabled'}**`)
                .addFields([
                    {
                        name: '💡 What this means',
                        value: enabled 
                            ? 'The bot will now respond to messages without requiring a prefix'
                            : `The bot will now require the prefix \`${guildData.prefix}\` to respond to commands`,
                        inline: false
                    },
                    {
                        name: '⚠️ Note',
                        value: enabled 
                            ? 'Slash commands will still work normally'
                            : 'You can still use slash commands without a prefix',
                        inline: false
                    },
                    {
                        name: '👤 Changed by',
                        value: interaction.user.toString(),
                        inline: true
                    }
                ])
                .setTimestamp();

            await interaction.reply({ embeds: [embed] });

        } catch (error) {
            console.error('NoPrefix command error:', error);
            
            const errorEmbed = new EmbedBuilder()
                .setColor('#ff0000')
                .setDescription('❌ An error occurred while updating no-prefix settings.');

            if (interaction.deferred) {
                await interaction.editReply({ embeds: [errorEmbed] });
            } else {
                await interaction.reply({ embeds: [errorEmbed], ephemeral: true });
            }
        }
    }
};