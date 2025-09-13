import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';

export default {
    data: new SlashCommandBuilder()
        .setName('skip')
        .setDescription('Skip the current track or skip to a specific position')
        .addIntegerOption(option =>
            option
                .setName('position')
                .setDescription('Skip to a specific track position in the queue')
                .setMinValue(1)
                .setRequired(false)
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

    /**
     * Execute the skip command
     * @param {import('discord.js').ChatInputCommandInteraction} interaction 
     * @param {import('../../index.js').default} client 
     */
    async execute(interaction, client) {
        try {
            const player = client.kazagumo.players.get(interaction.guild.id);
            
            if (!player || !player.queue.current) {
                return await interaction.reply({
                    embeds: [
                        new EmbedBuilder()
                            .setColor('#ff0000')
                            .setDescription('❌ There is no music playing in this server!')
                    ],
                    ephemeral: true
                });
            }

            const position = interaction.options.getInteger('position');
            const currentTrack = player.queue.current;

            // Skip to specific position
            if (position) {
                if (position > player.queue.size) {
                    return await interaction.reply({
                        embeds: [
                            new EmbedBuilder()
                                .setColor('#ff0000')
                                .setDescription(`❌ Invalid position! The queue only has ${player.queue.size} tracks.`)
                        ],
                        ephemeral: true
                    });
                }

                // Remove tracks before the target position
                const tracksToRemove = position - 1;
                for (let i = 0; i < tracksToRemove; i++) {
                    player.queue.remove(0);
                }

                const targetTrack = player.queue[0];
                await player.skip();

                return await interaction.reply({
                    embeds: [
                        new EmbedBuilder()
                            .setColor('#00ff00')
                            .setAuthor({
                                name: 'Track Skipped',
                                iconURL: client.user.displayAvatarURL()
                            })
                            .setDescription(`⏭️ Skipped to position **${position}**`)
                            .addFields([
                                {
                                    name: '🎵 Now Playing',
                                    value: `[${targetTrack.title}](${targetTrack.uri})`,
                                    inline: false
                                },
                                {
                                    name: '👨‍🎤 Artist',
                                    value: targetTrack.author || 'Unknown',
                                    inline: true
                                },
                                {
                                    name: '⏱️ Duration',
                                    value: targetTrack.isStream ? '🔴 Live' : this.formatDuration(targetTrack.length),
                                    inline: true
                                },
                                {
                                    name: '👤 Requested by',
                                    value: targetTrack.requester?.toString() || 'Unknown',
                                    inline: true
                                }
                            ])
                            .setThumbnail(targetTrack.thumbnail)
                            .setTimestamp()
                    ]
                });
            }

            // Regular skip
            const nextTrack = player.queue[0];
            await player.skip();

            const embed = new EmbedBuilder()
                .setColor('#00ff00')
                .setAuthor({
                    name: 'Track Skipped',
                    iconURL: client.user.displayAvatarURL()
                })
                .setDescription(`⏭️ Skipped: **${currentTrack.title}**`)
                .setTimestamp();

            // Add next track info if available
            if (nextTrack) {
                embed.addFields([
                    {
                        name: '🎵 Now Playing',
                        value: `[${nextTrack.title}](${nextTrack.uri})`,
                        inline: false
                    },
                    {
                        name: '👨‍🎤 Artist',
                        value: nextTrack.author || 'Unknown',
                        inline: true
                    },
                    {
                        name: '⏱️ Duration',
                        value: nextTrack.isStream ? '🔴 Live' : this.formatDuration(nextTrack.length),
                        inline: true
                    },
                    {
                        name: '👤 Requested by',
                        value: nextTrack.requester?.toString() || 'Unknown',
                        inline: true
                    }
                ]);

                if (nextTrack.thumbnail) {
                    embed.setThumbnail(nextTrack.thumbnail);
                }
            } else {
                embed.addFields([
                    {
                        name: '📋 Queue Status',
                        value: 'Queue is now empty',
                        inline: false
                    }
                ]);
            }

            await interaction.reply({ embeds: [embed] });

        } catch (error) {
            console.error('Skip command error:', error);
            
            const errorEmbed = new EmbedBuilder()
                .setColor('#ff0000')
                .setDescription('❌ An error occurred while trying to skip the track.');

            if (interaction.deferred) {
                await interaction.editReply({ embeds: [errorEmbed] });
            } else {
                await interaction.reply({ embeds: [errorEmbed], ephemeral: true });
            }
        }
    },

    /**
     * Format duration from milliseconds
     * @param {number} ms 
     * @returns {string}
     */
    formatDuration(ms) {
        const seconds = Math.floor((ms / 1000) % 60);
        const minutes = Math.floor((ms / (1000 * 60)) % 60);
        const hours = Math.floor(ms / (1000 * 60 * 60));

        if (hours > 0) {
            return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        }
        return `${minutes}:${seconds.toString().padStart(2, '0')}`;
    }
};