import { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } from 'discord.js';
import Guild from '../../Models/Guild.js';

export default {
    data: new SlashCommandBuilder()
        .setName('prefix')
        .setDescription('Configure the bot\'s prefix for this server')
        .addStringOption(option =>
            option
                .setName('new_prefix')
                .setDescription('New prefix to set (max 5 characters)')
                .setMaxLength(5)
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
            const newPrefix = interaction.options.getString('new_prefix');
            
            let guildData = await Guild.findById(interaction.guild.id);
            if (!guildData) {
                guildData = new Guild({ _id: interaction.guild.id });
            }

            if (!newPrefix) {
                // Show current prefix
                const embed = new EmbedBuilder()
                    .setColor('#3498db')
                    .setAuthor({
                        name: 'Prefix Settings',
                        iconURL: client.user.displayAvatarURL()
                    })
                    .setDescription(`🔧 Current prefix: \`${guildData.prefix}\``)
                    .addFields([
                        {
                            name: '💡 How to change',
                            value: 'Use `/prefix <new_prefix>` to change the prefix',
                            inline: false
                        },
                        {
                            name: '📝 Examples',
                            value: '`/prefix !`\n`/prefix ?`\n`/prefix music`',
                            inline: true
                        },
                        {
                            name: '⚠️ Note',
                            value: 'Slash commands work without any prefix',
                            inline: true
                        }
                    ])
                    .setTimestamp();

                return await interaction.reply({ embeds: [embed] });
            }

            // Validate prefix
            if (newPrefix.length > 5) {
                return await interaction.reply({
                    embeds: [
                        new EmbedBuilder()
                            .setColor('#ff0000')
                            .setDescription('❌ Prefix cannot be longer than 5 characters!')
                    ],
                    ephemeral: true
                });
            }

            if (newPrefix.includes(' ')) {
                return await interaction.reply({
                    embeds: [
                        new EmbedBuilder()
                            .setColor('#ff0000')
                            .setDescription('❌ Prefix cannot contain spaces!')
                    ],
                    ephemeral: true
                });
            }

            const oldPrefix = guildData.prefix;
            guildData.prefix = newPrefix;
            await guildData.save();

            const embed = new EmbedBuilder()
                .setColor('#00ff00')
                .setAuthor({
                    name: 'Prefix Updated',
                    iconURL: client.user.displayAvatarURL()
                })
                .setDescription(`🔧 Prefix changed from \`${oldPrefix}\` to \`${newPrefix}\``)
                .addFields([
                    {
                        name: '💡 Usage',
                        value: `You can now use commands like: \`${newPrefix}play\`, \`${newPrefix}queue\``,
                        inline: false
                    },
                    {
                        name: '⚠️ Remember',
                        value: 'Slash commands still work without any prefix',
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
            console.error('Prefix command error:', error);
            
            const errorEmbed = new EmbedBuilder()
                .setColor('#ff0000')
                .setDescription('❌ An error occurred while updating prefix settings.');

            if (interaction.deferred) {
                await interaction.editReply({ embeds: [errorEmbed] });
            } else {
                await interaction.reply({ embeds: [errorEmbed], ephemeral: true });
            }
        }
    }
};