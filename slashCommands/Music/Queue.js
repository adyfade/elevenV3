import { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } from 'discord.js';

export default {
    data: new SlashCommandBuilder()
        .setName('queue')
        .setDescription('Display the current music queue')
        .addIntegerOption(option =>
            option
                .setName('page')
                .setDescription('Page number to display')
                .setMinValue(1)
                .setRequired(false)
        ),

    category: 'Music',
    cooldown: 5,
    
    permissions: {
        user: [],
        bot: [],
        dj: false
    },

    player: {
        voice: true,
        dj: false,
        active: true,
        djPerm: null
    },

    /**
     * Execute the queue command
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

            const queue = player.queue;
            const currentTrack = queue.current;
            const upcomingTracks = [...queue];

            // If no upcoming tracks, show only current track
            if (upcomingTracks.length === 0) {
                const embed = new EmbedBuilder()
                    .setColor('#3498db')
                    .setAuthor({
                        name: 'Music Queue',
                        iconURL: client.user.displayAvatarURL()
                    })
                    .setTitle('🎵 Now Playing')
                    .setDescription(`[${currentTrack.title}](${currentTrack.uri})`)
                    .setThumbnail(currentTrack.thumbnail)
                    .addFields([
                        {
                            name: '👨‍🎤 Artist',
                            value: currentTrack.author || 'Unknown',
                            inline: true
                        },
                        {
                            name: '⏱️ Duration',
                            value: currentTrack.isStream ? '🔴 Live' : this.formatDuration(currentTrack.length),
                            inline: true
                        },
                        {
                            name: '👤 Requested by',
                            value: currentTrack.requester?.toString() || 'Unknown',
                            inline: true
                        },
                        {
                            name: '🔄 Loop',
                            value: this.getLoopStatus(player.loop),
                            inline: true
                        },
                        {
                            name: '🔊 Volume',
                            value: `${Math.round(player.volume * 100)}%`,
                            inline: true
                        },
                        {
                            name: '⏸️ Status',
                            value: player.paused ? '⏸️ Paused' : '▶️ Playing',
                            inline: true
                        }
                    ])
                    .setFooter({
                        text: `Queue is empty • Use /play to add more tracks`,
                        iconURL: interaction.user.displayAvatarURL()
                    })
                    .setTimestamp();

                return await interaction.reply({ embeds: [embed] });
            }

            // Pagination setup
            const tracksPerPage = 10;
            const totalPages = Math.ceil(upcomingTracks.length / tracksPerPage);
            const requestedPage = interaction.options.getInteger('page') || 1;
            const currentPage = Math.max(1, Math.min(requestedPage, totalPages));

            const startIndex = (currentPage - 1) * tracksPerPage;
            const endIndex = startIndex + tracksPerPage;
            const tracksToShow = upcomingTracks.slice(startIndex, endIndex);

            // Create queue display
            const queueList = tracksToShow.map((track, index) => {
                const position = startIndex + index + 1;
                const duration = track.isStream ? '🔴 Live' : this.formatDuration(track.length);
                const title = track.title.length > 50 ? `${track.title.substring(0, 50)}...` : track.title;
                return `\`${position}.\` [${title}](${track.uri}) - \`${duration}\``;
            }).join('\n');

            // Calculate total duration
            const totalDuration = upcomingTracks.reduce((total, track) => {
                return total + (track.isStream ? 0 : track.length);
            }, 0);

            const embed = new EmbedBuilder()
                .setColor('#3498db')
                .setAuthor({
                    name: 'Music Queue',
                    iconURL: client.user.displayAvatarURL()
                })
                .setTitle('🎵 Now Playing')
                .setDescription(`[${currentTrack.title}](${currentTrack.uri})`)
                .addFields([
                    {
                        name: '📋 Upcoming Tracks',
                        value: queueList || 'No upcoming tracks',
                        inline: false
                    }
                ])
                .setFooter({
                    text: `Page ${currentPage}/${totalPages} • ${upcomingTracks.length} tracks • ${this.formatDuration(totalDuration)} total`,
                    iconURL: interaction.user.displayAvatarURL()
                })
                .setTimestamp();

            // Add current track info
            if (currentTrack.thumbnail) {
                embed.setThumbnail(currentTrack.thumbnail);
            }

            // Create navigation buttons if needed
            const components = [];
            if (totalPages > 1) {
                const row = new ActionRowBuilder()
                    .addComponents(
                        new ButtonBuilder()
                            .setCustomId(`queue_first_${interaction.user.id}`)
                            .setLabel('⏮️ First')
                            .setStyle(ButtonStyle.Secondary)
                            .setDisabled(currentPage === 1),
                        new ButtonBuilder()
                            .setCustomId(`queue_prev_${interaction.user.id}`)
                            .setLabel('◀️ Previous')
                            .setStyle(ButtonStyle.Secondary)
                            .setDisabled(currentPage === 1),
                        new ButtonBuilder()
                            .setCustomId(`queue_page_${interaction.user.id}`)
                            .setLabel(`${currentPage}/${totalPages}`)
                            .setStyle(ButtonStyle.Primary)
                            .setDisabled(true),
                        new ButtonBuilder()
                            .setCustomId(`queue_next_${interaction.user.id}`)
                            .setLabel('Next ▶️')
                            .setStyle(ButtonStyle.Secondary)
                            .setDisabled(currentPage === totalPages),
                        new ButtonBuilder()
                            .setCustomId(`queue_last_${interaction.user.id}`)
                            .setLabel('Last ⏭️')
                            .setStyle(ButtonStyle.Secondary)
                            .setDisabled(currentPage === totalPages)
                    );
                components.push(row);
            }

            const response = await interaction.reply({ 
                embeds: [embed], 
                components,
                fetchReply: true 
            });

            // Handle pagination interactions
            if (totalPages > 1) {
                const collector = response.createMessageComponentCollector({
                    filter: (i) => i.user.id === interaction.user.id && i.customId.includes('queue_'),
                    time: 300000 // 5 minutes
                });

                collector.on('collect', async (i) => {
                    let newPage = currentPage;

                    if (i.customId.includes('first')) newPage = 1;
                    else if (i.customId.includes('prev')) newPage = Math.max(1, currentPage - 1);
                    else if (i.customId.includes('next')) newPage = Math.min(totalPages, currentPage + 1);
                    else if (i.customId.includes('last')) newPage = totalPages;

                    if (newPage !== currentPage) {
                        // Update the interaction with new page
                        const newStartIndex = (newPage - 1) * tracksPerPage;
                        const newEndIndex = newStartIndex + tracksPerPage;
                        const newTracksToShow = upcomingTracks.slice(newStartIndex, newEndIndex);

                        const newQueueList = newTracksToShow.map((track, index) => {
                            const position = newStartIndex + index + 1;
                            const duration = track.isStream ? '🔴 Live' : this.formatDuration(track.length);
                            const title = track.title.length > 50 ? `${track.title.substring(0, 50)}...` : track.title;
                            return `\`${position}.\` [${title}](${track.uri}) - \`${duration}\``;
                        }).join('\n');

                        const newEmbed = EmbedBuilder.from(embed)
                            .setFields([
                                {
                                    name: '📋 Upcoming Tracks',
                                    value: newQueueList || 'No upcoming tracks',
                                    inline: false
                                }
                            ])
                            .setFooter({
                                text: `Page ${newPage}/${totalPages} • ${upcomingTracks.length} tracks • ${this.formatDuration(totalDuration)} total`,
                                iconURL: interaction.user.displayAvatarURL()
                            });

                        const newRow = new ActionRowBuilder()
                            .addComponents(
                                new ButtonBuilder()
                                    .setCustomId(`queue_first_${interaction.user.id}`)
                                    .setLabel('⏮️ First')
                                    .setStyle(ButtonStyle.Secondary)
                                    .setDisabled(newPage === 1),
                                new ButtonBuilder()
                                    .setCustomId(`queue_prev_${interaction.user.id}`)
                                    .setLabel('◀️ Previous')
                                    .setStyle(ButtonStyle.Secondary)
                                    .setDisabled(newPage === 1),
                                new ButtonBuilder()
                                    .setCustomId(`queue_page_${interaction.user.id}`)
                                    .setLabel(`${newPage}/${totalPages}`)
                                    .setStyle(ButtonStyle.Primary)
                                    .setDisabled(true),
                                new ButtonBuilder()
                                    .setCustomId(`queue_next_${interaction.user.id}`)
                                    .setLabel('Next ▶️')
                                    .setStyle(ButtonStyle.Secondary)
                                    .setDisabled(newPage === totalPages),
                                new ButtonBuilder()
                                    .setCustomId(`queue_last_${interaction.user.id}`)
                                    .setLabel('Last ⏭️')
                                    .setStyle(ButtonStyle.Secondary)
                                    .setDisabled(newPage === totalPages)
                            );

                        await i.update({ embeds: [newEmbed], components: [newRow] });
                    } else {
                        await i.deferUpdate();
                    }
                });

                collector.on('end', async () => {
                    try {
                        const disabledRow = ActionRowBuilder.from(components[0]);
                        disabledRow.components.forEach(button => button.setDisabled(true));
                        await response.edit({ components: [disabledRow] });
                    } catch (error) {
                        // Ignore errors when editing expired interactions
                    }
                });
            }

        } catch (error) {
            console.error('Queue command error:', error);
            
            const errorEmbed = new EmbedBuilder()
                .setColor('#ff0000')
                .setDescription('❌ An error occurred while displaying the queue.');

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
    },

    /**
     * Get loop status display
     * @param {string} loopMode 
     * @returns {string}
     */
    getLoopStatus(loopMode) {
        switch (loopMode) {
            case 'track': return '🔂 Track';
            case 'queue': return '🔁 Queue';
            default: return '➡️ Off';
        }
    }
};