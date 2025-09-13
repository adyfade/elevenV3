import { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } from 'discord.js';
import Guild from '../../Models/Guild.js';

export default {
    data: new SlashCommandBuilder()
        .setName('language')
        .setDescription('Select your preferred bot language')
        .addStringOption(option =>
            option
                .setName('language')
                .setDescription('Language to set')
                .setRequired(false)
                .addChoices(
                    { name: '🇺🇸 English', value: 'en' },
                    { name: '🇪🇸 Spanish', value: 'es' },
                    { name: '🇫🇷 French', value: 'fr' },
                    { name: '🇩🇪 German', value: 'de' },
                    { name: '🇮🇹 Italian', value: 'it' },
                    { name: '🇵🇹 Portuguese', value: 'pt' },
                    { name: '🇷🇺 Russian', value: 'ru' },
                    { name: '🇯🇵 Japanese', value: 'ja' },
                    { name: '🇰🇷 Korean', value: 'ko' },
                    { name: '🇨🇳 Chinese', value: 'zh' }
                )
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
            const language = interaction.options.getString('language');
            
            let guildData = await Guild.findById(interaction.guild.id);
            if (!guildData) {
                guildData = new Guild({ _id: interaction.guild.id });
            }

            if (!language) {
                // Show current language
                const currentLang = this.getLanguageName(guildData.language);
                
                const embed = new EmbedBuilder()
                    .setColor('#3498db')
                    .setAuthor({
                        name: 'Language Settings',
                        iconURL: client.user.displayAvatarURL()
                    })
                    .setDescription(`🌐 Current language: **${currentLang}**`)
                    .addFields([
                        {
                            name: '💡 How to change',
                            value: 'Use `/language <language>` to change the bot language',
                            inline: false
                        },
                        {
                            name: '📝 Note',
                            value: 'Language changes affect bot responses and messages',
                            inline: false
                        }
                    ])
                    .setTimestamp();

                return await interaction.reply({ embeds: [embed] });
            }

            const oldLanguage = this.getLanguageName(guildData.language);
            const newLanguage = this.getLanguageName(language);
            
            guildData.language = language;
            await guildData.save();

            const embed = new EmbedBuilder()
                .setColor('#00ff00')
                .setAuthor({
                    name: 'Language Updated',
                    iconURL: client.user.displayAvatarURL()
                })
                .setDescription(`🌐 Language changed from **${oldLanguage}** to **${newLanguage}**`)
                .addFields([
                    {
                        name: '⚠️ Note',
                        value: 'Some features may still be in English as translation is ongoing',
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
            console.error('Language command error:', error);
            
            const errorEmbed = new EmbedBuilder()
                .setColor('#ff0000')
                .setDescription('❌ An error occurred while updating language settings.');

            if (interaction.deferred) {
                await interaction.editReply({ embeds: [errorEmbed] });
            } else {
                await interaction.reply({ embeds: [errorEmbed], ephemeral: true });
            }
        }
    },

    getLanguageName(code) {
        const languages = {
            'en': '🇺🇸 English',
            'es': '🇪🇸 Spanish',
            'fr': '🇫🇷 French',
            'de': '🇩🇪 German',
            'it': '🇮🇹 Italian',
            'pt': '🇵🇹 Portuguese',
            'ru': '🇷🇺 Russian',
            'ja': '🇯🇵 Japanese',
            'ko': '🇰🇷 Korean',
            'zh': '🇨🇳 Chinese'
        };
        return languages[code] || '🇺🇸 English';
    }
};