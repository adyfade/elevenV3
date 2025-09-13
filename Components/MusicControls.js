import { EmbedBuilder } from 'discord.js';

export default {
    id: 'music',
    type: 'button',

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

            // Check if user is in the same voice channel
            if (!interaction.member.voice?.channel || 
                interaction.member.voice.channel.id !== player.voiceId) {
                return await interaction.reply({
                    embeds: [
                        new EmbedBuilder()
                            .setColor('#ff0000')
                            .setDescription(`❌ You need to be in <#${player.voiceId}> to use music controls!`)
                    ],
                    ephemeral: true
                });
            }

            const action = interaction.customId.split('_')[1];

            switch (action) {
                case 'pause':
                    if (player.paused) {
                        player.pause(false);
                        await interaction.reply({
                            embeds: [
                                new EmbedBuilder()
                                    .setColor('#00ff00')
                                    .setDescription('▶️ Resumed the music')
                            ],
                            ephemeral: true
                        });
                    } else {
                        player.pause(true);
                        await interaction.reply({
                            embeds: [
                                new EmbedBuilder()
                                    .setColor('#ffaa00')
                                    .setDescription('⏸️ Paused the music')
                            ],
                            ephemeral: true
                        });
                    }
                    break;

                case 'skip':
                    if (player.queue.size === 0) {
                        return await interaction.reply({
                            embeds: [
                                new EmbedBuilder()
                                    .setColor('#ff0000')
                                    .setDescription('❌ No more tracks in the queue!')
                            ],
                            ephemeral: true
                        });
                    }
                    
                    const currentTrack = player.queue.current;
                    await player.skip();
                    
                    await interaction.reply({
                        embeds: [
                            new EmbedBuilder()
                                .setColor('#00ff00')
                                .setDescription(`⏭️ Skipped: **${currentTrack.title}**`)
                        ],
                        ephemeral: true
                    });
                    break;

                case 'stop':
                    player.queue.clear();
                    await player.stop();
                    
                    await interaction.reply({
                        embeds: [
                            new EmbedBuilder()
                                .setColor('#ff0000')
                                .setDescription('⏹️ Stopped the music and cleared the queue')
                        ],
                        ephemeral: true
                    });
                    break;

                case 'queue':
                    if (player.queue.size === 0) {
                        return await interaction.reply({
                            embeds: [
                                new EmbedBuilder()
                                    .setColor('#ffaa00')
                                    .setDescription('📋 The queue is empty!')
                            ],
                            ephemeral: true
                        });
                    }

                    const queueList = player.queue.slice(0, 10).map((track, index) => {
                        const duration = track.isStream ? '🔴 Live' : this.formatDuration(track.length);
                        const title = track.title.length > 40 ? `${track.title.substring(0, 40)}...` : track.title;
                        return `\`${index + 1}.\` [${title}](${track.uri}) - \`${duration}\``;
                    }).join('\n');

                    await interaction.reply({
                        embeds: [
                            new EmbedBuilder()
                                .setColor('#3498db')
                                .setTitle('📋 Queue')
                                .setDescription(queueList)
                                .setFooter({
                                    text: `${player.queue.size} tracks in queue`,
                                    iconURL: interaction.user.displayAvatarURL()
                                })
                        ],
                        ephemeral: true
                    });
                    break;

                case 'previous':
                    if (!player.queue.previous) {
                        return await interaction.reply({
                            embeds: [
                                new EmbedBuilder()
                                    .setColor('#ff0000')
                                    .setDescription('❌ No previous track available!')
                            ],
                            ephemeral: true
                        });
                    }
                    
                    // Implementation depends on your player's previous track functionality
                    await interaction.reply({
                        embeds: [
                            new EmbedBuilder()
                                .setColor('#ffaa00')
                                .setDescription('⏮️ Previous track functionality not implemented yet')
                        ],
                        ephemeral: true
                    });
                    break;

                default:
                    await interaction.reply({
                        content: '❌ Unknown music control action',
                        ephemeral: true
                    });
            }

        } catch (error) {
            console.error('Music controls error:', error);
            
            if (!interaction.replied && !interaction.deferred) {
                await interaction.reply({
                    content: '❌ An error occurred while processing the music control.',
                    ephemeral: true
                });
            }
        }
    },

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