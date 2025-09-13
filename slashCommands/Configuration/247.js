import { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } from 'discord.js';
import Guild from '../../Models/Guild.js';

export default {
    data: new SlashCommandBuilder()
        .setName('247')
        .setDescription('Toggle 24/7 mode to keep the bot in voice channel permanently')
        .addBooleanOption(option =>
            option
                .setName('enabled')
                .setDescription('Enable or disable 24/7 mode')
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

            const newValue = enabled !== null ? enabled : !guildData.twentyFourSeven;
            guildData.twentyFourSeven = newValue;
            await guildData.save();

            const embed = new EmbedBuilder()
                .setColor(newValue ? '#00ff00' : '#ff0000')
                .setAuthor({
                    name: '24/7 Mode Settings',
                    iconURL: client.user.displayAvatarURL()
                })
                .setDescription(`🔄 24/7 mode has been **${newValue ? 'enabled' : 'disabled'}**`)
                .addFields([
                    {
                        name: '💡 What is 24/7 mode?',
                        value: newValue 
                            ? 'The bot will stay in the voice channel even when no one is listening'
                            : 'The bot will leave the voice channel when no one is listening',
                        inline: false
                    },
                    {
                        name: '⚙️ Current Status',
                        value: newValue ? '✅ Enabled' : '❌ Disabled',
                        inline: true
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
            console.error('247 command error:', error);
            
            const errorEmbed = new EmbedBuilder()
                .setColor('#ff0000')
                .setDescription('❌ An error occurred while updating 24/7 settings.');

            if (interaction.deferred) {
                await interaction.editReply({ embeds: [errorEmbed] });
            } else {
                await interaction.reply({ embeds: [errorEmbed], ephemeral: true });
            }
        }
    }
};