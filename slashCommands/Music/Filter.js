import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';

export default {
    data: new SlashCommandBuilder()
        .setName('filter')
        .setDescription('Toggle audio filters')
        .addStringOption(option =>
            option
                .setName('type')
                .setDescription('The filter to apply')
                .setRequired(true)
                .addChoices(
                    { name: 'Bass Boost', value: 'bassboost' },
                    { name: 'Nightcore', value: 'nightcore' },
                    { name: 'Vaporwave', value: 'vaporwave' },
                    { name: '8D Audio', value: '8d' },
                    { name: 'Karaoke', value: 'karaoke' },
                    { name: 'Tremolo', value: 'tremolo' },
                    { name: 'Vibrato', value: 'vibrato' },
                    { name: 'Clear All', value: 'clear' }
                )
        ),

    category: 'Music',
    cooldown: 3,
    
    permissions: {
        user: [],
        bot: [],
        dj: true
    },

    player: {
        voice: true,
        dj: true,
        active: true,
        djPerm: null
    },

    async execute(interaction, client) {
        try {
            const player = client.kazagumo.players.get(interaction.guild.id);
            
            if (!player) {
                return await interaction.reply({
                    embeds: [
                        new EmbedBuilder()
                            .setColor('#ff0000')
                            .setDescription('❌ There is no music playing in this server!')
                    ],
                    ephemeral: true
                });
            }

            const filterType = interaction.options.getString('type');
            
            await interaction.deferReply();

            const filters = {
                bassboost: {
                    equalizer: [
                        { band: 0, gain: 0.2 },
                        { band: 1, gain: 0.15 },
                        { band: 2, gain: 0.1 },
                        { band: 3, gain: 0.05 },
                        { band: 4, gain: 0.0 },
                        { band: 5, gain: -0.05 },
                        { band: 6, gain: -0.1 },
                        { band: 7, gain: -0.1 },
                        { band: 8, gain: -0.1 },
                        { band: 9, gain: -0.1 },
                        { band: 10, gain: -0.1 },
                        { band: 11, gain: -0.1 },
                        { band: 12, gain: -0.1 },
                        { band: 13, gain: -0.1 },
                        { band: 14, gain: -0.1 }
                    ]
                },
                nightcore: {
                    timescale: { speed: 1.2, pitch: 1.2, rate: 1 }
                },
                vaporwave: {
                    timescale: { speed: 0.8, pitch: 0.8, rate: 1 }
                },
                '8d': {
                    rotation: { rotationHz: 0.2 }
                },
                karaoke: {
                    karaoke: {
                        level: 1.0,
                        monoLevel: 1.0,
                        filterBand: 220.0,
                        filterWidth: 100.0
                    }
                },
                tremolo: {
                    tremolo: { frequency: 2.0, depth: 0.5 }
                },
                vibrato: {
                    vibrato: { frequency: 2.0, depth: 0.5 }
                }
            };

            if (filterType === 'clear') {
                await player.setFilters({});
                
                const embed = new EmbedBuilder()
                    .setColor('#00ff00')
                    .setAuthor({
                        name: 'Audio Filters',
                        iconURL: client.user.displayAvatarURL()
                    })
                    .setDescription('🔧 All audio filters have been cleared')
                    .setTimestamp();

                return await interaction.editReply({ embeds: [embed] });
            }

            const filter = filters[filterType];
            if (!filter) {
                return await interaction.editReply({
                    embeds: [
                        new EmbedBuilder()
                            .setColor('#ff0000')
                            .setDescription('❌ Invalid filter type!')
                    ]
                });
            }

            await player.setFilters(filter);

            const embed = new EmbedBuilder()
                .setColor('#00ff00')
                .setAuthor({
                    name: 'Audio Filters',
                    iconURL: client.user.displayAvatarURL()
                })
                .setDescription(`🔧 Applied **${filterType}** filter`)
                .addFields([
                    {
                        name: '⚠️ Note',
                        value: 'Filters may take a few seconds to apply and can affect audio quality.',
                        inline: false
                    }
                ])
                .setTimestamp();

            await interaction.editReply({ embeds: [embed] });

        } catch (error) {
            console.error('Filter command error:', error);
            
            const errorEmbed = new EmbedBuilder()
                .setColor('#ff0000')
                .setDescription('❌ An error occurred while applying the filter.');

            if (interaction.deferred) {
                await interaction.editReply({ embeds: [errorEmbed] });
            } else {
                await interaction.reply({ embeds: [errorEmbed], ephemeral: true });
            }
        }
    }
};